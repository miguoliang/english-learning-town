package models

type Question struct {
	ID            string `json:"id" db:"id"`
	Question      string `json:"question" db:"question"`
	OptionA       string `json:"option_a" db:"option_a"`
	OptionB       string `json:"option_b" db:"option_b"`
	OptionC       string `json:"option_c" db:"option_c"`
	OptionD       string `json:"option_d" db:"option_d"`
	CorrectAnswer string `json:"correct_answer" db:"correct_answer"`
	Difficulty    string `json:"difficulty" db:"difficulty"`
	Reward        int    `json:"reward" db:"reward"`
	Category      string `json:"category" db:"category"`
}
