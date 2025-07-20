# English Learning Town - Project Structure

## Architecture Overview
```
┌─────────────────┐    HTTP/WebSocket    ┌──────────────────┐
│   Game Client   │ ←──────────────────→ │   Go Backend     │
│   (Phaser.js)   │                      │   (REST API)     │
└─────────────────┘                      └──────────────────┘
                                                    │
                                                    ▼
                                         ┌──────────────────┐
                                         │    Database      │
                                         │ (SQLite/Postgres)│
                                         └──────────────────┘
```

## Game Mechanics
1. **Character Creation**: Choose gender, name
2. **Town Exploration**: Walk around 2D map with NPCs
3. **Tourist Interactions**: Random encounters with English Q&A
4. **Progression System**: 
   - Correct answers = money earned
   - Wrong answers = money lost
   - Town grows as player progresses
5. **Cross-Platform**: Web, mobile app, desktop

## Backend API Endpoints
- `POST /api/player/create` - Create new player
- `GET /api/player/{id}` - Get player data
- `PUT /api/player/{id}` - Update player progress
- `GET /api/questions` - Get random English questions
- `POST /api/interactions` - Log player interactions
- `GET /api/town/state` - Get current town state

## Database Schema
```sql
-- Players table
CREATE TABLE players (
    id UUID PRIMARY KEY,
    name VARCHAR(50),
    gender VARCHAR(10),
    money INTEGER DEFAULT 100,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP
);

-- Questions table  
CREATE TABLE questions (
    id UUID PRIMARY KEY,
    question TEXT,
    options JSONB,
    correct_answer VARCHAR(10),
    difficulty VARCHAR(10),
    reward INTEGER
);

-- Interactions table
CREATE TABLE interactions (
    id UUID PRIMARY KEY,
    player_id UUID REFERENCES players(id),
    question_id UUID REFERENCES questions(id),
    answer VARCHAR(10),
    correct BOOLEAN,
    money_change INTEGER,
    created_at TIMESTAMP
);
```