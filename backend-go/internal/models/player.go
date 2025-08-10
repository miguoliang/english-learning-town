package models

import (
	"time"
)

type Player struct {
	ID              string    `json:"id" db:"id"`
	Name            string    `json:"name" db:"name"`
	Gender          string    `json:"gender" db:"gender"`
	Money           int       `json:"money" db:"money"`
	Level           int       `json:"level" db:"level"`
	Experience      int       `json:"experience" db:"experience"`
	CurrentScenario string    `json:"current_scenario" db:"current_scenario"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
}

type CreatePlayerRequest struct {
	Name   string `json:"name" binding:"required"`
	Gender string `json:"gender" binding:"required,oneof=male female"`
}

type UpdatePlayerRequest struct {
	Money           *int    `json:"money,omitempty"`
	Level           *int    `json:"level,omitempty"`
	Experience      *int    `json:"experience,omitempty"`
	CurrentScenario *string `json:"current_scenario,omitempty"`
}

type PlayerStats struct {
	TotalInteractions  int     `json:"total_interactions"`
	CorrectAnswers     int     `json:"correct_answers"`
	TotalMoneyEarned   int     `json:"total_money_earned"`
	AccuracyPercentage float64 `json:"accuracy_percentage"`
}
