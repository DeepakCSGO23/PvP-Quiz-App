package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/admin"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/dgrijalva/jwt-go"
	"github.com/joho/godotenv"
	"github.com/rs/cors"

	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// JWT Key
var jwtKey = []byte("543jkln543nfgdsk43")

type Credentials struct {
	ProfileName     string `json:"profileName"`
	ProfilePassword string `json:"profilePassword"`
}
type Claims struct {
	ProfileName string `json:"profileName"`
	jwt.StandardClaims
}

// Maximum 10 request in a minute
const (
	requestLimit = 1000

	timeWindow = 60 * time.Second
)

var (
	clientRequests = make(map[string][]time.Time)
	// using Mutex to synchronize access to the map
	/*If there are multiple HTTP request Go's HTTP server will handle multiple requests at the same time so to prevent issues when
	multiple requests are accessing shared resources like a map and to prevent race conditions*/
	mu sync.Mutex
)

// Rate limiter middleware configuration
func rateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		clientIP := r.RemoteAddr
		mu.Lock()
		defer mu.Unlock()

		// Get the current time
		currentTime := time.Now()

		// Fetch the timestamps for the client
		timestamps, exists := clientRequests[clientIP]

		// If no previous requests by this client, allow the request
		if !exists {
			clientRequests[clientIP] = []time.Time{currentTime}
			next.ServeHTTP(w, r)
			return
		}
		// * Checks how many request a user sends in the last 1 minute
		// Clean up old timestamps that are outside the time window
		var validTimestamps []time.Time
		for _, timestamp := range timestamps {
			// Only keep the timestamps within the time window
			if currentTime.Sub(timestamp) < timeWindow {
				validTimestamps = append(validTimestamps, timestamp)
			}
		}

		// If the number of valid timestamps exceeds the rate limit, block the request
		// ! check this later (why can't i send text as response)
		if len(validTimestamps) >= requestLimit {
			http.Error(w, "Rate limit exceeded. Please try atrophiesGained later.", http.StatusTooManyRequests)
			return
		}

		// Add the current request's timestamp to the list of valid timestamps
		validTimestamps = append(validTimestamps, currentTime)

		// Update the client's request timestamps
		clientRequests[clientIP] = validTimestamps

		// Pass it to the next middleware function handler i.e CORS middleware
		next.ServeHTTP(w, r)
	})
}

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

// Profile struct to hold profile data used during Signup and login
type Profile struct {
	ProfileName     string `json:"profileName,omitempty"`
	ProfilePassword string `json:"profilePassword,omitempty"`
	Status          string `json:"status,omitempty"`
	Country         string `json:"country,omitempty"`
	ProfileImageURL string `json:"profileImageURL,omitempty"`
	Trophies        uint16 `json:"trophies,omitempty"`
}

// Achievements struct to hold only the achievements completed so far by the user
type Achievements struct {
	// Achievements field which stores array of elements where each element can be of any type
	Achievements []any `json:"achievements"`
}

// History Item
// ! 2 items as of now
type HistoryItem struct {
	Opponent string `json:"opponent"`
	Result   string `json:"result"`
}

// History struct to hold only the matches completed so far by the user
type History struct {
	History []HistoryItem `json:"history"`
}

// Response struct to hold the JSON response message used during sending json message during login
type Response struct {
	Message string `json:"message,omitempty"`
}

// Structure of message from client triggered when joinging and leaving the websocket server used when clearing the map entries
type Message struct {
	Action string `json:"action"`
	// If there is no roomId key from json just omit it dont create a new field and assign 0 dont do that just omit it
	RoomId                      string   `json:"roomId,omitempty"`
	ProfileName                 string   `json:"profileName"`
	PlayerPoints                []uint16 `json:"playerPoints,omitempty"`
	OpponentName                string   `json:"opponentName,omitempty"`
	OpponentPoints              []uint16 `json:"opponentTotalPoints,omitempty"`
	TimeTaken                   uint16   `json:"timeTaken,omitempty"`
	IsPerfectScore              bool     `json:"isPerfectScore,omitempty"`
	IsLightingReflexesCompleted bool     `json:"isLightingReflexesCompleted,omitempty"`
	IsClutchPerformer           string   `json:"isClutchPerformer,omitempty"`
}

