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
    
    // Combo system
    private var currentCombo: Int = 0
    private var comboLabel: SKLabelNode?
    
    // Progress tracking
    private var progressBar: SKShapeNode!
    private var progressBarBackground: SKShapeNode!
    
    override func didMove(to view: SKView) {
        setupScene()
        loadVocabularyData()
        // Set question count based on level
        totalQuestions = getQuestionCount(for: selectedLevel)
        createScoreLabel()
        createComboLabel()
        createProgressBar()
        createInstructionLabel()
        placeVocabularyCards()
    }
    
    private func setupScene() {
        backgroundColor = SKColor(red: 0.2, green: 0.3, blue: 0.4, alpha: 1.0)
    }
    
    private func loadVocabularyData() {
        let fileName = "cefr-\(selectedLevel.lowercased())"
        vocabularyWords = VocabularyLoader.loadVocabulary(fileName: fileName)
        print("Loaded \(vocabularyWords.count) words for level \(selectedLevel)")
    }
    
    /**
     * Get the question count based on the selected level.
     * Higher levels have more questions for increased challenge.
     *
     * - Parameter level: The CEFR level (A1, A2, B1, B2)
     * - Returns: Number of questions for this level
     */
    private func getQuestionCount(for level: String) -> Int {
        switch level {
        case "A1":
            return 5
        case "A2":
            return 7
        case "B1":
            return 10
        case "B2":
            return 12
        default:
            return 5
        }
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
    
    /**
     * Create combo label to display current combo streak.
     * Initially hidden, shown when combo > 0.
     */
    private func createComboLabel() {
        let label = SKLabelNode(fontNamed: "Arial-BoldMT")
        label.text = ""
        label.fontSize = 32
        label.fontColor = .yellow
        label.position = CGPoint(x: size.width / 2, y: size.height - 100)
        label.horizontalAlignmentMode = .center
        label.verticalAlignmentMode = .top
        label.isHidden = true
        comboLabel = label
        addChild(label)
    }
    
    /**
     * Create progress bar to show completion progress (X/Y cards completed).
     */
    private func createProgressBar() {
        let barWidth: CGFloat = size.width * 0.6
        let barHeight: CGFloat = 20
        let barY: CGFloat = size.height - 130
        let leftEdge = size.width / 2 - barWidth / 2
        
        // Background bar
        progressBarBackground = SKShapeNode(rectOf: CGSize(width: barWidth, height: barHeight), cornerRadius: 10)
        progressBarBackground.fillColor = SKColor(white: 0.3, alpha: 0.5)
        progressBarBackground.strokeColor = SKColor(white: 0.5, alpha: 0.8)
        progressBarBackground.lineWidth = 2
        progressBarBackground.position = CGPoint(x: size.width / 2, y: barY)
        addChild(progressBarBackground)
        
        // Progress bar (starts at 0 width)
        progressBar = SKShapeNode(rectOf: CGSize(width: 0, height: barHeight - 4), cornerRadius: 8)
        progressBar.fillColor = SKColor(red: 0.2, green: 0.8, blue: 0.2, alpha: 1.0)
        progressBar.strokeColor = .clear
        // Position at left edge of background bar
        progressBar.position = CGPoint(x: leftEdge, y: barY)
        addChild(progressBar)
    }
    
    private func createInstructionLabel() {
        let instructionLabel = SKLabelNode(fontNamed: "Arial")
        instructionLabel.text = "Click a card to flip it, then click 'Start Listening'"
        instructionLabel.fontSize = 16
        instructionLabel.fontColor = .lightGray
        instructionLabel.position = CGPoint(x: size.width / 2, y: size.height - 160)
        instructionLabel.horizontalAlignmentMode = .center
        instructionLabel.verticalAlignmentMode = .top
        instructionLabel.name = "instructionLabel"
        addChild(instructionLabel)
    }
    
    /**
     * Place vocabulary cards on the screen.
     * Dynamically adjusts layout based on number of cards.
     * Uses word pool system to avoid repetition.
     */
    private func placeVocabularyCards() {
        let wordsWithEmoji = vocabularyWords.filter { EmojiMapper.hasEmoji(for: $0.englishWord) }
        
        guard !wordsWithEmoji.isEmpty else {
            print("No words with emoji mappings found!")
            return
        }
        
        // Shuffle and select words - ensure we have enough words
        let shuffledWords = wordsWithEmoji.shuffled()
        let wordsToUse = Array(shuffledWords.prefix(totalQuestions))
        
        if wordsToUse.count != totalQuestions {
            print("Warning: Not enough words with emoji. Need \(totalQuestions), got \(wordsToUse.count)")
            // Fallback: use what we have
        }
        
        // Calculate card layout based on number of cards
        let cardWidth: CGFloat = 150
        let cardHeight: CGFloat = 200
        let spacing: CGFloat = 180
        let maxCardsPerRow = min(totalQuestions, 5) // Max 5 cards per row
        let cardsPerRow = min(wordsToUse.count, maxCardsPerRow)
        let numberOfRows = (wordsToUse.count + maxCardsPerRow - 1) / maxCardsPerRow
        
        // Calculate starting positions
        let totalWidth = CGFloat(cardsPerRow - 1) * spacing
        let startX = (size.width - totalWidth) / 2
        let rowSpacing: CGFloat = 220
        let startY = size.height / 2 + CGFloat(numberOfRows - 1) * rowSpacing / 2
        
        for (index, word) in wordsToUse.enumerated() {
            let row = index / maxCardsPerRow
            let col = index % maxCardsPerRow
            
            let card = VocabularyCard(vocabularyWord: word, size: CGSize(width: cardWidth, height: cardHeight))
            card.position = CGPoint(
                x: startX + CGFloat(col) * spacing,
                y: startY - CGFloat(row) * rowSpacing
            )
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
    
    /**
     * Handle card answer result.
     * Updates score, combo system, and visual feedback.
     *
     * - Parameters:
     *   - isCorrect: Whether the answer was correct
     *   - card: The vocabulary card that was answered
     */
    private func handleCardAnswer(isCorrect: Bool, card: VocabularyCard) {
        if isCorrect {
            correctAnswers += 1
            currentCombo += 1
            
            // Add confetti effect for correct answer
            let confetti = ConfettiEmitter.createConfetti(at: card.position)
            addChild(confetti)
            
            // Show combo feedback if combo > 1
            if currentCombo > 1 {
                showComboFeedback(combo: currentCombo, at: card.position)
            }
        } else {
            // Reset combo on incorrect answer
            if currentCombo > 0 {
                currentCombo = 0
                hideComboLabel()
            }
        }
        
        updateScore()
        updateProgressBar()
        checkGameCompletion()
    }
    
    /**
     * Show combo feedback with visual effects.
     *
     * - Parameters:
     *   - combo: Current combo count
     *   - at: Position to show the combo text
     */
    private func showComboFeedback(combo: Int, at position: CGPoint) {
        // Update combo label
        if let comboLabel = comboLabel {
            let multiplier = min(1 + (combo / 3), 5) // Max 5x multiplier
            comboLabel.text = "🔥 COMBO x\(multiplier)!"
            comboLabel.isHidden = false
            
            // Animate combo label
            comboLabel.removeAllActions()
            comboLabel.setScale(1.0)
            comboLabel.alpha = 1.0
            
            let scaleUp = SKAction.scale(to: 1.3, duration: 0.2)
            let scaleDown = SKAction.scale(to: 1.0, duration: 0.2)
            let pulse = SKAction.sequence([scaleUp, scaleDown])
            comboLabel.run(pulse)
        }
        
        // Create combo text at card position
        let comboText = SKLabelNode(fontNamed: "Arial-BoldMT")
        comboText.text = "x\(combo) COMBO!"
        comboText.fontSize = 36
        comboText.fontColor = .yellow
        comboText.position = CGPoint(x: position.x, y: position.y + 120)
        comboText.horizontalAlignmentMode = .center
        comboText.alpha = 0
        
        addChild(comboText)
        
        // Animate combo text
        let fadeIn = SKAction.fadeIn(withDuration: 0.2)
        let moveUp = SKAction.moveBy(x: 0, y: 30, duration: 0.5)
        let fadeOut = SKAction.fadeOut(withDuration: 0.3)
        let remove = SKAction.removeFromParent()
        let sequence = SKAction.sequence([fadeIn, SKAction.group([moveUp, fadeOut]), remove])
        comboText.run(sequence)
        
        // Add sparkle effect for higher combos
        if combo >= 3 {
            let sparkle = ConfettiEmitter.createSparkle(at: position)
            addChild(sparkle)
        }
    }
    
    /**
     * Hide combo label when combo resets.
     */
    private func hideComboLabel() {
        if let comboLabel = comboLabel {
            let fadeOut = SKAction.fadeOut(withDuration: 0.3)
            comboLabel.run(fadeOut) {
                comboLabel.isHidden = true
                comboLabel.alpha = 1.0
            }
        }
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
    
    /**
     * Update score label display.
     */
    private func updateScore() {
        scoreLabel.text = "Score: \(correctAnswers)/\(totalQuestions)"
    }
    
    /**
     * Update progress bar to reflect current completion.
     */
    private func updateProgressBar() {
        guard let progressBar = progressBar, let progressBarBackground = progressBarBackground else { return }
        
        let answeredCount = vocabularyCards.filter { $0.isAnswered }.count
        let progress = CGFloat(answeredCount) / CGFloat(totalQuestions)
        let barWidth = progressBarBackground.frame.width * 0.96 // Leave small margin
        let barHeight = progressBar.frame.height
        let leftEdge = size.width / 2 - barWidth / 2
        let barY = size.height - 130
        
        // Calculate new width
        let newWidth = max(barWidth * progress, 2) // Minimum 2 pixels wide
        
        // Animate the update
        let currentWidth = progressBar.frame.width
        let duration = 0.3
        
        let animate = SKAction.customAction(withDuration: duration) { node, elapsedTime in
            guard let shapeNode = node as? SKShapeNode else { return }
            let t = min(CGFloat(elapsedTime / duration), 1.0)
            let interpolatedWidth = currentWidth + (newWidth - currentWidth) * t
            
            let rect = CGRect(
                x: leftEdge,
                y: barY - barHeight / 2,
                width: interpolatedWidth,
                height: barHeight
            )
            shapeNode.path = CGPath(roundedRect: rect, cornerWidth: 8, cornerHeight: 8, transform: nil)
        }
        
        progressBar.run(animate)
    }
    
    /**
     * Return to level selection screen.
     * Cleans up all game resources.
     */
    private func returnToLevelSelection() {
        vocabularyCards.forEach { $0.cleanup() }
        
        // Reset combo
        currentCombo = 0
        hideComboLabel()
        
        // Remove completion screen if present
        childNode(withName: "completionOverlay")?.removeFromParent()
        childNode(withName: "completionContainer")?.removeFromParent()
        
        let levelSelectionScene = LevelSelectionScene(size: size)
        levelSelectionScene.scaleMode = .aspectFill
        
        let transition = SKTransition.fade(withDuration: 0.5)
        view?.presentScene(levelSelectionScene, transition: transition)
    }
}
