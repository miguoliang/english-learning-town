package handlers

import (
	"database/sql"
	"net/http"

	"english-learning-town-backend/internal/models"

	"github.com/gin-gonic/gin"
)

type QuestionHandler struct {
	db *sql.DB
}

func NewQuestionHandler(db *sql.DB) *QuestionHandler {
	return &QuestionHandler{db: db}
}

func (h *QuestionHandler) GetRandomQuestion(c *gin.Context) {
	difficulty := c.DefaultQuery("difficulty", "easy")
	category := c.DefaultQuery("category", "general")

	var question models.Question
	query := `
		SELECT id, question, option_a, option_b, option_c, option_d, correct_answer, difficulty, reward, category
		FROM questions 
		WHERE difficulty = ? AND category = ?
		ORDER BY RANDOM() 
		LIMIT 1
	`

	err := h.db.QueryRow(query, difficulty, category).Scan(
		&question.ID, &question.Question, &question.OptionA, &question.OptionB,
		&question.OptionC, &question.OptionD, &question.CorrectAnswer,
		&question.Difficulty, &question.Reward, &question.Category,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "No questions found for specified criteria"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get question"})
		return
	}

	c.JSON(http.StatusOK, question)
}

func (h *QuestionHandler) GetAllQuestions(c *gin.Context) {
	difficulty := c.Query("difficulty")
	category := c.Query("category")

	query := `
		SELECT id, question, option_a, option_b, option_c, option_d, correct_answer, difficulty, reward, category
		FROM questions
	`

	args := []interface{}{}
	whereConditions := []string{}

	if difficulty != "" {
		whereConditions = append(whereConditions, "difficulty = ?")
		args = append(args, difficulty)
	}

	if category != "" {
		whereConditions = append(whereConditions, "category = ?")
		args = append(args, category)
	}

	if len(whereConditions) > 0 {
		query += " WHERE "
		for i, condition := range whereConditions {
			if i > 0 {
				query += " AND "
			}
			query += condition
		}
	}

	query += " ORDER BY difficulty, category"

	rows, err := h.db.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get questions"})
		return
	}
	defer rows.Close()

	var questions []models.Question
	for rows.Next() {
		var question models.Question
		err := rows.Scan(
			&question.ID, &question.Question, &question.OptionA, &question.OptionB,
			&question.OptionC, &question.OptionD, &question.CorrectAnswer,
			&question.Difficulty, &question.Reward, &question.Category,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan question"})
			return
		}
		questions = append(questions, question)
	}

	if err = rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process questions"})
		return
	}

	c.JSON(http.StatusOK, questions)
}
