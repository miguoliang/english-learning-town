package handlers

import (
	"database/sql"
	"net/http"
	"time"

	"english-learning-town-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PlayerHandler struct {
	db *sql.DB
}

func NewPlayerHandler(db *sql.DB) *PlayerHandler {
	return &PlayerHandler{db: db}
}

func (h *PlayerHandler) CreatePlayer(c *gin.Context) {
	var req models.CreatePlayerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	player := models.Player{
		ID:              uuid.New().String(),
		Name:            req.Name,
		Gender:          req.Gender,
		Money:           100,
		Level:           1,
		Experience:      0,
		CurrentScenario: "town_center",
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	query := `
		INSERT INTO players (id, name, gender, money, level, experience, current_scenario, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err := h.db.Exec(query, player.ID, player.Name, player.Gender, player.Money,
		player.Level, player.Experience, player.CurrentScenario, player.CreatedAt, player.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create player"})
		return
	}

	c.JSON(http.StatusCreated, player)
}

func (h *PlayerHandler) GetPlayer(c *gin.Context) {
	id := c.Param("id")

	var player models.Player
	query := `
		SELECT id, name, gender, money, level, experience, current_scenario, created_at, updated_at
		FROM players WHERE id = ?
	`

	err := h.db.QueryRow(query, id).Scan(
		&player.ID, &player.Name, &player.Gender, &player.Money,
		&player.Level, &player.Experience, &player.CurrentScenario,
		&player.CreatedAt, &player.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Player not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get player"})
		return
	}

	c.JSON(http.StatusOK, player)
}

func (h *PlayerHandler) UpdatePlayer(c *gin.Context) {
	id := c.Param("id")

	var req models.UpdatePlayerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if player exists
	var exists bool
	err := h.db.QueryRow("SELECT EXISTS(SELECT 1 FROM players WHERE id = ?)", id).Scan(&exists)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Player not found"})
		return
	}

	// Build dynamic update query
	query := `
		UPDATE players SET 
		money = COALESCE(?, money),
		level = COALESCE(?, level),
		experience = COALESCE(?, experience),
		current_scenario = COALESCE(?, current_scenario),
		updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`

	_, err = h.db.Exec(query, req.Money, req.Level, req.Experience, req.CurrentScenario, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update player"})
		return
	}

	// Return updated player
	var player models.Player
	selectQuery := `
		SELECT id, name, gender, money, level, experience, current_scenario, created_at, updated_at
		FROM players WHERE id = ?
	`

	err = h.db.QueryRow(selectQuery, id).Scan(
		&player.ID, &player.Name, &player.Gender, &player.Money,
		&player.Level, &player.Experience, &player.CurrentScenario,
		&player.CreatedAt, &player.UpdatedAt,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get updated player"})
		return
	}

	c.JSON(http.StatusOK, player)
}

func (h *PlayerHandler) GetPlayerStats(c *gin.Context) {
	id := c.Param("id")

	// Check if player exists
	var exists bool
	err := h.db.QueryRow("SELECT EXISTS(SELECT 1 FROM players WHERE id = ?)", id).Scan(&exists)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Player not found"})
		return
	}

	var stats models.PlayerStats
	query := `
		SELECT 
			COUNT(*) as total_interactions,
			SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
			COALESCE(SUM(CASE WHEN money_change > 0 THEN money_change ELSE 0 END), 0) as total_money_earned,
			CASE 
				WHEN COUNT(*) > 0 THEN 
					ROUND((SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)
				ELSE 0
			END as accuracy_percentage
		FROM interactions 
		WHERE player_id = ?
	`

	err = h.db.QueryRow(query, id).Scan(
		&stats.TotalInteractions,
		&stats.CorrectAnswers,
		&stats.TotalMoneyEarned,
		&stats.AccuracyPercentage,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get player stats"})
		return
	}

	c.JSON(http.StatusOK, stats)
}
