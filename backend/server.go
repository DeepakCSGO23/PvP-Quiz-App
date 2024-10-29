package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/rs/cors"

	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Upgrader configures the upgrade from HTTP to Websocket
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// MongoDB client and collection
var client *mongo.Client
var collection *mongo.Collection

// Profile struct to hold profile data (Sign up)
type Profile struct {
	ProfileName     string `json:"profileName"`
	ProfilePassword string `json:"profilePassword"`
}

// Connect to MongoDB and set the quiz database and profile collection
func connectMongoDB() {
	// Load environment variables from .env file
	envErr := godotenv.Load()
	if envErr != nil {
		log.Fatal("Error loading .env file")
	}

	// Get the MongoDB URI from the environment
	uri := os.Getenv("MONGO_CONNECTION_URI")
	if uri == "" {
		log.Fatal("MONGO_URI not set in .env file")
	}
	// Use the SetServerAPIOptions() method to set the Stable API version to 1
	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	opts := options.Client().ApplyURI(uri).SetServerAPIOptions(serverAPI)
	// Create a new client and connect to the server
	var err error
	client, err = mongo.Connect(context.TODO(), opts)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	// Connect to the quiz database and the profile collection
	collection = client.Database("quiz").Collection("profile")

	// Confirm the connection
	fmt.Println("Connected to MongoDB, database: quiz, collection: profile")
}

// Checking if the profile name already exists
func checkProfileNameExists(w http.ResponseWriter, r *http.Request) {
	// Get the profile-name query from the query paramter
	profileName := r.URL.Query().Get("profile-name")
	if profileName == "" {
		http.Error(w, "Missing profile-name parameter", http.StatusBadRequest)
		return
	}
	// Searching for a document with the given profileName in the mongodb collection
	var existingProfile Profile
	projection := options.FindOne().SetProjection(bson.M{"profileName": 1, "_id": 0})
	err := collection.FindOne(context.TODO(), bson.M{"profileName": profileName}, projection).Decode(&existingProfile)
	fmt.Println(existingProfile)
	// Profile name is not taken, so send an OK response
	if err == mongo.ErrNoDocuments {
		w.WriteHeader(http.StatusOK)
		return
	} else if err != nil {
		// Other errors (e.g., database connection issues)
		http.Error(w, "Error checking username", http.StatusInternalServerError)
		return
	}
	// If no error, it means the username exists, so send a conflict response
	// * No need to print to the response writer as we can directly find what is the profile name existence status based on the status code
	w.WriteHeader(http.StatusConflict)
}

// Save profile data to MongoDB
func saveProfile(w http.ResponseWriter, r *http.Request) {
	// Decode the JSON request body into a Profile struct
	var profile Profile
	err := json.NewDecoder(r.Body).Decode(&profile)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	// Insert profile data into MongoDB
	_, err = collection.InsertOne(context.TODO(), bson.M{
		"profileName":     profile.ProfileName,
		"profilePassword": profile.ProfilePassword,
	})
	if err != nil {
		http.Error(w, "Failed to save profile", http.StatusInternalServerError)
		return
	}

	// Success response
	w.WriteHeader(http.StatusCreated)
	fmt.Fprintln(w, "Profile saved successfully")
}

// Handling websocket connections
func handleConnections(w http.ResponseWriter, r *http.Request) {
	// Upgrade initial GET request to websocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer ws.Close()
	// Log and echo the message back to the client
	log.Printf("Client connected!")
	// Infinite loop to keep reading messages
	for {
		messageType, message, err := ws.ReadMessage()
		if err != nil {
			log.Println("Client disconnected")
			break
		}
		// Log and echo the message back to the client
		log.Printf("Received: %s\n", message)
		if err := ws.WriteMessage(messageType, message); err != nil {
			log.Println("Error writing message:", err)
			break
		}
	}
}
func main() {
	// Connect to MongoDB
	connectMongoDB()
	mux := http.NewServeMux()
	// Websocket connection
	mux.HandleFunc("/ws", handleConnections)
	// Setting HTTP endpoint for saving profile data
	mux.HandleFunc("/create-profile", saveProfile)
	// Setting HTTP endpoint for checking profile name
	mux.HandleFunc("/check-profile-name", checkProfileNameExists)
	// Setting up CORS
	handler := cors.Default().Handler(mux)
	// Start the server on port 5000
	fmt.Println("Websocket server started on port 5000")
	err := http.ListenAndServe(":5000", handler)
	if err != nil {
		log.Fatal("ListenAndServe error:", err)
	}
}
