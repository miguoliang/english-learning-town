//
//  LevelSelectionScene.swift
//  EnglishLearningTown
//
//  Created by Frank Mi on 2025/11/8.
//

import SpriteKit

class LevelSelectionScene: SKScene {
    
    private var titleLabel: SKLabelNode!
    private var instructionLabel: SKLabelNode!
    
    // Available CEFR levels
    private let levels = ["A1", "A2", "B1", "B2"]
    
    override func didMove(to view: SKView) {
        backgroundColor = SKColor(red: 0.2, green: 0.3, blue: 0.5, alpha: 1.0)
        
        setupUI()
        createLevelButtons()
    }
    
    private func setupUI() {
        // Title
        titleLabel = SKLabelNode(fontNamed: "Arial-BoldMT")
        titleLabel.text = "Select Your Level"
        titleLabel.fontSize = 56
        titleLabel.fontColor = .white
        titleLabel.position = CGPoint(x: size.width / 2, y: size.height * 0.8)
        addChild(titleLabel)
        
        // Instruction label
        instructionLabel = SKLabelNode(fontNamed: "Arial")
        instructionLabel.text = "Choose a CEFR level to begin learning"
        instructionLabel.fontSize = 24
        instructionLabel.fontColor = .lightGray
        instructionLabel.position = CGPoint(x: size.width / 2, y: size.height * 0.7)
        addChild(instructionLabel)
    }
    
    private func createLevelButtons() {
        let buttonWidth: CGFloat = 200
        let buttonHeight: CGFloat = 80
        let spacing: CGFloat = 30
        let totalHeight = CGFloat(levels.count) * buttonHeight + CGFloat(levels.count - 1) * spacing
        let startY = size.height * 0.5 + totalHeight / 2 - buttonHeight / 2
        
        for (index, level) in levels.enumerated() {
            let button = createLevelButton(level: level, width: buttonWidth, height: buttonHeight)
            button.position = CGPoint(
                x: size.width / 2,
                y: startY - CGFloat(index) * (buttonHeight + spacing)
            )
            addChild(button)
        }
    }
    
    private func createLevelButton(level: String, width: CGFloat, height: CGFloat) -> SKNode {
        let button = SKNode()
        button.name = "levelButton_\(level)"
        
        // Background
        let background = SKShapeNode(rectOf: CGSize(width: width, height: height), cornerRadius: 12)
        background.fillColor = getLevelColor(for: level)
        background.strokeColor = .white
        background.lineWidth = 3
        button.addChild(background)
        
        // Level label
        let levelLabel = SKLabelNode(fontNamed: "Arial-BoldMT")
        levelLabel.text = level
        levelLabel.fontSize = 36
        levelLabel.fontColor = .white
        levelLabel.verticalAlignmentMode = .center
        levelLabel.position = CGPoint(x: 0, y: -8)
        button.addChild(levelLabel)
        
        // Description label
        let descLabel = SKLabelNode(fontNamed: "Arial")
        descLabel.text = getLevelDescription(for: level)
        descLabel.fontSize = 14
        descLabel.fontColor = .white
        descLabel.verticalAlignmentMode = .center
        descLabel.position = CGPoint(x: 0, y: -28)
        button.addChild(descLabel)
        
        return button
    }
    
    private func getLevelColor(for level: String) -> SKColor {
        switch level {
        case "A1":
            return SKColor(red: 0.2, green: 0.7, blue: 0.2, alpha: 1.0) // Green
        case "A2":
            return SKColor(red: 0.3, green: 0.6, blue: 0.9, alpha: 1.0) // Blue
        case "B1":
            return SKColor(red: 0.9, green: 0.6, blue: 0.2, alpha: 1.0) // Orange
        case "B2":
            return SKColor(red: 0.8, green: 0.2, blue: 0.2, alpha: 1.0) // Red
        default:
            return SKColor.gray
        }
    }
    
    private func getLevelDescription(for level: String) -> String {
        switch level {
        case "A1":
            return "Beginner"
        case "A2":
            return "Elementary"
        case "B1":
            return "Intermediate"
        case "B2":
            return "Upper Intermediate"
        default:
            return ""
        }
    }
    
    override func mouseDown(with event: NSEvent) {
        let location = event.location(in: self)
        let nodes = self.nodes(at: location)
        
        for node in nodes {
            if let nodeName = node.name, nodeName.hasPrefix("levelButton_") {
                let level = String(nodeName.dropFirst("levelButton_".count))
                startGame(with: level)
                return
            }
        }
    }
    
    private func startGame(with level: String) {
        let gameScene = GameScene(size: size)
        gameScene.scaleMode = .aspectFill
        gameScene.selectedLevel = level
        
        let transition = SKTransition.fade(withDuration: 0.5)
        view?.presentScene(gameScene, transition: transition)
    }
}
