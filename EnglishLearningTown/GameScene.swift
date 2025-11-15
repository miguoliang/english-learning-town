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
        backgroundColor = GameConstants.Colors.gameBackground
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
            return GameConstants.Config.QuestionCount.a1
        case "A2":
            return GameConstants.Config.QuestionCount.a2
        case "B1":
            return GameConstants.Config.QuestionCount.b1
        case "B2":
            return GameConstants.Config.QuestionCount.b2
        default:
            return GameConstants.Config.QuestionCount.defaultCount
        }
    }
    
    private func createScoreLabel() {
        scoreLabel = SKLabelNode(fontNamed: GameConstants.Typography.fontNameBold)
        scoreLabel.text = "\(GameConstants.Strings.scorePrefix)0/\(totalQuestions)"
        scoreLabel.fontSize = GameConstants.Typography.FontSize.scoreLabel
        scoreLabel.fontColor = GameConstants.Colors.white
        scoreLabel.position = CGPoint(x: size.width / 2, y: size.height - GameConstants.Layout.ScoreLabel.topOffset)
        scoreLabel.horizontalAlignmentMode = .center
        scoreLabel.verticalAlignmentMode = .top
        addChild(scoreLabel)
    }
    
    /**
     * Create combo label to display current combo streak.
     * Initially hidden, shown when combo > 0.
     */
    private func createComboLabel() {
        let label = SKLabelNode(fontNamed: GameConstants.Typography.fontNameBold)
        label.text = ""
        label.fontSize = GameConstants.Typography.FontSize.comboLabel
        label.fontColor = GameConstants.Colors.yellow
        label.position = CGPoint(x: size.width / 2, y: size.height - GameConstants.Layout.ComboLabel.topOffset)
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
        let barWidth: CGFloat = size.width * GameConstants.Layout.ProgressBar.widthRatio
        let barHeight: CGFloat = GameConstants.Layout.ProgressBar.height
        let barY: CGFloat = size.height - GameConstants.Layout.ProgressBar.topOffset
        let leftEdge = size.width / 2 - barWidth / 2
        
        // Background bar
        progressBarBackground = SKShapeNode(rectOf: CGSize(width: barWidth, height: barHeight), cornerRadius: GameConstants.Layout.ProgressBar.cornerRadius)
        progressBarBackground.fillColor = GameConstants.Colors.ProgressBar.background
        progressBarBackground.strokeColor = GameConstants.Colors.ProgressBar.stroke
        progressBarBackground.lineWidth = GameConstants.Layout.ProgressBar.strokeWidth
        progressBarBackground.position = CGPoint(x: size.width / 2, y: barY)
        addChild(progressBarBackground)
        
        // Progress bar (starts at 0 width)
        progressBar = SKShapeNode(rectOf: CGSize(width: 0, height: barHeight - GameConstants.Layout.ProgressBar.margin), cornerRadius: GameConstants.Layout.ProgressBar.progressCornerRadius)
        progressBar.fillColor = GameConstants.Colors.ProgressBar.fill
        progressBar.strokeColor = .clear
        // Position at left edge of background bar
        progressBar.position = CGPoint(x: leftEdge, y: barY)
        addChild(progressBar)
    }
    
    private func createInstructionLabel() {
        let instructionLabel = SKLabelNode(fontNamed: GameConstants.Typography.fontName)
        instructionLabel.text = GameConstants.Strings.clickCardInstruction
        instructionLabel.fontSize = GameConstants.Typography.FontSize.instructionLabel
        instructionLabel.fontColor = GameConstants.Colors.lightGray
        instructionLabel.position = CGPoint(x: size.width / 2, y: size.height - GameConstants.Layout.InstructionLabel.topOffset)
        instructionLabel.horizontalAlignmentMode = .center
        instructionLabel.verticalAlignmentMode = .top
        instructionLabel.name = "instructionLabel"
        addChild(instructionLabel)
    }
    
    /**
     * Place vocabulary cards on the screen.
     * Dynamically adjusts layout based on number of cards and screen size.
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
        
        // Calculate card layout based on number of cards and available screen space
        // Reserve space for UI elements at the top (score, combo, progress bar, instruction)
        let topUISpace: CGFloat = GameConstants.Layout.Spacing.topUISpace
        let bottomMargin: CGFloat = GameConstants.Layout.Spacing.bottomMargin
        let availableHeight = size.height - topUISpace - bottomMargin
        
        // Calculate card size based on screen dimensions
        let maxCardsPerRow = min(totalQuestions, GameConstants.Config.maxCardsPerRow)
        let cardsPerRow = min(wordsToUse.count, maxCardsPerRow)
        let numberOfRows = (wordsToUse.count + maxCardsPerRow - 1) / maxCardsPerRow
        
        // Calculate card dimensions to fit screen
        let horizontalPadding: CGFloat = GameConstants.Layout.Spacing.horizontalPadding
        let availableWidth = size.width - horizontalPadding * 2
        let cardSpacingRatio: CGFloat = GameConstants.Layout.Card.spacingRatio
        let cardWidth = (availableWidth / CGFloat(cardsPerRow)) / (1 + cardSpacingRatio)
        let cardHeight = min(cardWidth * GameConstants.Layout.Card.aspectRatio, availableHeight / CGFloat(max(numberOfRows, 1)) * GameConstants.Layout.Spacing.cardVerticalPadding)
        
        // Ensure minimum and maximum card sizes
        let finalCardWidth = max(GameConstants.Layout.Card.minWidth, min(GameConstants.Layout.Card.maxWidth, cardWidth))
        let finalCardHeight = max(GameConstants.Layout.Card.minHeight, min(GameConstants.Layout.Card.maxHeight, cardHeight))
        
        // Calculate spacing based on card size
        let spacing = finalCardWidth * (1 + cardSpacingRatio)
        let rowSpacing = finalCardHeight * GameConstants.Layout.Card.rowSpacingRatio
        
        // Calculate starting positions - center cards vertically in available space
        let totalWidth = CGFloat(cardsPerRow - 1) * spacing
        let startX = (size.width - totalWidth) / 2
        let totalRowsHeight = CGFloat(numberOfRows - 1) * rowSpacing
        let startY = topUISpace + (availableHeight - totalRowsHeight) / 2 + finalCardHeight / 2
        
        for (index, word) in wordsToUse.enumerated() {
            let row = index / maxCardsPerRow
            let col = index % maxCardsPerRow
            
            let card = VocabularyCard(vocabularyWord: word, size: CGSize(width: finalCardWidth, height: finalCardHeight))
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
        case GameConstants.InputKeys.escape: // ESC key - return to level selection
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
            let multiplier = min(1 + (combo / GameConstants.Config.Combo.multiplierDivisor), GameConstants.Config.Combo.maxMultiplier)
            comboLabel.text = "\(GameConstants.Strings.comboPrefix)\(multiplier)\(GameConstants.Strings.comboSuffix)"
            comboLabel.isHidden = false
            
            // Animate combo label
            comboLabel.removeAllActions()
            comboLabel.setScale(GameConstants.AnimationValues.comboScaleNormal)
            comboLabel.alpha = 1.0
            
            let scaleUp = SKAction.scale(to: GameConstants.AnimationValues.comboScaleUp, duration: GameConstants.AnimationTiming.comboScaleUpDuration)
            let scaleDown = SKAction.scale(to: GameConstants.AnimationValues.comboScaleNormal, duration: GameConstants.AnimationTiming.comboScaleDownDuration)
            let pulse = SKAction.sequence([scaleUp, scaleDown])
            comboLabel.run(pulse)
        }
        
        // Create combo text at card position
        let comboText = SKLabelNode(fontNamed: GameConstants.Typography.fontNameBold)
        comboText.text = "\(GameConstants.Strings.comboTextPrefix)\(combo)\(GameConstants.Strings.comboTextSuffix)"
        comboText.fontSize = GameConstants.Typography.FontSize.comboText
        comboText.fontColor = GameConstants.Colors.yellow
        comboText.position = CGPoint(x: position.x, y: position.y + GameConstants.Layout.ComboLabel.cardOffset)
        comboText.horizontalAlignmentMode = .center
        comboText.alpha = 0
        
        addChild(comboText)
        
        // Animate combo text
        let fadeIn = SKAction.fadeIn(withDuration: GameConstants.AnimationTiming.comboFadeInDuration)
        let moveUp = SKAction.moveBy(x: 0, y: GameConstants.AnimationValues.comboMoveDistance, duration: GameConstants.AnimationTiming.comboMoveUpDuration)
        let fadeOut = SKAction.fadeOut(withDuration: GameConstants.AnimationTiming.comboFadeOutDuration)
        let remove = SKAction.removeFromParent()
        let sequence = SKAction.sequence([fadeIn, SKAction.group([moveUp, fadeOut]), remove])
        comboText.run(sequence)
        
        // Add sparkle effect for higher combos
        if combo >= GameConstants.Config.Combo.sparkleThreshold {
            let sparkle = ConfettiEmitter.createSparkle(at: position)
            addChild(sparkle)
        }
    }
    
    /**
     * Hide combo label when combo resets.
     */
    private func hideComboLabel() {
        if let comboLabel = comboLabel {
            let fadeOut = SKAction.fadeOut(withDuration: GameConstants.AnimationTiming.comboLabelFadeOutDuration)
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
            return GameConstants.Config.StarRating.maxStars
        } else if correctAnswers >= Int(CGFloat(totalQuestions) * GameConstants.Config.StarRating.halfScoreMultiplier) {
            return GameConstants.Config.StarRating.maxStars - 1
        } else {
            return GameConstants.Config.StarRating.maxStars - 2
        }
    }
    
    private func showCompletionScreen(starRating: Int, newlyUnlockedAchievements: [Achievement]) {
        // Create overlay background
        let overlay = SKShapeNode(rectOf: size)
        overlay.fillColor = GameConstants.Colors.Completion.overlay
        overlay.strokeColor = .clear
        overlay.position = CGPoint(x: size.width / 2, y: size.height / 2)
        overlay.zPosition = GameConstants.ZPosition.completionOverlay
        addChild(overlay)
        
        // Main completion container
        let container = SKNode()
        container.position = CGPoint(x: size.width / 2, y: size.height / 2)
        container.zPosition = GameConstants.ZPosition.completionContainer
        addChild(container)
        
        // Calculate responsive spacing based on screen height
        let baseSpacing = size.height * GameConstants.Layout.Completion.baseSpacingRatio
        let titleFontSize = min(GameConstants.Typography.FontLimit.completionTitleMax, size.height * GameConstants.Typography.FontMultiplier.completionTitle)
        let scoreFontSize = min(GameConstants.Typography.FontLimit.completionScoreMax, size.height * GameConstants.Typography.FontMultiplier.completionScore)
        let starFontSize = min(GameConstants.Typography.FontLimit.completionStarMax, size.height * GameConstants.Typography.FontMultiplier.completionStar)
        let progressFontSize = min(GameConstants.Typography.FontLimit.completionProgressMax, size.height * GameConstants.Typography.FontMultiplier.completionProgress)
        
        // Title
        let titleLabel = SKLabelNode(fontNamed: GameConstants.Typography.fontNameBold)
        titleLabel.text = GameConstants.Strings.levelComplete
        titleLabel.fontSize = titleFontSize
        titleLabel.fontColor = GameConstants.Colors.white
        titleLabel.position = CGPoint(x: 0, y: size.height * GameConstants.Layout.Completion.titleYRatio)
        container.addChild(titleLabel)
        
        // Score display
        let scoreLabel = SKLabelNode(fontNamed: GameConstants.Typography.fontNameBold)
        scoreLabel.text = "\(GameConstants.Strings.finalScore)\(correctAnswers)/\(totalQuestions)"
        scoreLabel.fontSize = scoreFontSize
        scoreLabel.fontColor = GameConstants.Colors.Completion.scoreText
        scoreLabel.position = CGPoint(x: 0, y: size.height * GameConstants.Layout.Completion.scoreYRatio)
        container.addChild(scoreLabel)
        
        // Star rating display
        let starText = String(repeating: "⭐", count: starRating) + String(repeating: "☆", count: GameConstants.Config.StarRating.maxStars - starRating)
        let starLabel = SKLabelNode(fontNamed: GameConstants.Typography.fontName)
        starLabel.text = starText
        starLabel.fontSize = starFontSize
        starLabel.position = CGPoint(x: 0, y: size.height * GameConstants.Layout.Completion.starYRatio)
        container.addChild(starLabel)
        
        // Animate stars appearing one by one
        starLabel.alpha = 0
        starLabel.setScale(GameConstants.AnimationValues.starInitialScale)
        let starAnimation = SKAction.sequence([
            SKAction.wait(forDuration: GameConstants.AnimationTiming.starWaitDuration),
            SKAction.group([
                SKAction.fadeIn(withDuration: GameConstants.AnimationTiming.starFadeInDuration),
                SKAction.scale(to: GameConstants.AnimationValues.starFinalScale, duration: GameConstants.AnimationTiming.starScaleDuration)
            ])
        ])
        starLabel.run(starAnimation)
        
        // Progress summary
        let stats = ProgressTracker.shared
        let progressText = "Words Mastered: \(stats.getTotalWordsMastered())\nCurrent Streak: \(stats.getCurrentStreak())"
        let progressLabel = SKLabelNode(fontNamed: GameConstants.Typography.fontName)
        progressLabel.text = progressText
        progressLabel.fontSize = progressFontSize
        progressLabel.fontColor = GameConstants.Colors.Completion.progressText
        progressLabel.numberOfLines = 0
        progressLabel.verticalAlignmentMode = .center
        progressLabel.position = CGPoint(x: 0, y: baseSpacing * 2)
        container.addChild(progressLabel)
        
        // Show newly unlocked achievements
        let achievementSpacing = max(GameConstants.Layout.Completion.achievementSpacingMin, size.height * GameConstants.Layout.Completion.achievementSpacingRatio)
        var achievementY: CGFloat = -baseSpacing * 3
        for achievement in newlyUnlockedAchievements {
            let badge = AchievementBadge(achievement: achievement)
            badge.position = CGPoint(x: 0, y: achievementY)
            container.addChild(badge)
            badge.animateAppearance()
            achievementY -= achievementSpacing
        }
        
        // Confetti burst for perfect score
        if correctAnswers == totalQuestions {
            let confetti = ConfettiEmitter.createConfetti(at: CGPoint(x: size.width / 2, y: size.height / 2))
            confetti.zPosition = GameConstants.ZPosition.completionConfetti
            addChild(confetti)
        }
        
        // Continue button
        let continueButton = createButton(text: GameConstants.Strings.continueButton, color: GameConstants.Colors.Button.continueButton)
        continueButton.position = CGPoint(x: 0, y: achievementY - baseSpacing * 2)
        continueButton.name = "continueButton"
        container.addChild(continueButton)
        
        // Store reference to overlay and container for cleanup
        overlay.name = "completionOverlay"
        container.name = "completionContainer"
    }
    
    private func createButton(text: String, color: SKColor) -> SKNode {
        let button = SKNode()
        
        // Calculate responsive button size
        let buttonWidth = min(GameConstants.Layout.Button.Game.maxWidth, max(GameConstants.Layout.Button.Game.minWidth, size.width * GameConstants.Layout.Button.Game.widthRatio))
        let buttonHeight = min(GameConstants.Layout.Button.Game.maxHeight, max(GameConstants.Layout.Button.Game.minHeight, size.height * GameConstants.Layout.Button.Game.heightRatio))
        
        let background = SKShapeNode(rectOf: CGSize(width: buttonWidth, height: buttonHeight), cornerRadius: GameConstants.Layout.Button.Game.cornerRadius)
        background.fillColor = color
        background.strokeColor = GameConstants.Colors.white
        background.lineWidth = GameConstants.Layout.Button.Game.strokeWidth
        button.addChild(background)
        
        let label = SKLabelNode(fontNamed: GameConstants.Typography.fontNameBold)
        label.text = text
        label.fontSize = buttonHeight * GameConstants.Typography.FontMultiplier.buttonLabel
        label.fontColor = GameConstants.Colors.white
        label.verticalAlignmentMode = .center
        button.addChild(label)
        
        return button
    }
    
    /**
     * Update score label display.
     */
    private func updateScore() {
        scoreLabel.text = "\(GameConstants.Strings.scorePrefix)\(correctAnswers)/\(totalQuestions)"
    }
    
    /**
     * Update progress bar to reflect current completion.
     */
    private func updateProgressBar() {
        guard let progressBar = progressBar, let progressBarBackground = progressBarBackground else { return }
        
        let answeredCount = vocabularyCards.filter { $0.isAnswered }.count
        let progress = CGFloat(answeredCount) / CGFloat(totalQuestions)
        let barWidth = progressBarBackground.frame.width * GameConstants.Layout.ProgressBar.widthMarginRatio
        let barHeight = progressBar.frame.height
        let leftEdge = size.width / 2 - barWidth / 2
        let barY = size.height - GameConstants.Layout.ProgressBar.topOffset
        
        // Calculate new width
        let newWidth = max(barWidth * progress, GameConstants.Layout.ProgressBar.minWidth)
        
        // Animate the update
        let currentWidth = progressBar.frame.width
        let duration = GameConstants.AnimationTiming.progressBarUpdateDuration
        
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
            shapeNode.path = CGPath(roundedRect: rect, cornerWidth: GameConstants.Layout.ProgressBar.progressCornerRadius, cornerHeight: GameConstants.Layout.ProgressBar.progressCornerRadius, transform: nil)
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
        
        let levelSelectionScene = SceneFactory.createLevelSelectionScene(size: size)
        let transition = SceneFactory.createTransition()
        view?.presentScene(levelSelectionScene, transition: transition)
    }
}
