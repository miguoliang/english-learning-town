//
//  GameScene.swift
//  EnglishLearningTown
//
//  Created by Frank Mi on 2025/11/8.
//

import SpriteKit
import GameplayKit

class GameScene: SKScene, SKPhysicsContactDelegate {
    
    var selectedLevel: String = "A1"
    var vocabularyWords: [VocabularyWord] = []
    
    // Game nodes
    private var player: SKSpriteNode!
    private var ground: SKShapeNode!
    private var vocabularyBoxes: [VocabularyBox] = []
    private var currentDialog: VocabularyDialog?
    
    // Score tracking
    private var scoreLabel: SKLabelNode!
    private var correctAnswers: Int = 0
    private var totalQuestions: Int = 0
    
    // Movement
    private var isMovingLeft = false
    private var isMovingRight = false
    private let playerSpeed: CGFloat = 200
    
    // Physics
    private let playerCategory: UInt32 = PhysicsCategory.player
    private let groundCategory: UInt32 = PhysicsCategory.ground
    private let boxCategory: UInt32 = PhysicsCategory.vocabularyBox
    
    override func didMove(to view: SKView) {
        setupScene()
        loadVocabularyData()
        setupPhysics()
        createGround()
        createPlayer()
        createScoreLabel()
        placeVocabularyBoxes()
    }
    
    private func setupScene() {
        backgroundColor = SKColor(red: 0.5, green: 0.7, blue: 0.9, alpha: 1.0)
    }
    
    private func loadVocabularyData() {
        let fileName = "cefr-\(selectedLevel.lowercased())"
        vocabularyWords = CSVParser.parseCSV(fileName: fileName)
        print("Loaded \(vocabularyWords.count) words for level \(selectedLevel)")
    }
    
    private func setupPhysics() {
        physicsWorld.gravity = CGVector(dx: 0, dy: -9.8)
        physicsWorld.contactDelegate = self
    }
    
    private func createGround() {
        let groundHeight: CGFloat = 100
        ground = SKShapeNode(rectOf: CGSize(width: size.width, height: groundHeight))
        ground.fillColor = SKColor(red: 0.4, green: 0.6, blue: 0.3, alpha: 1.0)
        ground.strokeColor = .darkGray
        ground.lineWidth = 2
        ground.position = CGPoint(x: size.width / 2, y: groundHeight / 2)
        
        ground.physicsBody = SKPhysicsBody(rectangleOf: CGSize(width: size.width, height: groundHeight))
        ground.physicsBody?.isDynamic = false
        ground.physicsBody?.categoryBitMask = groundCategory
        
        addChild(ground)
    }
    
    private func createPlayer() {
        // Create simple player sprite
        player = SKSpriteNode(color: .blue, size: CGSize(width: 40, height: 60))
        player.position = CGPoint(x: 100, y: 150)
        
        // Physics body
        player.physicsBody = SKPhysicsBody(rectangleOf: player.size)
        player.physicsBody?.categoryBitMask = playerCategory
        player.physicsBody?.contactTestBitMask = boxCategory
        player.physicsBody?.collisionBitMask = groundCategory
        player.physicsBody?.restitution = 0.0
        player.physicsBody?.friction = 0.5
        
        addChild(player)
    }
    
    private func createScoreLabel() {
        scoreLabel = SKLabelNode(fontNamed: "Arial-BoldMT")
        scoreLabel.text = "Score: 0/0"
        scoreLabel.fontSize = 24
        scoreLabel.fontColor = .white
        scoreLabel.position = CGPoint(x: 100, y: size.height - 50)
        scoreLabel.horizontalAlignmentMode = .left
        addChild(scoreLabel)
    }
    
    private func placeVocabularyBoxes() {
        // Filter words to only those with emoji mappings
        let wordsWithEmoji = vocabularyWords.filter { EmojiMapper.hasEmoji(for: $0.englishWord) }
        
        guard !wordsWithEmoji.isEmpty else {
            print("No words with emoji mappings found!")
            return
        }
        
        // Place boxes on the ground, spaced apart
        let boxWidth: CGFloat = 80
        let boxHeight: CGFloat = 60
        let spacing: CGFloat = 150
        let startX: CGFloat = 200
        let yPosition: CGFloat = 130 // On top of ground
        
        // Use first 10 words with emojis for MVP
        let wordsToUse = Array(wordsWithEmoji.prefix(10))
        totalQuestions = wordsToUse.count
        
        for (index, word) in wordsToUse.enumerated() {
            let box = VocabularyBox(vocabularyWord: word, size: CGSize(width: boxWidth, height: boxHeight))
            box.position = CGPoint(x: startX + CGFloat(index) * spacing, y: yPosition)
            vocabularyBoxes.append(box)
            addChild(box)
        }
    }
    
