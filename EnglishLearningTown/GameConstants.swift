//
//  GameConstants.swift
//  EnglishLearningTown
//
//  Created by Frank Mi on 2025/11/8.
//

import SpriteKit

/**
 * Centralized constants for the game.
 * Organized into logical groups for easy maintenance and consistency.
 */
struct GameConstants {
    
    // MARK: - Colors
    
    struct Colors {
        // Background colors
        static let gameBackground = SKColor(red: 0.2, green: 0.3, blue: 0.4, alpha: 1.0)
        static let welcomeBackground = SKColor(red: 0.2, green: 0.3, blue: 0.5, alpha: 1.0)
        static let levelSelectionBackground = SKColor(red: 0.2, green: 0.3, blue: 0.5, alpha: 1.0)
        
        // UI colors
        static let white = SKColor.white
        static let lightGray = SKColor.lightGray
        static let darkGray = SKColor.darkGray
        static let yellow = SKColor.yellow
        static let green = SKColor.green
        static let red = SKColor.red
        static let blue = SKColor.blue
        static let orange = SKColor.orange
        
        // Level colors
        struct Level {
            static let a1 = SKColor(red: 0.2, green: 0.7, blue: 0.2, alpha: 1.0) // Green
            static let a2 = SKColor(red: 0.3, green: 0.6, blue: 0.9, alpha: 1.0) // Blue
            static let b1 = SKColor(red: 0.9, green: 0.6, blue: 0.2, alpha: 1.0) // Orange
            static let b2 = SKColor(red: 0.8, green: 0.2, blue: 0.2, alpha: 1.0) // Red
        }
        
        // Button colors
        struct Button {
            static let startGame = SKColor(red: 0.2, green: 0.7, blue: 0.2, alpha: 1.0)
            static let continueButton = SKColor(red: 0.2, green: 0.7, blue: 0.2, alpha: 1.0)
            static let startListening = SKColor(red: 0.2, green: 0.6, blue: 0.9, alpha: 1.0)
            static let stopListening = SKColor(red: 0.9, green: 0.3, blue: 0.3, alpha: 1.0)
            static let showPrompt = SKColor(red: 0.6, green: 0.6, blue: 0.6, alpha: 1.0)
        }
        
        // Card colors
        struct Card {
            static let back = SKColor(red: 0.3, green: 0.5, blue: 0.8, alpha: 1.0)
            static let front = SKColor(red: 0.95, green: 0.95, blue: 0.95, alpha: 1.0)
            static let correct = SKColor(red: 0.4, green: 0.8, blue: 0.4, alpha: 1.0)
            static let incorrect = SKColor(red: 0.8, green: 0.4, blue: 0.4, alpha: 1.0)
        }
        
        // Progress bar colors
        struct ProgressBar {
            static let background = SKColor(white: 0.3, alpha: 0.5)
            static let stroke = SKColor(white: 0.5, alpha: 0.8)
            static let fill = SKColor(red: 0.2, green: 0.8, blue: 0.2, alpha: 1.0)
        }
        
        // Completion screen colors
        struct Completion {
            static let overlay = SKColor(white: 0, alpha: 0.7)
            static let scoreText = SKColor.yellow
            static let progressText = SKColor.lightGray
        }
        
        // Status colors
        struct Status {
            static let listening = SKColor.blue
            static let correct = SKColor.green
            static let incorrect = SKColor.red
            static let tryAgain = SKColor.orange
        }
    }
    
    // MARK: - Layout
    
    struct Layout {
        // Card layout
        struct Card {
            static let minWidth: CGFloat = 100
            static let maxWidth: CGFloat = 180
            static let minHeight: CGFloat = 130
            static let maxHeight: CGFloat = 240
            static let aspectRatio: CGFloat = 1.33
            static let spacingRatio: CGFloat = 0.2 // 20% spacing between cards
            static let rowSpacingRatio: CGFloat = 1.1 // 10% spacing between rows
            static let cornerRadius: CGFloat = 10
            static let strokeWidth: CGFloat = 3
        }
        
        // UI spacing
        struct Spacing {
            static let topUISpace: CGFloat = 200
            static let bottomMargin: CGFloat = 40
            static let horizontalPadding: CGFloat = 40
            static let cardVerticalPadding: CGFloat = 0.9 // 90% of available height
        }
        
        // Score label
        struct ScoreLabel {
            static let topOffset: CGFloat = 40
        }
        
        // Combo label
        struct ComboLabel {
            static let topOffset: CGFloat = 100
            static let cardOffset: CGFloat = 120
        }
        
        // Progress bar
        struct ProgressBar {
            static let topOffset: CGFloat = 130
            static let widthRatio: CGFloat = 0.6
            static let height: CGFloat = 20
            static let margin: CGFloat = 4
            static let cornerRadius: CGFloat = 10
            static let progressCornerRadius: CGFloat = 8
            static let strokeWidth: CGFloat = 2
            static let widthMarginRatio: CGFloat = 0.96
            static let minWidth: CGFloat = 2
        }
        
