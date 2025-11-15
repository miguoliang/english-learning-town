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
    private let levels = GameConstants.Config.levels
    
    override func didMove(to view: SKView) {
        backgroundColor = GameConstants.Colors.levelSelectionBackground
        
        setupUI()
        createLevelButtons()
    }
    
    private func setupUI() {
        // Title
        titleLabel = SKLabelNode(fontNamed: GameConstants.Typography.fontNameBold)
        titleLabel.text = GameConstants.Strings.selectLevel
        titleLabel.fontSize = GameConstants.Typography.FontSize.levelSelectionTitle
        titleLabel.fontColor = GameConstants.Colors.white
        titleLabel.position = CGPoint(x: size.width / 2, y: size.height * 0.8)
        addChild(titleLabel)
        
        // Instruction label
        instructionLabel = SKLabelNode(fontNamed: GameConstants.Typography.fontName)
        instructionLabel.text = GameConstants.Strings.chooseLevel
        instructionLabel.fontSize = GameConstants.Typography.FontSize.levelSelectionInstruction
        instructionLabel.fontColor = GameConstants.Colors.lightGray
        instructionLabel.position = CGPoint(x: size.width / 2, y: size.height * 0.7)
        addChild(instructionLabel)
    }
    
    private func createLevelButtons() {
        // Calculate button size based on screen dimensions
        let buttonWidth = min(GameConstants.Layout.Button.LevelSelection.maxWidth, max(GameConstants.Layout.Button.LevelSelection.minWidth, size.width * GameConstants.Layout.Button.LevelSelection.widthRatio))
        let buttonHeight = min(GameConstants.Layout.Button.LevelSelection.maxHeight, max(GameConstants.Layout.Button.LevelSelection.minHeight, size.height * GameConstants.Layout.Button.LevelSelection.heightRatio))
        
        // Grid layout: 2 columns, 2 rows
        let columnsPerRow = 2
        let horizontalSpacing = buttonWidth * GameConstants.Layout.Button.LevelSelection.spacingRatio
        let verticalSpacing = buttonHeight * GameConstants.Layout.Button.LevelSelection.spacingRatio
        
        // Reserve space for title and instruction
        let topSpace: CGFloat = size.height * GameConstants.Layout.LevelSelection.topSpaceRatio
        let bottomMargin: CGFloat = size.height * GameConstants.Layout.LevelSelection.bottomMarginRatio
        let availableHeight = size.height - topSpace - bottomMargin
        
        // Calculate grid dimensions
        let gridWidth = CGFloat(columnsPerRow) * buttonWidth + CGFloat(columnsPerRow - 1) * horizontalSpacing
        let gridHeight = CGFloat(2) * buttonHeight + CGFloat(1) * verticalSpacing
        
        // Center the grid horizontally and vertically
        let startX = (size.width - gridWidth) / 2 + buttonWidth / 2
        let startY = topSpace + (availableHeight - gridHeight) / 2 + buttonHeight / 2
        
        for (index, level) in levels.enumerated() {
            let row = index / columnsPerRow
            let col = index % columnsPerRow
            
            let button = createLevelButton(level: level, width: buttonWidth, height: buttonHeight)
            button.position = CGPoint(
                x: startX + CGFloat(col) * (buttonWidth + horizontalSpacing),
                y: startY - CGFloat(row) * (buttonHeight + verticalSpacing)
            )
            addChild(button)
        }
    }
    
    private func createLevelButton(level: String, width: CGFloat, height: CGFloat) -> SKNode {
        let button = SKNode()
        button.name = "levelButton_\(level)"
        
        // Background
        let background = SKShapeNode(rectOf: CGSize(width: width, height: height), cornerRadius: GameConstants.Layout.Button.LevelSelection.cornerRadius)
        background.fillColor = getLevelColor(for: level)
        background.strokeColor = GameConstants.Colors.white
        background.lineWidth = GameConstants.Layout.Button.LevelSelection.strokeWidth
        button.addChild(background)
        
        // Level label - scale font size based on button height
        let levelLabel = SKLabelNode(fontNamed: GameConstants.Typography.fontNameBold)
        levelLabel.text = level
        levelLabel.fontSize = height * GameConstants.Typography.FontMultiplier.levelButton
        levelLabel.fontColor = GameConstants.Colors.white
        levelLabel.verticalAlignmentMode = .center
        levelLabel.position = CGPoint(x: 0, y: height * 0.1)
        button.addChild(levelLabel)
        
        // Description label - scale font size based on button height
        let descLabel = SKLabelNode(fontNamed: GameConstants.Typography.fontName)
        descLabel.text = getLevelDescription(for: level)
        descLabel.fontSize = height * GameConstants.Typography.FontMultiplier.levelButtonDescription
        descLabel.fontColor = GameConstants.Colors.white
        descLabel.verticalAlignmentMode = .center
        descLabel.position = CGPoint(x: 0, y: -height * 0.35)
        button.addChild(descLabel)
        
        return button
    }
    
    private func getLevelColor(for level: String) -> SKColor {
        switch level {
        case "A1":
            return GameConstants.Colors.Level.a1
        case "A2":
            return GameConstants.Colors.Level.a2
        case "B1":
            return GameConstants.Colors.Level.b1
        case "B2":
            return GameConstants.Colors.Level.b2
        default:
            return GameConstants.Colors.darkGray
        }
    }
    
    private func getLevelDescription(for level: String) -> String {
        switch level {
        case "A1":
            return GameConstants.LevelDescription.a1
        case "A2":
            return GameConstants.LevelDescription.a2
        case "B1":
            return GameConstants.LevelDescription.b1
        case "B2":
            return GameConstants.LevelDescription.b2
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
        let gameScene = SceneFactory.createGameScene(size: size, level: level)
        let transition = SceneFactory.createTransition()
        view?.presentScene(gameScene, transition: transition)
    }
}
