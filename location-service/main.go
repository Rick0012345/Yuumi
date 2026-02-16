package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
	_ "github.com/lib/pq"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Em produção, validar origem
	},
}

var (
	db        *sql.DB
	jwtSecret []byte
	clients   = make(map[*websocket.Conn]ClientInfo) // Mapa de conexões -> Info do Cliente
	broadcast = make(chan LocationUpdate)            // Canal para broadcasts
	mu        sync.Mutex                             // Mutex para proteger clients
)

type ClientInfo struct {
	UserID int
	Role   string
}

type LocationUpdate struct {
	DriverID int     `json:"driverId"`
	Lat      float64 `json:"lat"`
	Lng      float64 `json:"lng"`
}

func main() {
	// Configuração
	jwtSecret = []byte(os.Getenv("JWT_SECRET"))
	if len(jwtSecret) == 0 {
		jwtSecret = []byte("supersecretkey") // Fallback para dev
	}

	dbUrl := os.Getenv("DATABASE_URL")
	var err error
	// Aguardar banco estar pronto (retry simples)
	// Em produção usar healthcheck
	db, err = sql.Open("postgres", dbUrl)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err = db.Ping(); err != nil {
		log.Printf("Aviso: Banco não acessível imediatamente: %v", err)
	}

	// Iniciar servidor
	http.HandleFunc("/ws", handleConnections)
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})
	
	// Goroutine para broadcast
	go handleMessages()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Servidor Location Service iniciado na porta %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	// Obter token da query string
	tokenString := r.URL.Query().Get("token")
	if tokenString == "" {
		http.Error(w, "Token não fornecido", http.StatusUnauthorized)
		return
	}

	// Validar token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de assinatura inválido: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		http.Error(w, "Token inválido", http.StatusUnauthorized)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(w, "Claims inválidos", http.StatusUnauthorized)
		return
	}

	// O ID no JWT pode vir como float64
	var userID int
	if idFloat, ok := claims["id"].(float64); ok {
		userID = int(idFloat)
	} else {
		// Tentar converter de string se necessário
		http.Error(w, "ID do usuário inválido no token", http.StatusUnauthorized)
		return
	}

	role, ok := claims["role"].(string)
	if !ok {
		role = "UNKNOWN"
	}

	// Upgrade para WebSocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Erro no upgrade: %v", err)
		return
	}
	
	// Registrar cliente
	mu.Lock()
	clients[ws] = ClientInfo{UserID: userID, Role: role}
	mu.Unlock()

	log.Printf("Cliente conectado: UserID %d, Role %s", userID, role)

	// Loop de leitura
	defer func() {
		mu.Lock()
		delete(clients, ws)
		mu.Unlock()
		ws.Close()
		log.Printf("Cliente desconectado: UserID %d", userID)
	}()

	for {
		var msg LocationUpdate
		err := ws.ReadJSON(&msg)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Erro na leitura: %v", err)
			}
			break
		}

		// Se for DRIVER, processar localização
		if role == "DRIVER" {
			msg.DriverID = userID // Garantir que o ID é do remetente
			
			// Salvar no banco (assíncrono para não bloquear o loop de leitura)
			go saveLocation(userID, msg.Lat, msg.Lng)
			
			// Enviar para canal de broadcast
			broadcast <- msg
		}
	}
}

func handleMessages() {
	for {
		msg := <-broadcast
		
		mu.Lock()
		for client, info := range clients {
			// Enviar apenas para ADMIN e MANAGER
			if info.Role == "ADMIN" || info.Role == "MANAGER" {
				err := client.WriteJSON(msg)
				if err != nil {
					log.Printf("Erro no envio: %v", err)
					client.Close()
					delete(clients, client)
				}
			}
		}
		mu.Unlock()
	}
}

func saveLocation(driverID int, lat, lng float64) {
	if db == nil {
		return
	}
	
	// Atualizar localização atual do usuário
	// Aspas duplas em "User" porque o Prisma usa Case Sensitive e o Postgres por padrão é lowercase
	_, err := db.Exec(`UPDATE "User" SET "currentLat" = $1, "currentLng" = $2, "lastLocationUpdate" = NOW() WHERE id = $3`, lat, lng, driverID)
	if err != nil {
		log.Printf("Erro ao atualizar localização atual: %v", err)
	}

	// Inserir no histórico
	_, err = db.Exec(`INSERT INTO "LocationHistory" ("driverId", lat, lng, timestamp) VALUES ($1, $2, $3, NOW())`, driverID, lat, lng)
	if err != nil {
		log.Printf("Erro ao salvar histórico: %v", err)
	}
}
