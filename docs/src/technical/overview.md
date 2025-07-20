# System Overview

## High-Level Architecture

English Learning Town follows a client-server architecture with clear separation between the game client (Godot) and the backend services (Go). This design enables scalability, maintainability, and cross-platform compatibility.

### Component Diagram

```mermaid
graph TB
    subgraph "Godot Client Application"
        subgraph "UI Layer"
            UI1[MainMenuUI]
            UI2[Dialogs]
            UI3[HUD Elements]
        end
        
        subgraph "Game Logic"
            GL1[GameManager]
            GL2[PlayerController]
            GL3[NPCs]
        end
        
        subgraph "Networking"
            NET1[APIClient]
            NET2[HTTP Requests]
            NET3[Response Parser]
        end
        
        subgraph "Data Layer"
            DATA1[PlayerData]
            DATA2[QuestionData]
        end
        
        subgraph "Scene Management"
            SCENE1[Scene Loader]
            SCENE2[State Manager]
        end
        
        subgraph "Asset Management"
            ASSET1[Resources]
            ASSET2[Audio/Graphics]
        end
    end
    
    subgraph "Go Backend Server"
        subgraph "API Layer"
            API1[HTTP Handlers]
            API2[Middleware]
            API3[Route Config]
        end
        
        subgraph "Business Logic"
            BL1[Game Rules]
            BL2[Validation]
            BL3[Processing]
        end
        
        subgraph "Data Access"
            DA1[Database Queries]
            DA2[ORM Operations]
            DA3[Transactions]
        end
        
        subgraph "Infrastructure"
            INF1[Server Setup]
            INF2[Database Conn]
        end
        
        subgraph "Security"
            SEC1[Authentication]
            SEC2[Authorization]
        end
        
        subgraph "Monitoring"
            MON1[Logging]
            MON2[Health Checks]
        end
    end
    
    subgraph "Database System"
        DB1[Players Table]
        DB2[Questions Table]
        DB3[Interactions Table]
        DB4[Game Sessions Table]
        DB5[Indexes & Constraints]
    end
    
    UI1 --> GL1
    UI2 --> GL1
    UI3 --> GL1
    GL1 --> NET1
    GL2 --> NET1
    GL3 --> NET1
    NET1 --> NET2
    NET2 --> NET3
    DATA1 --> GL1
    DATA2 --> GL1
    SCENE1 --> GL1
    SCENE2 --> GL1
    ASSET1 --> GL1
    ASSET2 --> GL1
    
    NET2 -.->|HTTPS/REST API| API1
    API1 --> BL1
    API2 --> BL1
    API3 --> BL1
    BL1 --> DA1
    BL2 --> DA2
    BL3 --> DA3
    INF1 --> API1
    INF2 --> DA1
    SEC1 --> API1
    SEC2 --> BL1
    MON1 --> API1
    MON2 --> INF1
    
    DA1 --> DB1
    DA1 --> DB2
    DA1 --> DB3
    DA1 --> DB4
    DA2 --> DB5
```

## Data Flow

### Player Authentication Flow
1. **Client**: Player enters credentials in MainMenuUI
2. **Client**: APIClient sends authentication request to backend
3. **Backend**: Validates credentials against database
4. **Backend**: Generates JWT token and returns player data
5. **Client**: GameManager stores token and updates game state
6. **Client**: UI transitions to main game interface

### Question Interaction Flow
1. **Client**: Player encounters NPC or interactive element
2. **Client**: APIClient requests question from backend with difficulty/category
3. **Backend**: Selects appropriate question based on player profile
4. **Backend**: Returns question data to client
5. **Client**: UI displays question to player
6. **Client**: Player submits answer through UI
7. **Client**: APIClient sends answer to backend for validation
8. **Backend**: Processes answer, updates player stats, calculates rewards
9. **Backend**: Returns result with feedback and updated player data
10. **Client**: GameManager updates local state and displays feedback