        // Instruction label
        struct InstructionLabel {
            static let topOffset: CGFloat = 160
            static let maxWidthRatio: CGFloat = 0.8
        }
        
        // Buttons
        struct Button {
            struct StartGame {
                static let minWidth: CGFloat = 200
                static let maxWidth: CGFloat = 300
                static let widthRatio: CGFloat = 0.3
                static let minHeight: CGFloat = 60
                static let maxHeight: CGFloat = 80
                static let heightRatio: CGFloat = 0.12
                static let cornerRadius: CGFloat = 12
                static let strokeWidth: CGFloat = 3
            }
            
            struct LevelSelection {
                static let minWidth: CGFloat = 180
                static let maxWidth: CGFloat = 250
                static let widthRatio: CGFloat = 0.25
                static let minHeight: CGFloat = 70
                static let maxHeight: CGFloat = 90
                static let heightRatio: CGFloat = 0.12
                static let spacingRatio: CGFloat = 0.4 // 40% of button height
                static let cornerRadius: CGFloat = 12
                static let strokeWidth: CGFloat = 3
            }
            
            struct Game {
                static let minWidth: CGFloat = 180
                static let maxWidth: CGFloat = 250
                static let widthRatio: CGFloat = 0.25
                static let minHeight: CGFloat = 45
                static let maxHeight: CGFloat = 60
                static let heightRatio: CGFloat = 0.08
                static let cornerRadius: CGFloat = 10
                static let strokeWidth: CGFloat = 3
            }
            
            struct Card {
                static let width: CGFloat = 120
                static let height: CGFloat = 30
                static let cornerRadius: CGFloat = 6
                static let strokeWidth: CGFloat = 2
            }
        }
        
        // Level selection layout
        struct LevelSelection {
            static let topSpaceRatio: CGFloat = 0.25
            static let bottomMarginRatio: CGFloat = 0.1
        }
        
        // Completion screen layout
        struct Completion {
            static let baseSpacingRatio: CGFloat = 0.05 // 5% of screen height
            static let titleYRatio: CGFloat = 0.25
            static let scoreYRatio: CGFloat = 0.18
            static let starYRatio: CGFloat = 0.1
            static let achievementSpacingMin: CGFloat = 100
            static let achievementSpacingRatio: CGFloat = 0.15
        }
        
        // Card internal layout
        struct CardInternal {
            static let questionMarkY: CGFloat = 0
            static let imageSize: CGFloat = 80
            static let imageY: CGFloat = 10
            static let emojiY: CGFloat = 10
            static let questionLabelY: CGFloat = -30
            static let statusLabelY: CGFloat = -55
            static let startButtonY: CGFloat = -80
            static let showPromptButtonY: CGFloat = -115
            static let promptLabelY: CGFloat = -145
            static let starOffset: CGFloat = 30
        }
    }
    
    // MARK: - Typography
    
    struct Typography {
        static let fontName = "Arial"
        static let fontNameBold = "Arial-BoldMT"
        
        // Base font sizes
        struct FontSize {
            static let scoreLabel: CGFloat = 28
            static let comboLabel: CGFloat = 32
            static let instructionLabel: CGFloat = 16
            static let comboText: CGFloat = 36
            static let welcomeTitle: CGFloat = 48
            static let welcomeStatus: CGFloat = 32
            static let welcomeInstruction: CGFloat = 20
            static let levelSelectionTitle: CGFloat = 56
            static let levelSelectionInstruction: CGFloat = 24
            static let levelButton: CGFloat = 36
            static let levelButtonDescription: CGFloat = 14
            static let completionTitle: CGFloat = 48
            static let completionScore: CGFloat = 32
            static let completionStar: CGFloat = 40
            static let completionProgress: CGFloat = 20
            static let cardQuestionMark: CGFloat = 60
            static let cardEmoji: CGFloat = 50
            static let cardQuestion: CGFloat = 16
            static let cardStatus: CGFloat = 14
            static let cardButton: CGFloat = 14
            static let cardPrompt: CGFloat = 11
            static let cardStar: CGFloat = 40
        }
        
        // Responsive font size multipliers
        struct FontMultiplier {
            static let buttonLabel: CGFloat = 0.48
            static let levelButton: CGFloat = 0.45
            static let levelButtonDescription: CGFloat = 0.175
            static let welcomeButton: CGFloat = 0.45
            static let completionTitle: CGFloat = 0.08
            static let completionScore: CGFloat = 0.055
            static let completionStar: CGFloat = 0.07
            static let completionProgress: CGFloat = 0.035
        }
        
