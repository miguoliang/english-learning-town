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
        }
        updateScore()
        checkGameCompletion()
    }
    
    private func checkGameCompletion() {
        guard vocabularyCards.allSatisfy({ $0.isAnswered }) else { return }
        
        let completionLabel = SKLabelNode(fontNamed: "Arial-BoldMT")
        completionLabel.text = "All cards flipped! Final Score: \(correctAnswers)/\(totalQuestions)"
        completionLabel.fontSize = 32
        completionLabel.fontColor = .yellow
        completionLabel.position = CGPoint(x: size.width / 2, y: size.height / 2 - 100)
        completionLabel.horizontalAlignmentMode = .center
        addChild(completionLabel)
        
        run(SKAction.sequence([
            SKAction.wait(forDuration: 3.0),
            SKAction.run { [weak self] in
                self?.returnToLevelSelection()
            }
        ]))
    }
    
    private func updateScore() {
        scoreLabel.text = "Score: \(correctAnswers)/\(totalQuestions)"
    }
    
    private func returnToLevelSelection() {
        vocabularyCards.forEach { $0.cleanup() }
        
        let levelSelectionScene = LevelSelectionScene(size: size)
        levelSelectionScene.scaleMode = .aspectFill
        
        let transition = SKTransition.fade(withDuration: 0.5)
        view?.presentScene(levelSelectionScene, transition: transition)
    }
}
