//
//  AchievementBadge.swift
//  EnglishLearningTown
//
//  Created by Frank Mi on 2025/11/8.
//

import SpriteKit

class AchievementBadge: SKNode {
    
    private var background: SKShapeNode!
    private var iconLabel: SKLabelNode!
    private var titleLabel: SKLabelNode!
    private var descriptionLabel: SKLabelNode!
    
    init(achievement: Achievement) {
        super.init()
        
        setupBadge(achievement: achievement)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupBadge(achievement: Achievement) {
        // Background
        background = SKShapeNode(rectOf: CGSize(width: 300, height: 100), cornerRadius: 12)
        background.fillColor = achievement.unlocked ? SKColor(red: 0.2, green: 0.6, blue: 0.9, alpha: 1.0) : SKColor(red: 0.4, green: 0.4, blue: 0.4, alpha: 1.0)
        background.strokeColor = .white
        background.lineWidth = 3
        addChild(background)
        
        // Icon
        iconLabel = SKLabelNode(fontNamed: "Arial")
        iconLabel.text = achievement.icon
        iconLabel.fontSize = 40
        iconLabel.fontColor = .white
        iconLabel.position = CGPoint(x: -120, y: 0)
        iconLabel.verticalAlignmentMode = .center
        addChild(iconLabel)
        
        // Title
        titleLabel = SKLabelNode(fontNamed: "Arial-BoldMT")
        titleLabel.text = achievement.title
        titleLabel.fontSize = 20
        titleLabel.fontColor = .white
        titleLabel.position = CGPoint(x: 0, y: 15)
        titleLabel.horizontalAlignmentMode = .center
        addChild(titleLabel)
        
        // Description
        descriptionLabel = SKLabelNode(fontNamed: "Arial")
        descriptionLabel.text = achievement.description
        descriptionLabel.fontSize = 14
        descriptionLabel.fontColor = .lightGray
        descriptionLabel.position = CGPoint(x: 0, y: -10)
        descriptionLabel.horizontalAlignmentMode = .center
        addChild(descriptionLabel)
    }
    
    func animateAppearance() {
        // Start small and invisible
        alpha = 0
        setScale(0.5)
        
        // Animate to full size with bounce
        let scaleUp = SKAction.scale(to: 1.1, duration: 0.3)
        let scaleDown = SKAction.scale(to: 1.0, duration: 0.1)
        let fadeIn = SKAction.fadeIn(withDuration: 0.3)
        
        run(SKAction.group([
            SKAction.sequence([scaleUp, scaleDown]),
            fadeIn
        ]))
    }
}

