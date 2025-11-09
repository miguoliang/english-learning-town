//
//  GameScene.swift
//  EnglishLearningTown
//
//  Created by Frank Mi on 2025/11/8.
//

import SpriteKit

class GameScene: SKScene {
    
    var selectedLevel: String = "A1"
    var vocabularyWords: [VocabularyWord] = []
    
    // Game nodes
    private var vocabularyCards: [VocabularyCard] = []
    
    // Score tracking
    private var scoreLabel: SKLabelNode!
    private var correctAnswers: Int = 0
    private var totalQuestions: Int = 3
    
    override func didMove(to view: SKView) {
        setupScene()
        loadVocabularyData()
        createScoreLabel()
        createInstructionLabel()
        placeVocabularyCards()
    }
    
    private func setupScene() {
        backgroundColor = SKColor(red: 0.2, green: 0.3, blue: 0.4, alpha: 1.0)
    }
    
    private func loadVocabularyData() {
        let fileName = "cefr-\(selectedLevel.lowercased())"
        vocabularyWords = CSVParser.parseCSV(fileName: fileName)
        print("Loaded \(vocabularyWords.count) words for level \(selectedLevel)")
    }
    
    private func createScoreLabel() {
        scoreLabel = SKLabelNode(fontNamed: "Arial-BoldMT")
        scoreLabel.text = "Score: 0/\(totalQuestions)"
        scoreLabel.fontSize = 28
        scoreLabel.fontColor = .white
        scoreLabel.position = CGPoint(x: size.width / 2, y: size.height - 40)
        scoreLabel.horizontalAlignmentMode = .center
        scoreLabel.verticalAlignmentMode = .top
        addChild(scoreLabel)
    }
    
    private func createInstructionLabel() {
        let instructionLabel = SKLabelNode(fontNamed: "Arial")
        instructionLabel.text = "Click a card to flip it, then click 'Start Listening'"
        instructionLabel.fontSize = 16
        instructionLabel.fontColor = .lightGray
        instructionLabel.position = CGPoint(x: size.width / 2, y: size.height - 75)
        instructionLabel.horizontalAlignmentMode = .center
        instructionLabel.verticalAlignmentMode = .top
        instructionLabel.name = "instructionLabel"
        addChild(instructionLabel)
    }
    
    private func placeVocabularyCards() {
        let wordsWithEmoji = vocabularyWords.filter { EmojiMapper.hasEmoji(for: $0.englishWord) }
        
        guard !wordsWithEmoji.isEmpty else {
            print("No words with emoji mappings found!")
            return
        }
        
        let shuffledWords = wordsWithEmoji.shuffled()
        let wordsToUse = Array(shuffledWords.prefix(3))
        
        let cardWidth: CGFloat = 150
        let cardHeight: CGFloat = 200
        let spacing: CGFloat = 180
        let startX = (size.width - (CGFloat(wordsToUse.count - 1) * spacing)) / 2
        let yPosition: CGFloat = size.height / 2
        
        for (index, word) in wordsToUse.enumerated() {
            let card = VocabularyCard(vocabularyWord: word, size: CGSize(width: cardWidth, height: cardHeight))
            card.position = CGPoint(x: startX + CGFloat(index) * spacing, y: yPosition)
            card.name = "card_\(index)"
            
            card.onAnswerSelected = { [weak self] isCorrect in
                self?.handleCardAnswer(isCorrect: isCorrect, card: card)
            }
            
            vocabularyCards.append(card)
            addChild(card)
        }
    }
    
    override func keyDown(with event: NSEvent) {
        switch event.keyCode {
        case 0x35: // ESC key - return to level selection
            returnToLevelSelection()
        default:
            break
        }
    }
    
    override func mouseDown(with event: NSEvent) {
        let location = event.location(in: self)
        let nodes = self.nodes(at: location)
        
        // Check for continue button on completion screen
        for node in nodes {
            if node.name == "continueButton" {
                returnToLevelSelection()
                return
            }
        }
        
        for card in vocabularyCards {
            if card.handleButtonClick(at: location) {
                return
            }
        }
        
        for card in vocabularyCards {
            let cardLocation = convert(location, to: card)
            if !card.isFlipped && !card.isAnswered && card.cardBack.contains(cardLocation) {
                card.flip()
                break
            }
        }
    }
    
    private func handleCardAnswer(isCorrect: Bool, card: VocabularyCard) {
        if isCorrect {
            correctAnswers += 1
            // Add confetti effect for correct answer
            let confetti = ConfettiEmitter.createConfetti(at: card.position)
            addChild(confetti)
        }
        updateScore()
        checkGameCompletion()
    }
    
    private func checkGameCompletion() {
        guard vocabularyCards.allSatisfy({ $0.isAnswered }) else { return }
        
        // Record game completion in progress tracker
        ProgressTracker.shared.recordGameCompletion(level: selectedLevel, score: correctAnswers, totalQuestions: totalQuestions)
        
        // Check for new achievements
        let newlyUnlocked = AchievementManager.shared.checkAchievements(
            level: selectedLevel,
            score: correctAnswers,
            totalQuestions: totalQuestions
        )
        
        // Calculate star rating
        let starRating = calculateStarRating()
        
        // Show completion screen
        showCompletionScreen(starRating: starRating, newlyUnlockedAchievements: newlyUnlocked)
    }
    
