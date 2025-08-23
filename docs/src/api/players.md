# Player Endpoints

Player endpoints manage user accounts, authentication, and player progression data.

## Create Player

### POST /api/players/

Create a new player account.

**Request Body:**

```json
{
  "name": "string (required, 2-50 characters)",
  "gender": "string (required, 'male'|'female'|'other')"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "PlayerName",
    "gender": "male",
    "level": 1,
    "experience": 0,
    "money": 100,
    "current_scenario": "tutorial",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**

- `400` - Name already exists or invalid input
- `422` - Validation errors

---

## Get Player

### GET /api/players/{player_id}

Retrieve player information by ID.

**Parameters:**

- `player_id` (path, required): Player UUID

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "PlayerName",
    "gender": "male",
    "level": 5,
    "experience": 2450,
    "money": 850,
    "current_scenario": "town_exploration",
    "skills": {
      "vocabulary": 45,
      "grammar": 38,
      "reading": 42,
      "listening": 35
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:22:00Z"
  }
}
```

**Error Responses:**

- `404` - Player not found
- `401` - Unauthorized access

---

## Update Player

### PUT /api/players/{player_id}

Update player information and progress.

**Parameters:**

- `player_id` (path, required): Player UUID

**Request Body:**

```json
{
  "level": "integer (optional)",
  "experience": "integer (optional)",
  "money": "integer (optional)",
  "current_scenario": "string (optional)",
  "skills": {
    "vocabulary": "integer (optional, 0-100)",
    "grammar": "integer (optional, 0-100)",
    "reading": "integer (optional, 0-100)",
    "listening": "integer (optional, 0-100)"
  }
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "PlayerName",
    "gender": "male",
    "level": 6,
    "experience": 2650,
    "money": 900,
    "current_scenario": "academic_district",
    "skills": {
      "vocabulary": 48,
      "grammar": 40,
      "reading": 45,
      "listening": 37
    },
    "updated_at": "2024-01-20T15:30:00Z"
  }
}
```

**Error Responses:**

- `400` - Invalid input data
- `404` - Player not found
- `401` - Unauthorized access

---

## Get Player Statistics

### GET /api/players/{player_id}/stats

Retrieve detailed player statistics and progress analytics.

**Parameters:**

- `player_id` (path, required): Player UUID
- `period` (query, optional): Time period for stats ('week', 'month', 'all')

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total_interactions": 156,
    "correct_answers": 124,
    "accuracy_percentage": 79.5,
    "total_money_earned": 2840,
    "questions_by_category": {
      "grammar": {
        "attempted": 45,
        "correct": 38,
        "accuracy": 84.4
      },
      "vocabulary": {
        "attempted": 62,
        "correct": 51,
        "accuracy": 82.3
      },
      "reading": {
        "attempted": 35,
        "correct": 25,
        "accuracy": 71.4
      },
      "culture": {
        "attempted": 14,
        "correct": 10,
        "accuracy": 71.4
      }
    },
    "difficulty_progression": {
      "easy": {
        "attempted": 89,
        "correct": 78,
        "accuracy": 87.6
      },
      "medium": {
        "attempted": 52,
        "correct": 38,
        "accuracy": 73.1
      },
      "hard": {
        "attempted": 15,
        "correct": 8,
        "accuracy": 53.3
      }
    },
    "learning_streak": {
      "current_days": 7,
      "longest_days": 14,
      "last_activity": "2024-01-20T14:22:00Z"
    },
    "time_spent_minutes": 1240,
    "achievements": [
      {
        "id": "first_correct",
        "name": "First Steps",
        "description": "Answer your first question correctly",
        "earned_at": "2024-01-15T10:45:00Z"
      },
      {
        "id": "grammar_novice",
        "name": "Grammar Novice",
        "description": "Answer 25 grammar questions correctly",
        "earned_at": "2024-01-18T16:20:00Z"
      }
    ]
  }
}
```

**Error Responses:**

- `404` - Player not found
- `401` - Unauthorized access

---

## Player Authentication

### POST /api/auth/login

Authenticate player and receive JWT token.

**Request Body:**

```json
{
  "player_id": "uuid (required)"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "token": "jwt_token_string",
    "expires_at": "2024-01-21T10:30:00Z",
    "player": {
      "id": "uuid",
      "name": "PlayerName",
      "level": 5
    }
  }
}
```

**Error Responses:**

- `400` - Invalid player ID format
- `404` - Player not found
- `401` - Authentication failed

---

## Common Error Codes

- `PLAYER_NOT_FOUND` - Specified player does not exist
- `INVALID_PLAYER_ID` - Player ID format is invalid
- `NAME_ALREADY_EXISTS` - Player name is already taken
- `VALIDATION_ERROR` - Request data failed validation
- `UNAUTHORIZED_ACCESS` - Token invalid or expired
- `INSUFFICIENT_PERMISSIONS` - Player lacks required permissions
