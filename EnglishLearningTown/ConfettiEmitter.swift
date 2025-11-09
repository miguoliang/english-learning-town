//
//  ConfettiEmitter.swift
//  EnglishLearningTown
//
//  Created by Frank Mi on 2025/11/8.
//

import SpriteKit

class ConfettiEmitter: SKNode {
    
    private static func createParticleTexture(size: CGSize, color: SKColor = .white) -> SKTexture {
        let image = NSImage(size: size)
        image.lockFocus()
        color.setFill()
        let rect = NSRect(origin: .zero, size: size)
        NSBezierPath(ovalIn: rect).fill()
        image.unlockFocus()
        return SKTexture(image: image)
    }
    
    static func createConfetti(at position: CGPoint) -> ConfettiEmitter {
        let emitter = ConfettiEmitter()
        emitter.position = position
        
        // Create multiple particle emitters for colorful confetti
        let colors: [SKColor] = [
            SKColor(red: 1.0, green: 0.2, blue: 0.2, alpha: 1.0), // Red
            SKColor(red: 0.2, green: 0.8, blue: 0.2, alpha: 1.0), // Green
            SKColor(red: 0.2, green: 0.2, blue: 1.0, alpha: 1.0), // Blue
            SKColor(red: 1.0, green: 0.8, blue: 0.2, alpha: 1.0), // Yellow
            SKColor(red: 1.0, green: 0.4, blue: 0.8, alpha: 1.0), // Pink
            SKColor(red: 0.4, green: 0.8, blue: 1.0, alpha: 1.0)  // Cyan
        ]
        
        // Create a simple texture for particles
        let particleSize = CGSize(width: 8, height: 8)
        let texture = createParticleTexture(size: particleSize)
        
        for (index, color) in colors.enumerated() {
            let particleEmitter = SKEmitterNode()
            particleEmitter.particleTexture = texture
            
            // Configure particle properties
            particleEmitter.particleBirthRate = 50
            particleEmitter.particleLifetime = 2.0
            particleEmitter.particleLifetimeRange = 0.5
            
            // Position and velocity
            let angle = CGFloat(index) * (CGFloat.pi * 2 / CGFloat(colors.count))
            particleEmitter.emissionAngle = angle
            particleEmitter.emissionAngleRange = CGFloat.pi / 3
            
            particleEmitter.particleSpeed = 200
            particleEmitter.particleSpeedRange = 100
            
            // Visual properties
            particleEmitter.particleColor = color
            particleEmitter.particleColorBlendFactor = 1.0
            particleEmitter.particleColorSequence = nil
            
            particleEmitter.particleSize = particleSize
            
            // Physics
            particleEmitter.particleAlpha = 1.0
            particleEmitter.particleAlphaRange = 0.3
            particleEmitter.particleAlphaSpeed = -0.5
            
            particleEmitter.particleRotation = 0
            particleEmitter.particleRotationRange = CGFloat.pi * 2
            particleEmitter.particleRotationSpeed = 3.0
            
            // Gravity
            particleEmitter.particlePositionRange = CGVector(dx: 0, dy: 0)
            particleEmitter.yAcceleration = -300
            
            emitter.addChild(particleEmitter)
        }
        
        // Auto-remove after animation completes
        emitter.run(SKAction.sequence([
            SKAction.wait(forDuration: 2.5),
            SKAction.run {
                emitter.removeFromParent()
            }
        ]))
        
        return emitter
    }
    
    static func createSparkle(at position: CGPoint) -> ConfettiEmitter {
        let emitter = ConfettiEmitter()
        emitter.position = position
        
        let sparkleEmitter = SKEmitterNode()
        
        // Create a simple white sparkle texture programmatically
        let size = CGSize(width: 4, height: 4)
        let texture = createParticleTexture(size: size, color: .white)
        sparkleEmitter.particleTexture = texture
        
        sparkleEmitter.particleBirthRate = 30
        sparkleEmitter.particleLifetime = 1.0
        sparkleEmitter.particleLifetimeRange = 0.3
        
        sparkleEmitter.emissionAngle = 0
        sparkleEmitter.emissionAngleRange = CGFloat.pi * 2
        
        sparkleEmitter.particleSpeed = 50
        sparkleEmitter.particleSpeedRange = 30
        
        sparkleEmitter.particleColor = .white
        sparkleEmitter.particleColorBlendFactor = 1.0
        
        sparkleEmitter.particleSize = size
        
        sparkleEmitter.particleAlpha = 1.0
        sparkleEmitter.particleAlphaSpeed = -1.0
        
        sparkleEmitter.particleRotationRange = CGFloat.pi * 2
        sparkleEmitter.particleRotationSpeed = 5.0
        
        sparkleEmitter.yAcceleration = -100
        
        emitter.addChild(sparkleEmitter)
        
        emitter.run(SKAction.sequence([
            SKAction.wait(forDuration: 1.5),
            SKAction.run {
                emitter.removeFromParent()
            }
        ]))
        
        return emitter
    }
}