    private func calculateStarRating() -> Int {
        if correctAnswers == totalQuestions {
            return 3
        } else if correctAnswers >= totalQuestions / 2 {
            return 2
        } else {
            return 1
        }
    }
    
    private func showCompletionScreen(starRating: Int, newlyUnlockedAchievements: [Achievement]) {
        // Create overlay background
        let overlay = SKShapeNode(rectOf: size)
        overlay.fillColor = SKColor(white: 0, alpha: 0.7)
        overlay.strokeColor = .clear
        overlay.position = CGPoint(x: size.width / 2, y: size.height / 2)
        overlay.zPosition = 100
        addChild(overlay)
        
        // Main completion container
        let container = SKNode()
        container.position = CGPoint(x: size.width / 2, y: size.height / 2)
        container.zPosition = 101
        addChild(container)
        
        // Title
        let titleLabel = SKLabelNode(fontNamed: "Arial-BoldMT")
        titleLabel.text = "Level Complete!"
        titleLabel.fontSize = 48
        titleLabel.fontColor = .white
        titleLabel.position = CGPoint(x: 0, y: 200)
        container.addChild(titleLabel)
        
        // Score display
        let scoreLabel = SKLabelNode(fontNamed: "Arial-BoldMT")
        scoreLabel.text = "Final Score: \(correctAnswers)/\(totalQuestions)"
        scoreLabel.fontSize = 32
        scoreLabel.fontColor = .yellow
        scoreLabel.position = CGPoint(x: 0, y: 140)
        container.addChild(scoreLabel)
        
        // Star rating display
        let starText = String(repeating: "⭐", count: starRating) + String(repeating: "☆", count: 3 - starRating)
        let starLabel = SKLabelNode(fontNamed: "Arial")
        starLabel.text = starText
        starLabel.fontSize = 40
        starLabel.position = CGPoint(x: 0, y: 80)
        container.addChild(starLabel)
        
        // Animate stars appearing one by one
        starLabel.alpha = 0
        starLabel.setScale(0.5)
        let starAnimation = SKAction.sequence([
            SKAction.wait(forDuration: 0.3),
            SKAction.group([
                SKAction.fadeIn(withDuration: 0.5),
                SKAction.scale(to: 1.0, duration: 0.5)
            ])
        ])
        starLabel.run(starAnimation)
        
        // Progress summary
        let stats = ProgressTracker.shared
        let progressText = "Words Mastered: \(stats.getTotalWordsMastered())\nCurrent Streak: \(stats.getCurrentStreak())"
        let progressLabel = SKLabelNode(fontNamed: "Arial")
        progressLabel.text = progressText
        progressLabel.fontSize = 20
        progressLabel.fontColor = .lightGray
        progressLabel.numberOfLines = 0
        progressLabel.verticalAlignmentMode = .center
        progressLabel.position = CGPoint(x: 0, y: 20)
        container.addChild(progressLabel)
        
        // Show newly unlocked achievements
        var achievementY: CGFloat = -60
        for achievement in newlyUnlockedAchievements {
            let badge = AchievementBadge(achievement: achievement)
            badge.position = CGPoint(x: 0, y: achievementY)
            container.addChild(badge)
            badge.animateAppearance()
            achievementY -= 120
        }
        
        // Confetti burst for perfect score
        if correctAnswers == totalQuestions {
            let confetti = ConfettiEmitter.createConfetti(at: CGPoint(x: size.width / 2, y: size.height / 2))
            confetti.zPosition = 99
            addChild(confetti)
        }
        
        // Continue button
        let continueButton = createButton(text: "Continue", color: SKColor(red: 0.2, green: 0.7, blue: 0.2, alpha: 1.0))
        continueButton.position = CGPoint(x: 0, y: achievementY - 40)
        continueButton.name = "continueButton"
        container.addChild(continueButton)
        
        // Store reference to overlay and container for cleanup
        overlay.name = "completionOverlay"
        container.name = "completionContainer"
    }
    
    private func createButton(text: String, color: SKColor) -> SKNode {
        let button = SKNode()
        
        let background = SKShapeNode(rectOf: CGSize(width: 200, height: 50), cornerRadius: 10)
        background.fillColor = color
        background.strokeColor = .white
        background.lineWidth = 3
        button.addChild(background)
        
        let label = SKLabelNode(fontNamed: "Arial-BoldMT")
        label.text = text
        label.fontSize = 24
        label.fontColor = .white
        label.verticalAlignmentMode = .center
        button.addChild(label)
        
        return button
    }
    
    private func updateScore() {
        scoreLabel.text = "Score: \(correctAnswers)/\(totalQuestions)"
    }
    
    private func returnToLevelSelection() {
        vocabularyCards.forEach { $0.cleanup() }
        
        // Remove completion screen if present
        childNode(withName: "completionOverlay")?.removeFromParent()
        childNode(withName: "completionContainer")?.removeFromParent()
        
        let levelSelectionScene = LevelSelectionScene(size: size)
        levelSelectionScene.scaleMode = .aspectFill
        
        let transition = SKTransition.fade(withDuration: 0.5)
        view?.presentScene(levelSelectionScene, transition: transition)
    }
}
