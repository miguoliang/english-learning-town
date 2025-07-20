package main

import (
	"log"
	"os"

	"english-learning-town-backend/internal/database"
	"english-learning-town-backend/internal/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Get database path from environment or use default
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./english_learning_town.db"
	}

	// Initialize database
	db, err := database.NewDatabase(dbPath)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Initialize Gin router
	r := gin.Default()

	// CORS middleware
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	r.Use(cors.New(config))

	// Initialize handlers
	playerHandler := handlers.NewPlayerHandler(db.DB)
	questionHandler := handlers.NewQuestionHandler(db.DB)
	interactionHandler := handlers.NewInteractionHandler(db.DB)
	healthHandler := handlers.NewHealthHandler()

	// Routes
	api := r.Group("/api")
	{
		// Players routes
		players := api.Group("/players")
		{
			players.POST("/", playerHandler.CreatePlayer)
			players.GET("/:id", playerHandler.GetPlayer)
			players.PUT("/:id", playerHandler.UpdatePlayer)
			players.GET("/:id/stats", playerHandler.GetPlayerStats)
		}

		// Questions routes
		questions := api.Group("/questions")
		{
			questions.GET("/", questionHandler.GetAllQuestions)
			questions.GET("/random", questionHandler.GetRandomQuestion)
		}

		// Interactions routes
		interactions := api.Group("/interactions")
		{
			interactions.POST("/", interactionHandler.CreateInteraction)
			interactions.GET("/player/:playerID", interactionHandler.GetPlayerInteractions)
		}
	}

	// Health check
	r.GET("/health", healthHandler.HealthCheck)

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}