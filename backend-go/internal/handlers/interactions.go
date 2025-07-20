package handlers

import (
	"database/sql"
	"net/http"
	"time"

	"english-learning-town-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type InteractionHandler struct {
	db *sql.DB
}

func NewInteractionHandler(db *sql.DB) *InteractionHandler {
	return &InteractionHandler{db: db}
}

func (h *InteractionHandler) CreateInteraction(c *gin.Context) {
	var req CreateInteractionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get the question to check correct answer and reward
	var question models.Question
	questionQuery := `
		SELECT id, correct_answer, reward
		FROM questions WHERE id = ?
	`
	err := h.db.QueryRow(questionQuery, req.QuestionID).Scan(
		&question.ID, &question.CorrectAnswer, &question.Reward,
	)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Question not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get question"})
		return
	}

	// Check if answer is correct
	isCorrect := req.SelectedAnswer == question.CorrectAnswer
	moneyChange := 0
	
	if isCorrect {
		moneyChange = question.Reward
	} else {
		moneyChange = -question.Reward / 2 // Lose half the reward for wrong answer
	}

	// Create interaction record
	interaction := models.Interaction{
		ID:             uuid.New().String(),
		PlayerID:       req.PlayerID,
		QuestionID:     req.QuestionID,
		SelectedAnswer: req.SelectedAnswer,
		IsCorrect:      isCorrect,
		MoneyChange:    moneyChange,
		CreatedAt:      time.Now(),
	}

	insertQuery := `
		INSERT INTO interactions (id, player_id, question_id, selected_answer, is_correct, money_change, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`
	
	_, err = h.db.Exec(insertQuery, interaction.ID, interaction.PlayerID, interaction.QuestionID,
		interaction.SelectedAnswer, interaction.IsCorrect, interaction.MoneyChange, interaction.CreatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create interaction"})
		return
	}

	// Update player money
	updatePlayerQuery := `
		UPDATE players 
		SET money = money + ?, 
		    experience = experience + ?,
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`
	
	experienceGain := 5 // Base experience
	if isCorrect {
		experienceGain = 10
	}
	
	_, err = h.db.Exec(updatePlayerQuery, moneyChange, experienceGain, req.PlayerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update player"})
		return
	}

	// Return interaction result
	result := InteractionResult{
		Interaction:    interaction,
		IsCorrect:      isCorrect,
		MoneyChange:    moneyChange,
		ExperienceGain: experienceGain,
		CorrectAnswer:  question.CorrectAnswer,
	}

	c.JSON(http.StatusCreated, result)
}

func (h *InteractionHandler) GetPlayerInteractions(c *gin.Context) {
	playerID := c.Param("playerID")
	
	query := `
		SELECT i.id, i.player_id, i.question_id, i.selected_answer, i.is_correct, i.money_change, i.created_at,
		       q.question, q.correct_answer, q.difficulty, q.category
		FROM interactions i
		JOIN questions q ON i.question_id = q.id
		WHERE i.player_id = ?
		ORDER BY i.created_at DESC
		LIMIT 50
	`

	rows, err := h.db.Query(query, playerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get interactions"})
		return
	}
	defer rows.Close()

	var interactions []InteractionWithQuestion
	for rows.Next() {
		var interaction InteractionWithQuestion
		err := rows.Scan(
			&interaction.ID, &interaction.PlayerID, &interaction.QuestionID,
			&interaction.SelectedAnswer, &interaction.IsCorrect, &interaction.MoneyChange,
			&interaction.CreatedAt, &interaction.QuestionText, &interaction.CorrectAnswer,
			&interaction.Difficulty, &interaction.Category,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan interaction"})
			return
		}
		interactions = append(interactions, interaction)
	}

	if err = rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process interactions"})
		return
	}

	c.JSON(http.StatusOK, interactions)
}

type CreateInteractionRequest struct {
	PlayerID       string `json:"player_id" binding:"required"`
	QuestionID     string `json:"question_id" binding:"required"`
	SelectedAnswer string `json:"selected_answer" binding:"required,oneof=a b c d"`
}

type InteractionResult struct {
	Interaction    models.Interaction `json:"interaction"`
	IsCorrect      bool               `json:"is_correct"`
	MoneyChange    int                `json:"money_change"`
	ExperienceGain int                `json:"experience_gain"`
	CorrectAnswer  string             `json:"correct_answer"`
}

type InteractionWithQuestion struct {
	ID             string    `json:"id"`
	PlayerID       string    `json:"player_id"`
	QuestionID     string    `json:"question_id"`
	SelectedAnswer string    `json:"selected_answer"`
	IsCorrect      bool      `json:"is_correct"`
	MoneyChange    int       `json:"money_change"`
	CreatedAt      time.Time `json:"created_at"`
	QuestionText   string    `json:"question_text"`
	CorrectAnswer  string    `json:"correct_answer"`
	Difficulty     string    `json:"difficulty"`
	Category       string    `json:"category"`
}