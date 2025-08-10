package models

import (
	"time"
)

type Interaction struct {
	ID             string    `json:"id" db:"id"`
	PlayerID       string    `json:"player_id" db:"player_id"`
	QuestionID     string    `json:"question_id" db:"question_id"`
	SelectedAnswer string    `json:"selected_answer" db:"selected_answer"`
	IsCorrect      bool      `json:"is_correct" db:"is_correct"`
	MoneyChange    int       `json:"money_change" db:"money_change"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
}
