//
//  VocabularyBox.swift
//  EnglishLearningTown
//
//  Created by Frank Mi on 2025/11/8.
//

import SpriteKit

class VocabularyBox: SKShapeNode {
    let vocabularyWord: VocabularyWord
    var isCollected: Bool = false
    
    init(vocabularyWord: VocabularyWord, size: CGSize) {
        self.vocabularyWord = vocabularyWord
        super.init()
        
        // Create box shape
        self.path = CGPath(rect: CGRect(origin: .zero, size: size), transform: nil)
        self.fillColor = SKColor(red: 0.8, green: 0.6, blue: 0.4, alpha: 1.0)
        self.strokeColor = SKColor.brown
        self.lineWidth = 2
        
        // Add physics body
        self.physicsBody = SKPhysicsBody(rectangleOf: size)
        self.physicsBody?.isDynamic = false
        self.physicsBody?.categoryBitMask = PhysicsCategory.vocabularyBox
        self.physicsBody?.contactTestBitMask = PhysicsCategory.player
        
        // Box is a mystery - no label displayed
        self.name = "vocabularyBox"
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}

struct PhysicsCategory {
    static let none: UInt32 = 0
    static let player: UInt32 = 0b1
    static let ground: UInt32 = 0b10
    static let vocabularyBox: UInt32 = 0b100
}