// Defining a struct to hold both the websocket connection and its profile name
// ! changed playerpoints dt
type PlayerInfo struct {
	Connection   *websocket.Conn
	ProfileName  string
	PlayerPoints uint16
}

// A map to store room id as key and array of 2 strings as profile name of two players
var playersInQueue = make(map[string][]PlayerInfo)

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

	// Store Login credentials from user
	var creds Credentials
	// Encode the JSON containing profile name and profile password
	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	profileName := creds.ProfileName
	profilePassword := creds.ProfilePassword

	var profilePasswordInDatabase struct {
		ProfilePassword string `json:"profilePassword"`
	}

	// First checks if the profile exists or not
	err = collection.FindOne(context.TODO(), bson.M{"profileName": profileName}, options.FindOne().SetProjection(bson.M{"profilePassword": 1, "_id": 0})).Decode(&profilePasswordInDatabase)

	// Profile doesn't exists notify the user to correct the profile name or create a new profile
	if err == mongo.ErrNoDocuments {
		http.Error(w, "This Name doesn't exists", http.StatusBadRequest)
		return
	} else if err != nil {
		// Error during the decoding process
		log.Printf("Error during decoding Profile Password!")
		//http.Error(w, "Error during decoding Profile Password!", http.StatusBadRequest)
		return
	}

	// To store profile image url
	var profileImageURL string
	isRetreiveProfileImage := "false"
	// If we want to get the profile image url from cloudinary
	if isRetreiveProfileImage == "true" {
		cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
		cloudAPIKey := os.Getenv("CLOUDINARY_API_KEY")
		cloudSecret := os.Getenv("CLOUDINARY_API_SECRET")
		cld, err := cloudinary.NewFromParams(cloudName, cloudAPIKey, cloudSecret)
		if err != nil {
			http.Error(w, "Failed to initialize Cloudinary", http.StatusInternalServerError)
			return
		}

		// Context for the upload process
		ctx := context.Background()

		// Uploading the image
		res, err := cld.Admin.Asset(ctx, admin.AssetParams{PublicID: fmt.Sprintf("Duel of Wits/%s", profileName)})
		if err != nil {
			fmt.Print("Error when retreiving profile image information")
			return
		}
		profileImageURL = res.SecureURL
		fmt.Printf("profile image url is %v", profileImageURL)
	}

	// Login is successful both the profile name and password is valid
	if profilePassword == profilePasswordInDatabase.ProfilePassword {
		w.Write([]byte("Login Successful"))
	} else {
		w.Write([]byte("Wrong Password"))
	}

}

// Save profile data to MongoDB
func createProfile(w http.ResponseWriter, r *http.Request) {
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
		"trophies":        0,
		"status":          "",
		"country":         "",
		// Initialize achievements as an empty array
		"achievements": []interface{}{},
	})
	if err != nil {
		http.Error(w, "Failed to save profile", http.StatusInternalServerError)
		return
	}

	// Success response
	w.WriteHeader(http.StatusCreated)
	fmt.Fprintln(w, "Profile saved successfully")
}

// For updating profile data
func updateProfileData(w http.ResponseWriter, r *http.Request) {
	// profile variable holds structure data structure
	var profile Profile
	// Decoding request body
	err := json.NewDecoder(r.Body).Decode(&profile)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	// Check if the profileName is provided
	if profile.ProfileName == "" {
		http.Error(w, "profile name is required", http.StatusBadRequest)
		return
	}
	filter := bson.M{"profileName": profile.ProfileName} // Find by profileName
	update := bson.M{
		"$set": bson.M{
			"profileName": profile.ProfileName,
			"status":      profile.Status,
			"country":     profile.Country,
		},
	}
	_, err = collection.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		http.Error(w, "Failed to update profile data", http.StatusInternalServerError)
		return
	}
	// Success response
	w.WriteHeader(http.StatusCreated)
	// Writing response to the response writer
	w.Write([]byte(`{"message":"Profile updated successfully"}`))
}

