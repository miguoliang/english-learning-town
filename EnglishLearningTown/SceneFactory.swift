//
//  SceneFactory.swift
//  EnglishLearningTown
//
//  Created by Frank Mi on 2025/11/8.
//

import SpriteKit

/**
 * Factory class for creating and configuring game scenes.
 * Centralizes scene creation logic for consistency and maintainability.
 */
class SceneFactory {
    
    /**
     * Creates a WelcomeScene with proper configuration.
     *
     * - Parameter size: The size of the scene
     * - Returns: Configured WelcomeScene instance
     */
    static func createWelcomeScene(size: CGSize) -> WelcomeScene {
        let scene = WelcomeScene(size: size)
        scene.scaleMode = .aspectFill
        return scene
    }
    
    /**
     * Creates a LevelSelectionScene with proper configuration.
     *
     * - Parameter size: The size of the scene
     * - Returns: Configured LevelSelectionScene instance
     */
    static func createLevelSelectionScene(size: CGSize) -> LevelSelectionScene {
        let scene = LevelSelectionScene(size: size)
        scene.scaleMode = .aspectFill
        return scene
    }
    
    /**
     * Creates a GameScene with proper configuration and level.
     *
     * - Parameters:
     *   - size: The size of the scene
     *   - level: The CEFR level (A1, A2, B1, B2)
     * - Returns: Configured GameScene instance with level set
     */
    static func createGameScene(size: CGSize, level: String) -> GameScene {
        let scene = GameScene(size: size)
        scene.scaleMode = .aspectFill
        scene.selectedLevel = level
        return scene
    }
    
    /**
     * Creates a standardized scene transition.
     *
     * - Parameters:
     *   - type: The type of transition (default: fade)
     *   - duration: Duration of the transition (default: from constants)
     * - Returns: Configured SKTransition instance
     */
    static func createTransition(
        type: TransitionType = .fade,
        duration: TimeInterval = GameConstants.AnimationTiming.sceneTransitionDuration
    ) -> SKTransition {
        switch type {
        case .fade:
            return SKTransition.fade(withDuration: duration)
        case .crossFade:
            return SKTransition.crossFade(withDuration: duration)
        case .push:
            return SKTransition.push(with: .right, duration: duration)
        case .reveal:
            return SKTransition.reveal(with: .right, duration: duration)
        }
    }
}

/**
 * Enumeration of available transition types.
 */
enum TransitionType {
    case fade
    case crossFade
    case push
    case reveal
}