### Progress Synchronization Flow
1. **Background**: Client periodically syncs progress with backend
2. **Client**: APIClient sends batch updates of local changes
3. **Backend**: Validates and processes updates
4. **Backend**: Returns consolidated player state
5. **Client**: Resolves any conflicts and updates local data

## Technology Decisions

### Why Go for Backend?
- **Performance**: Excellent concurrency support for handling multiple players
- **Simplicity**: Clean, readable code that's easy to maintain
- **Standard Library**: Robust HTTP server and JSON handling built-in
- **Deployment**: Single binary deployment with minimal dependencies
- **Scalability**: Efficient resource usage and horizontal scaling capability

### Why Godot for Client?
- **Cross-Platform**: Single codebase deploys to desktop, mobile, and web
- **2D Focus**: Optimized for 2D game development with excellent tools
- **GDScript**: Python-like scripting language easy for rapid development
- **Open Source**: No licensing fees and active community support
- **Performance**: Efficient rendering and resource management

### Why SQLite/PostgreSQL?
- **SQLite**: Perfect for development with zero configuration
- **PostgreSQL**: Production-ready with advanced features and reliability
- **SQL**: Well-understood query language with extensive ecosystem
- **ACID**: Transaction safety for critical game data
- **Performance**: Excellent read performance for question databases

## Service Boundaries

### Client Responsibilities
- **User Interface**: All visual presentation and user interaction
- **Game Logic**: Local game state management and validation
- **Caching**: Store frequently accessed data locally
- **Input Handling**: Process player actions and translate to API calls
- **Asset Management**: Load and manage game resources efficiently

### Backend Responsibilities
- **Data Persistence**: Authoritative storage of all persistent data
- **Business Rules**: Enforce game rules and learning algorithms
- **Authentication**: Secure player identity and session management
- **Question Selection**: Adaptive difficulty and content recommendation
- **Statistics**: Track and analyze player progress and performance

### Database Responsibilities
- **Data Integrity**: Ensure consistency through constraints and transactions
- **Performance**: Optimized queries through proper indexing
- **Backup**: Regular snapshots for disaster recovery
- **Scalability**: Handle growing data volume and concurrent access

## Communication Protocols

### API Design
- **RESTful**: Resource-based URLs with HTTP verbs
- **JSON**: Structured data exchange format
- **HTTP Status Codes**: Semantic response indication
- **Versioning**: API version in URL path for backward compatibility
- **Documentation**: OpenAPI/Swagger specification

### Error Handling
- **Client Errors (4xx)**: Invalid requests, authentication failures
- **Server Errors (5xx)**: Backend failures, database issues
- **Network Errors**: Connection timeouts, unreachable server
- **Graceful Degradation**: Offline mode for temporary disconnections

### Security Measures
- **HTTPS**: Encrypted communication between client and server
- **JWT Tokens**: Stateless authentication with expiration
- **Rate Limiting**: Prevent abuse and ensure fair resource usage
- **Input Validation**: Sanitize all user input on both client and server
- **SQL Injection Prevention**: Parameterized queries and ORM usage

## Performance Considerations

### Backend Optimization
- **Connection Pooling**: Reuse database connections for efficiency
- **Query Optimization**: Analyze and optimize slow queries
- **Caching**: Redis or in-memory cache for frequently accessed data
- **Indexing**: Strategic database indexes for common query patterns

### Client Optimization
- **Asset Streaming**: Load resources on-demand to reduce startup time
- **Memory Management**: Proper cleanup of unused resources
- **Network Batching**: Combine multiple API calls when possible
- **Local Caching**: Store static content locally with cache invalidation

### Database Optimization
- **Indexing Strategy**: Cover common query patterns without over-indexing
- **Query Analysis**: Use EXPLAIN PLAN to optimize expensive operations
- **Partitioning**: Separate large tables for improved performance
- **Read Replicas**: Scale read operations across multiple database instances