// For getting leaderboard data
// * USED PROJECTION
func getLeaderboardData(w http.ResponseWriter, r *http.Request) {
	// Setting the options
	opts := options.Find().SetSort(bson.M{"trophies": -1}).SetProjection(bson.M{"profileName": 1, "trophies": 1}).SetLimit(10)
	// Returns the cursor over the matching document
	cursor, err := collection.Find(context.TODO(), bson.M{}, opts)
	if err != nil {
		http.Error(w, "Failed to retrieve leaderboard data", http.StatusInternalServerError)
		return
	}

	var leaderboard []Profile
	// .All method Iterates the cursor and decodes each document into results & the result parameter is a pointer to a slice (leaderboard)
	if err := cursor.All(context.TODO(), &leaderboard); err != nil {
		http.Error(w, "Failed to decode leaderboard data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	// Encode Go structure to JSON
	if err := json.NewEncoder(w).Encode(leaderboard); err != nil {
		http.Error(w, "Failed to encode leaderboard data", http.StatusInternalServerError)
	}
}

// Getting achievements data
func getAchievementData(w http.ResponseWriter, r *http.Request) {
	profileName := r.URL.Query().Get("profileName")
	if profileName == "" {
		http.Error(w, "Missing profile name parameter", http.StatusBadRequest)
	}
	// achievements is a variable to store the document returned from database
	// If the document has multiple fields it's better to use a struct to map them or if the document has only one field we can simply use simple data type like string , int , etc...
	var achievements Achievements
	// DeSerializing or Decoding is the same
	// Decode method converts the mongodb document (BSON Format) into a GO structure represented by achievements
	// Only the fields with matching BSON tags with the Achievements field name will be populated in the decoding process
	err := collection.FindOne(context.TODO(), bson.M{"profileName": profileName}).Decode(&achievements)
	if err != nil {
		http.Error(w, "Failed to find achievement data", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	// Serializing the achievements data into JSON format and writing it to the ResponseWriter
	// First NewEncoder sets up and JSON encoder and the destination where the JSON need to go (Response w in this case)  nd write it to the writer w and Encode performs the actual serialization of the achievements structure
	if err := json.NewEncoder(w).Encode(achievements); err != nil {
		http.Error(w, "Failed to encode achievements data", http.StatusInternalServerError)
		return
	}

}

// Getting History data
// * This is the perfect handler function kindly change the approach of remaining functions (mongodb operations)
// * USED PROJECTION
func getHistoryData(w http.ResponseWriter, r *http.Request) {
	profileName := r.URL.Query().Get("profileName")
	if profileName == "" {
		http.Error(w, "Missing profile name parameter", http.StatusBadRequest)
	}
	var history History
	// Decoding converts the entire BSON document into Go structure
	// So better use projection so less data is loaded in-memory and transfered from database to server
	// So after using projection which gets loads necessary fields in-memory we then decode less no of fields compared to not using a projection which will decode the entire document
	// After getting only the necessary field/fields we decode it to Go structure
	err := collection.FindOne(context.TODO(), bson.M{"profileName": profileName}, options.FindOne().SetProjection(bson.M{"history": 1, "_id": 0})).Decode(&history)
	if err != nil {
		http.Error(w, "Failed to decode history data", http.StatusInternalServerError)
		return
	}
	// Correctly
	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(history); err != nil {
		http.Error(w, "Failed to encode history data", http.StatusInternalServerError)
		return
	}

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
	// Infinite loop to keep reading messages and writing messages back
	for {
		_, message, err := ws.ReadMessage()
		// Client disconnects
		if err != nil {
			log.Println("Client disconnected", err)
			break
		}
		var jsonMessage Message

		if err := json.Unmarshal(message, &jsonMessage); err != nil {
			log.Println("Error parsing message:", err)
		}

		// Successfully parsed the json message from client (can be joining or leaving)
		userPlayerName := jsonMessage.ProfileName

		userAction := jsonMessage.Action

		var matchFound bool = false

		// Ensuring only one goroutine can enter the critical section (match completed) at a time
		var queueLock sync.Mutex
		// Incase the action is join check the queue for any empty room if not create one and add the user to the room
		if userAction == "connect" {
			// Traverse the queue and find a match for the user
			for roomId, players := range playersInQueue {
				// We found a match for the user
				if len(players) == 1 {

					//* We found a opponent now we have to check if the opponent is equally skilled
					//trophyDifference := math.Abs(float64(playerTotalTrophies) - float64(playersInQueue[roomId][0].TotalTrophies))
					// We found a perfect match
					// ! We dont need skill based matching as of now
					playersInQueue[roomId] = append(playersInQueue[roomId], PlayerInfo{Connection: ws, ProfileName: userPlayerName})
					matchFound = true

					// Send confirmation to two users that a match is found
					for i := 0; i < 2; i++ {
						if i == 0 {
							// Send a message to first player in the room that match has been found
							confirmationMessage := []byte(fmt.Sprintf(`{"message":"Match found!","opponent":"%s","roomId":"%s"}`, playersInQueue[roomId][1].ProfileName, roomId))
							if err := playersInQueue[roomId][i].Connection.WriteMessage(websocket.TextMessage, confirmationMessage); err != nil {
								log.Printf("Error sending match confirmation message to user\n")
							}
						} else {
							// Send a message to second player in the room that match has been found
							confirmationMessage := []byte(fmt.Sprintf(`{"message":"Match found!","opponent":"%s","roomId":"%s"}`, playersInQueue[roomId][0].ProfileName, roomId))
							if err := playersInQueue[roomId][i].Connection.WriteMessage(websocket.TextMessage, confirmationMessage); err != nil {
								log.Printf("Error sending match confirmation message to user\n")
							}
						}

					}

				}
			}
			// We didnt found a match all room is filled so create a new room
			if !matchFound {
				// Create a Unique roomid for the user because we cannot find any free room for the user
				roomId, err := generateRandomHex(16)
				if err != nil {
					log.Fatalf("Error generating random value: %v", err)
					return
				}
				playersInQueue[roomId] = append(playersInQueue[roomId], PlayerInfo{Connection: ws, ProfileName: userPlayerName})
			}
		} else if userAction == "disconnect" {
			// When users rage quits or when the game is finished in both cases completely delete the room and pick your winner
			for roomId, playerInfo := range playersInQueue {
				// Make index as _ and player contains array of struct containing user name and websocket address
				for _, player := range playerInfo {
					// Remove the room from the queuing server
					//! I guess the pointer in memory if freed
					if player.ProfileName == userPlayerName {
						delete(playersInQueue, roomId)
					}
				}
			}
		} else if userAction == "player_completed" {
			// The player finishes all the questions and is used to send the player's total points to the opponent
			roomId := jsonMessage.RoomId
			profileName := jsonMessage.ProfileName
			// Receives as array of points

			playerPoints := jsonMessage.PlayerPoints
			// Unmarshal: Converts JSON to a Go data structure (e.g., array, slice, struct).
			// Marshal: Converts a Go data structure to JSON

			// The first player is the one who send the total points to the server
			if playersInQueue[roomId][0].ProfileName == profileName {
				// We know have the total points scored by player1 so send the data to player2
				// * Array of uint16 [0,20,40] -> JSON string [0,20,40]-> Encodede to byte slice (sequence of bytes representing each character in the JSON string using UTF-encoding)
				// * Byte Slice -> String representation -> Use JSON.parse on that string representation to make use of the data . When you receive  the byte slice in your frontend , the browser automatically converts it into a string representation
				if err := playersInQueue[roomId][1].Connection.WriteJSON(playerPoints); err != nil {
					log.Printf("Error sending message to opponent\n")
				} else {
					log.Printf("value send is %v ", playerPoints)
				}
			} else {

				if err := playersInQueue[roomId][0].Connection.WriteJSON(playerPoints); err != nil {
					log.Printf("Error sending message to opponent\n")
				}
			}
		} else if userAction == "match_completed" {
			//* Anyone of the two players winner or loser can hit the server (only one) , only after the match is completed we know who is winner and who is not
			// Locking this section so that only one goroutine can come here at a time
			// If the lock is in use then the goroutine waits until the mutex is available
			// Once the lock is called , the goroutine gains exclusive access to the critical ssection , other goroutines trying to call the lock will wait until the lock is released
			queueLock.Lock()
			// The lock is released when the current goroutine exits the function or completes its processing even if an error occurs or the function returns early
			defer queueLock.Unlock()
			roomId := jsonMessage.RoomId
			playerPoints := jsonMessage.PlayerPoints
			opponentName := jsonMessage.OpponentName
			opponentTotalPoints := jsonMessage.OpponentPoints

			// * Calculated from frontend
			isPerfectScore := jsonMessage.IsPerfectScore

			// * Calculated from frontend
			isLightingReflexesCompleted := jsonMessage.IsLightingReflexesCompleted

			// * Calculated from backend
			// Check if the winner is behind by 40 or more points
			var winner, clutchPerformer string
			totalPoint := playerPoints[len(playerPoints)-1]
			opponentTotalPoint := opponentTotalPoints[len(opponentTotalPoints)-1]

			if totalPoint > opponentTotalPoint {
				winner = userPlayerName
			} else if opponentTotalPoint > totalPoint {
				winner = opponentName
			}

			for i := 0; i < 5; i++ {
				// Opponent is behind by 40 points or more and then won the match
				if playerPoints[i]-opponentTotalPoints[i] > 40 && winner == opponentName {
					clutchPerformer = opponentName
					break
				}
				// Player is behind by 40 points or more and then won the match
				if opponentTotalPoints[i]-playerPoints[i] > 40 && winner == userPlayerName {
					clutchPerformer = userPlayerName
					break
				}
			}

			_, exits := playersInQueue[roomId]
			if exits {
				if totalPoint > opponentTotalPoint {
					updateAchievementData(userPlayerName, isPerfectScore, opponentName, false, isLightingReflexesCompleted, clutchPerformer, w)
				} else if totalPoint < opponentTotalPoint {
					updateAchievementData(opponentName, isPerfectScore, userPlayerName, false, isLightingReflexesCompleted, clutchPerformer, w)
				} else {
					updateAchievementData(userPlayerName, isPerfectScore, opponentName, true, isLightingReflexesCompleted, clutchPerformer, w)
				}
				delete(playersInQueue, roomId)
			}
		}
	}
}

func updateAchievementData(winner string, isPerfectScore bool, loser string, isMatchDrawn bool, isLightingReflexesCompleted bool, clutchPerformer string, w http.ResponseWriter) {

	// IsPerfectScore and IsLightingReflexesCompleted can happen with any player losing or winning player

	var trophiesGained, trophiesLost int16

	// Updating Trophies based on match result
	if isMatchDrawn {
		trophiesGained = 0
		trophiesLost = 0
	} else {
		trophiesGained = 5
		trophiesLost = -3
	}

	// Immeditaley send the response before starting go routines (not get hijacked)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Trophy update request is being processed..."))

	// Go routines is called immediately which creates a new gorountine and runs mongodb operation in the background without blocking the main execution thread
	go func() {
		filter := bson.M{"profileName": winner}
		update := bson.M{
			"$inc": bson.M{
				"trophies": trophiesGained,
			},
		}

		if !isMatchDrawn {
			// Increment Win counter
			update["$inc"] = bson.M{
				"achievements.0": 1,
			}
		}
		// Answered everything right
		if isPerfectScore {
			update["$set"] = bson.M{
				"achievements.1": true,
			}
		}
		// Answered correctly within 3 seconds
		if isLightingReflexesCompleted {
			update["$set"] = bson.M{
				"achievements.2": true,
			}
		}
		// Record the result in history
		// DRAW
		if isMatchDrawn {
			update["$push"] = bson.M{
				"history": bson.M{
					"opponent": loser,
					"result":   "Draw",
				},
			}
		} else {
			// WON
			update["$push"] = bson.M{
				"history": bson.M{
					"opponent": loser,
					"result":   "Won",
				},
			}
		}
		// Clutch Performer can always be the winner if he is coming from a draw here dont accept
		if clutchPerformer != "" && !isMatchDrawn {
			update["$set"] = bson.M{
				"achievements.4": true,
			}
		}
		_, err := collection.UpdateOne(context.TODO(), filter, update)
		if err != nil {
			fmt.Printf("Error when updating trophies")
		}
	}()

	go func() {
		filter := bson.M{"profileName": loser}
		update := bson.M{
			"$inc": bson.M{
				"trophies": trophiesLost,
			},
		}
		// Answered everything right
		if isPerfectScore {
			update["$set"] = bson.M{
				"achievements.1": true,
			}
		}
		// Answered correctly within 3 seconds
		if isLightingReflexesCompleted {
			update["$set"] = bson.M{
				"achievements.2": true,
			}
		}

		// Record the result in history
		// DRAW
		if isMatchDrawn {
			update["$push"] = bson.M{
				"history": bson.M{
					"opponent": winner,
					"result":   "Draw",
				},
			}
		} else {
			// LOST
			update["$push"] = bson.M{
				"history": bson.M{
					"opponent": winner,
					"result":   "Lost",
				},
			}
		}

		_, err := collection.UpdateOne(context.TODO(), filter, update)
		if err != nil {
			fmt.Printf("Error when updating trophies")
		}
	}()

}

func updateProfileImage(w http.ResponseWriter, r *http.Request) {
	// Parsing the multipart form (2mb max size)
	err := r.ParseMultipartForm(2 << 20)
	if err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}
	// Retreiving the file
	file, _, err := r.FormFile("profileImage")
	// Retreiving the profile name
	profileName := r.FormValue("profileName")
	if err != nil {
		http.Error(w, "Error retrieving the file", http.StatusBadRequest)
		return
	}
	// Releases file handle where file handle will consume system resource (file descriptors - used to read,write or manage file without directly manipulating the underlying data structures in the OS)
	defer file.Close()
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	cloudAPIKey := os.Getenv("CLOUDINARY_API_KEY")
	cloudSecret := os.Getenv("CLOUDINARY_API_SECRET")
	// Initializing cloudinary instance
	cld, err := cloudinary.NewFromParams(cloudName, cloudAPIKey, cloudSecret)
	if err != nil {
		fmt.Print("Failed to initialize cloudinary")
		return
	}
	// Context for the upload process
	ctx := context.Background()

	// Uploading the image
	if _, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{
		Folder:   "Duel of Wits",
		PublicID: profileName,
	}); err != nil {
		fmt.Print("Failed to upload image")
		return
	}
	fmt.Printf("Profile image uploaded successfully!\n")
}

// For creating random hex values using crypto module this is the room
func generateRandomHex(length int) (string, error) {
	// Calculate the number of bytes needed
	bytes := length / 2
	if length%2 != 0 {
		bytes++
	}
	// Create a byte slice to hold the random bytes
	randomBytes := make([]byte, bytes)
	// Read random bytes from the crypto/rand source
	if _, err := rand.Read(randomBytes); err != nil {
		return "", err
	}
	// Convert the bytes to a hexadecimal string
	return hex.EncodeToString(randomBytes)[:length], nil
}

func main() {

	// Connect to MongoDB
	connectMongoDB()
	mux := http.NewServeMux()
	// Configure CORS to allow requests from your frontend
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PATCH", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type"},
		AllowCredentials: true,
	})
	// Setting up CORS middleware
	// First Rate limit check then CORS middleware is exeuted
	handler := corsHandler.Handler(mux)

	// Websocket connection
	// Dont add rate limiting middleware for websockets
	mux.HandleFunc("/ws", handleConnections)
	// Setting HTTP endpoint for saving profile data
	// First the CORS Middleware , Rate limiting Middleware then the handler function
	mux.Handle("/create-profile", rateLimitMiddleware(http.HandlerFunc(createProfile)))
	// Setting HTTP endpoint for checking profile name (used to check if the username exists or not while creating account and when during login auth)
	mux.Handle("/check-profile", rateLimitMiddleware(http.HandlerFunc(checkProfileNameExists)))
	// Updating profile data
	mux.Handle("/update-profile-data", rateLimitMiddleware(http.HandlerFunc(updateProfileData)))
	// Getting leaderboard data
	mux.Handle("/leaderboard-data", rateLimitMiddleware(http.HandlerFunc(getLeaderboardData)))
	// For getting achievement data of a user
	mux.Handle("/get-achievement-data", rateLimitMiddleware(http.HandlerFunc(getAchievementData)))
	// For getting history data of a user
	mux.Handle("/get-history-data", rateLimitMiddleware(http.HandlerFunc(getHistoryData)))
	// Run this function to store profile image in cloudinary
	mux.Handle("/update-profile-image", rateLimitMiddleware(http.HandlerFunc(updateProfileImage)))

	// Start the server on port 5000
	fmt.Println("Websocket server started on port 5000")
	err := http.ListenAndServe(":5000", handler)
	if err != nil {
		log.Fatal("ListenAndServe error:", err)
	}
}