        // Responsive font size limits
        struct FontLimit {
            static let completionTitleMax: CGFloat = 48
            static let completionScoreMax: CGFloat = 32
            static let completionStarMax: CGFloat = 40
            static let completionProgressMax: CGFloat = 20
        }
    }
    
    // MARK: - Game Configuration
    
    struct Config {
        // Question counts per level
        struct QuestionCount {
            static let a1: Int = 5
            static let a2: Int = 7
            static let b1: Int = 10
            static let b2: Int = 12
            static let defaultCount: Int = 5
        }
        
        // Card layout
        static let maxCardsPerRow: Int = 5
        
        // Combo system
        struct Combo {
            static let multiplierDivisor: Int = 3
            static let maxMultiplier: Int = 5
            static let sparkleThreshold: Int = 3
        }
        
        // Star rating
        struct StarRating {
            static let maxStars: Int = 3
            static let perfectScoreMultiplier: CGFloat = 1.0
            static let halfScoreMultiplier: CGFloat = 0.5
        }
        
        // Available levels
        static let levels = ["A1", "A2", "B1", "B2"]
    }
    
    // MARK: - Animation Timing
    
    struct AnimationTiming {
        // Transitions
        static let sceneTransitionDuration: TimeInterval = 0.5
        
        // Card flip
        static let cardFlipDuration: TimeInterval = 0.15
        
        // Combo feedback
        static let comboScaleUpDuration: TimeInterval = 0.2
        static let comboScaleDownDuration: TimeInterval = 0.2
        static let comboFadeInDuration: TimeInterval = 0.2
        static let comboMoveUpDuration: TimeInterval = 0.5
        static let comboFadeOutDuration: TimeInterval = 0.3
        
        // Combo label
        static let comboLabelFadeOutDuration: TimeInterval = 0.3
        
        // Progress bar
        static let progressBarUpdateDuration: TimeInterval = 0.3
        
        // Completion screen
        static let starWaitDuration: TimeInterval = 0.3
        static let starFadeInDuration: TimeInterval = 0.5
        static let starScaleDuration: TimeInterval = 0.5
        
        // Card success animation
        static let cardStarScaleUpDuration: TimeInterval = 0.3
        static let cardStarScaleDownDuration: TimeInterval = 0.1
        static let cardStarFadeInDuration: TimeInterval = 0.2
        static let cardPulseUpDuration: TimeInterval = 0.15
        static let cardPulseDownDuration: TimeInterval = 0.15
        
        // Speech recognition delay
        static let speechRecognitionDelay: TimeInterval = 0.1
        static let stopListeningDelay: TimeInterval = 0.5
    }
    
    // MARK: - Animation Values
    
    struct AnimationValues {
        // Combo scale
        static let comboScaleUp: CGFloat = 1.3
        static let comboScaleNormal: CGFloat = 1.0
        
        // Star animation
        static let starInitialScale: CGFloat = 0.5
        static let starFinalScale: CGFloat = 1.0
        static let starBounceScale: CGFloat = 1.2
        
        // Card pulse
        static let cardPulseScale: CGFloat = 1.1
        static let cardNormalScale: CGFloat = 1.0
        
        // Combo move
        static let comboMoveDistance: CGFloat = 30
    }
    
    // MARK: - Z Positions
    
    struct ZPosition {
        static let base: CGFloat = 0
        static let completionOverlay: CGFloat = 100
        static let completionContainer: CGFloat = 101
        static let completionConfetti: CGFloat = 99
    }
    
    // MARK: - Input Keys
    
    struct InputKeys {
        static let escape: UInt16 = 0x35
    }
    
    // MARK: - Level Descriptions
    
    struct LevelDescription {
        static let a1 = "Beginner"
        static let a2 = "Elementary"
        static let b1 = "Intermediate"
        static let b2 = "Upper Intermediate"
    }
    
    // MARK: - Strings
    
    struct Strings {
        static let scorePrefix = "Score: "
        static let comboPrefix = "🔥 COMBO x"
        static let comboSuffix = "!"
        static let comboTextPrefix = "x"
        static let comboTextSuffix = " COMBO!"
        static let levelComplete = "Level Complete!"
        static let finalScore = "Final Score: "
        static let continueButton = "Continue"
        static let startGame = "Start Game"
        static let selectLevel = "Select Your Level"
        static let chooseLevel = "Choose a CEFR level to begin learning"
        static let clickCardInstruction = "Click a card to flip it, then click 'Start Listening'"
        static let sayTheWord = "Say the word"
        static let listening = "Listening..."
        static let correct = "Correct! ✓"
        static let tryAgain = "Try again"
        static let heardPrefix = "Heard: "
        static let startListening = "Start Listening"
        static let stopListening = "Stop Listening"
        static let showPrompt = "Show Prompt"
        static let hidePrompt = "Hide Prompt"
    }
}

