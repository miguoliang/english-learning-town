package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

type Database struct {
	DB *sql.DB
}

func NewDatabase(dbPath string) (*Database, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	database := &Database{DB: db}

	if err := database.createTables(); err != nil {
		return nil, fmt.Errorf("failed to create tables: %w", err)
	}

	if err := database.seedQuestions(); err != nil {
		log.Printf("Warning: failed to seed questions: %v", err)
	}

	return database, nil
}

func (d *Database) Close() error {
	return d.DB.Close()
}

func (d *Database) createTables() error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS players (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			gender TEXT NOT NULL CHECK(gender IN ('male', 'female')),
			money INTEGER DEFAULT 100,
			level INTEGER DEFAULT 1,
			experience INTEGER DEFAULT 0,
			current_scenario TEXT DEFAULT 'town_center',
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS questions (
			id TEXT PRIMARY KEY,
			question TEXT NOT NULL,
			option_a TEXT NOT NULL,
			option_b TEXT NOT NULL,
			option_c TEXT NOT NULL,
			option_d TEXT NOT NULL,
			correct_answer TEXT NOT NULL,
			difficulty TEXT DEFAULT 'easy',
			reward INTEGER DEFAULT 10,
			category TEXT DEFAULT 'general'
		)`,
		`CREATE TABLE IF NOT EXISTS interactions (
			id TEXT PRIMARY KEY,
			player_id TEXT NOT NULL,
			question_id TEXT NOT NULL,
			selected_answer TEXT NOT NULL,
			is_correct BOOLEAN NOT NULL,
			money_change INTEGER NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (player_id) REFERENCES players(id),
			FOREIGN KEY (question_id) REFERENCES questions(id)
		)`,
	}

	for _, query := range queries {
		if _, err := d.DB.Exec(query); err != nil {
			return fmt.Errorf("failed to execute query: %s, error: %w", query, err)
		}
	}

	return nil
}

func (d *Database) seedQuestions() error {
	// Check if questions already exist
	var count int
	err := d.DB.QueryRow("SELECT COUNT(*) FROM questions").Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		return nil // Questions already seeded
	}

	questions := []struct {
		id, question, a, b, c, d, correct, difficulty, category string
		reward                                                  int
	}{
		{"q1", "What is the past tense of 'go'?", "goed", "went", "gone", "going", "b", "easy", "grammar", 10},
		{"q2", "Which word means 'happy'?", "sad", "angry", "joyful", "tired", "c", "easy", "vocabulary", 10},
		{"q3", "Complete: I ___ to the store yesterday.", "go", "goes", "went", "going", "c", "easy", "grammar", 10},
		{"q4", "What is the plural of 'child'?", "childs", "children", "childes", "child", "b", "medium", "grammar", 15},
		{"q5", "Which word is a synonym for 'big'?", "small", "tiny", "large", "little", "c", "easy", "vocabulary", 10},
	}

	for _, q := range questions {
		_, err := d.DB.Exec(`
			INSERT INTO questions (id, question, option_a, option_b, option_c, option_d, correct_answer, difficulty, category, reward)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`, q.id, q.question, q.a, q.b, q.c, q.d, q.correct, q.difficulty, q.category, q.reward)

		if err != nil {
			return fmt.Errorf("failed to insert question %s: %w", q.id, err)
		}
	}

	return nil
}