    override func keyDown(with event: NSEvent) {
        guard currentDialog == nil else { return }
        
        switch event.keyCode {
        case 0x00: // A key
            isMovingLeft = true
        case 0x02: // D key
            isMovingRight = true
        case 0x7B: // Left arrow
            isMovingLeft = true
        case 0x7C: // Right arrow
            isMovingRight = true
        case 0x0D: // W key
            jump()
        case 0x31: // Space bar
            jump()
        case 0x35: // ESC key - return to level selection
            returnToLevelSelection()
        default:
            break
        }
    }
    
    override func keyUp(with event: NSEvent) {
        switch event.keyCode {
        case 0x00: // A key
            isMovingLeft = false
        case 0x02: // D key
            isMovingRight = false
        case 0x7B: // Left arrow
            isMovingLeft = false
        case 0x7C: // Right arrow
            isMovingRight = false
        default:
            break
        }
    }
    
    private func jump() {
        guard currentDialog == nil else { return }
        if let physicsBody = player.physicsBody, physicsBody.velocity.dy == 0 {
            physicsBody.applyImpulse(CGVector(dx: 0, dy: 300))
        }
    }
    
    override func update(_ currentTime: TimeInterval) {
        // Handle player movement
        if let physicsBody = player.physicsBody, currentDialog == nil {
            if isMovingLeft {
                physicsBody.velocity.dx = -playerSpeed
            } else if isMovingRight {
                physicsBody.velocity.dx = playerSpeed
            } else {
                physicsBody.velocity.dx *= 0.9 // Friction
            }
        }
        
        // Keep player in bounds
        if player.position.x < 0 {
            player.position.x = 0
            player.physicsBody?.velocity.dx = 0
        } else if player.position.x > size.width {
            player.position.x = size.width
            player.physicsBody?.velocity.dx = 0
        }
    }
    
    // MARK: - Physics Contact Delegate
    
    func didBegin(_ contact: SKPhysicsContact) {
        guard currentDialog == nil else { return }
        
        var boxNode: VocabularyBox?
        
        if contact.bodyA.categoryBitMask == boxCategory {
            boxNode = contact.bodyA.node as? VocabularyBox
        } else if contact.bodyB.categoryBitMask == boxCategory {
            boxNode = contact.bodyB.node as? VocabularyBox
        }
        
        if let box = boxNode, !box.isCollected {
            showDialog(for: box)
        }
    }
    
    private func showDialog(for box: VocabularyBox) {
        // Stop player movement
        player.physicsBody?.velocity.dx = 0
        isMovingLeft = false
        isMovingRight = false
        
        // Create dialog
        let dialog = VocabularyDialog(vocabularyWord: box.vocabularyWord, allWords: vocabularyWords)
        dialog.position = CGPoint(x: size.width / 2, y: size.height / 2)
        
        dialog.onAnswerSelected = { [weak self] isCorrect in
            self?.handleAnswer(isCorrect: isCorrect, box: box)
        }
        
        currentDialog = dialog
        addChild(dialog)
    }
    
    private func handleAnswer(isCorrect: Bool, box: VocabularyBox) {
        if isCorrect {
            correctAnswers += 1
            // Remove box after a delay
            run(SKAction.sequence([
                SKAction.wait(forDuration: 0.5),
                SKAction.run {
                    box.removeFromParent()
                    box.isCollected = true
                }
            ]))
        }
        
        // Update score
        updateScore()
        
        // Clean up and remove dialog after feedback
        run(SKAction.sequence([
            SKAction.wait(forDuration: 1.5),
            SKAction.run { [weak self] in
                self?.currentDialog?.cleanup()
                self?.currentDialog?.removeFromParent()
                self?.currentDialog = nil
            }
        ]))
    }
    
    private func updateScore() {
        scoreLabel.text = "Score: \(correctAnswers)/\(totalQuestions)"
    }
    
    override func mouseDown(with event: NSEvent) {
        let location = event.location(in: self)
        
        if let dialog = currentDialog {
            if dialog.handleClick(at: location) {
                // Dialog handled the click (cancel button)
                return
            }
        }
    }
    
    private func returnToLevelSelection() {
        let levelSelectionScene = LevelSelectionScene(size: size)
        levelSelectionScene.scaleMode = .aspectFill
        
        let transition = SKTransition.fade(withDuration: 0.5)
        view?.presentScene(levelSelectionScene, transition: transition)
    }
}
