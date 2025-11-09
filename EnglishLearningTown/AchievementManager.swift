//
//  AchievementManager.swift
//  EnglishLearningTown
//
//  Created by Frank Mi on 2025/11/8.
//

import Foundation

struct Achievement {
    let id: String
    let title: String
    let description: String
    let icon: String
    var unlocked: Bool
    
    static let allAchievements: [Achievement] = [
        Achievement(id: "perfect_score", title: "Perfect Score", description: "Get 3/3 correct answers", icon: "⭐", unlocked: false),
        Achievement(id: "first_win", title: "First Win", description: "Complete your first level", icon: "🎉", unlocked: false),
        Achievement(id: "level_master_a1", title: "A1 Master", description: "Complete A1 level", icon: "🏆", unlocked: false),
        Achievement(id: "level_master_a2", title: "A2 Master", description: "Complete A2 level", icon: "🏆", unlocked: false),
        Achievement(id: "level_master_b1", title: "B1 Master", description: "Complete B1 level", icon: "🏆", unlocked: false),
        Achievement(id: "level_master_b2", title: "B2 Master", description: "Complete B2 level", icon: "🏆", unlocked: false),
        Achievement(id: "streak_3", title: "Streak Master", description: "Get 3 perfect scores in a row", icon: "🔥", unlocked: false),
        Achievement(id: "word_collector_10", title: "Word Collector", description: "Master 10 words", icon: "📚", unlocked: false),
        Achievement(id: "word_collector_50", title: "Word Expert", description: "Master 50 words", icon: "📖", unlocked: false),
        Achievement(id: "word_collector_100", title: "Word Master", description: "Master 100 words", icon: "📕", unlocked: false)
    ]
}

class AchievementManager {
    static let shared = AchievementManager()
    
    private let userDefaults = UserDefaults.standard
    private let unlockedAchievementsKey = "UnlockedAchievements"
    
    private init() {
        initializeAchievements()
    }
    
    private func initializeAchievements() {
        // Initialize if first time
        if userDefaults.object(forKey: unlockedAchievementsKey) == nil {
            let emptySet: Set<String> = []
            if let data = try? JSONEncoder().encode(emptySet) {
                userDefaults.set(data, forKey: unlockedAchievementsKey)
            }
        }
    }
    
    func getUnlockedAchievementIds() -> Set<String> {
        guard let data = userDefaults.data(forKey: unlockedAchievementsKey),
              let ids = try? JSONDecoder().decode(Set<String>.self, from: data) else {
            return Set<String>()
        }
        return ids
    }
    
    private func saveUnlockedAchievements(_ ids: Set<String>) {
        if let data = try? JSONEncoder().encode(ids) {
            userDefaults.set(data, forKey: unlockedAchievementsKey)
        }
    }
    
    func getAllAchievements() -> [Achievement] {
        let unlockedIds = getUnlockedAchievementIds()
        return Achievement.allAchievements.map { achievement in
            var updated = achievement
            updated.unlocked = unlockedIds.contains(achievement.id)
            return updated
        }
    }
    
    func checkAchievements(level: String, score: Int, totalQuestions: Int) -> [Achievement] {
        var newlyUnlocked: [Achievement] = []
        var unlockedIds = getUnlockedAchievementIds()
        let stats = ProgressTracker.shared.getStats()
        
        // Check perfect score achievement
        if score == totalQuestions && !unlockedIds.contains("perfect_score") {
            unlockedIds.insert("perfect_score")
            newlyUnlocked.append(Achievement.allAchievements.first { $0.id == "perfect_score" }!)
        }
        
        // Check first win achievement
        if stats.levelsCompleted.isEmpty && !unlockedIds.contains("first_win") {
            unlockedIds.insert("first_win")
            newlyUnlocked.append(Achievement.allAchievements.first { $0.id == "first_win" }!)
        }
        
        // Check level master achievements
        let levelMasterId = "level_master_\(level.lowercased())"
        if stats.levelsCompleted.contains(level) && !unlockedIds.contains(levelMasterId) {
            unlockedIds.insert(levelMasterId)
            if let achievement = Achievement.allAchievements.first(where: { $0.id == levelMasterId }) {
                newlyUnlocked.append(achievement)
            }
        }
        
        // Check streak achievement
        if stats.currentStreak >= 3 && !unlockedIds.contains("streak_3") {
            unlockedIds.insert("streak_3")
            newlyUnlocked.append(Achievement.allAchievements.first { $0.id == "streak_3" }!)
        }
        
        // Check word collector achievements
        let totalWords = stats.totalWordsMastered
        if totalWords >= 10 && !unlockedIds.contains("word_collector_10") {
            unlockedIds.insert("word_collector_10")
            newlyUnlocked.append(Achievement.allAchievements.first { $0.id == "word_collector_10" }!)
        }
        if totalWords >= 50 && !unlockedIds.contains("word_collector_50") {
            unlockedIds.insert("word_collector_50")
            newlyUnlocked.append(Achievement.allAchievements.first { $0.id == "word_collector_50" }!)
        }
        if totalWords >= 100 && !unlockedIds.contains("word_collector_100") {
            unlockedIds.insert("word_collector_100")
            newlyUnlocked.append(Achievement.allAchievements.first { $0.id == "word_collector_100" }!)
        }
        
        // Save updated achievements
        if !newlyUnlocked.isEmpty {
            saveUnlockedAchievements(unlockedIds)
        }
        
        return newlyUnlocked
    }
    
    func isUnlocked(_ achievementId: String) -> Bool {
        return getUnlockedAchievementIds().contains(achievementId)
    }
}

