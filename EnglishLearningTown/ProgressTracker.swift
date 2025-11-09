//
//  ProgressTracker.swift
//  EnglishLearningTown
//
//  Created by Frank Mi on 2025/11/8.
//

import Foundation

struct ProgressStats {
    var totalWordsMastered: Int = 0
    var perfectScoresPerLevel: [String: Int] = [:]
    var currentStreak: Int = 0
    var bestStreak: Int = 0
    var levelsCompleted: Set<String> = []
    var lastPlayDate: Date?
}

class ProgressTracker {
    static let shared = ProgressTracker()
    
    private let userDefaults = UserDefaults.standard
    private let statsKey = "ProgressStats"
    
    private init() {}
    
    func getStats() -> ProgressStats {
        guard let data = userDefaults.data(forKey: statsKey),
              let stats = try? JSONDecoder().decode(ProgressStats.self, from: data) else {
            return ProgressStats()
        }
        return stats
    }
    
    private func saveStats(_ stats: ProgressStats) {
        if let data = try? JSONEncoder().encode(stats) {
            userDefaults.set(data, forKey: statsKey)
        }
    }
    
    func recordGameCompletion(level: String, score: Int, totalQuestions: Int) {
        var stats = getStats()
        
        // Update words mastered
        stats.totalWordsMastered += score
        
        // Update perfect scores
        if score == totalQuestions {
            stats.perfectScoresPerLevel[level, default: 0] += 1
            stats.currentStreak += 1
            
            // Update best streak
            if stats.currentStreak > stats.bestStreak {
                stats.bestStreak = stats.currentStreak
            }
        } else {
            // Reset streak on non-perfect score
            stats.currentStreak = 0
        }
        
        // Mark level as completed
        stats.levelsCompleted.insert(level)
        
        // Update last play date
        stats.lastPlayDate = Date()
        
        saveStats(stats)
    }
    
    func incrementWordsMastered(count: Int = 1) {
        var stats = getStats()
        stats.totalWordsMastered += count
        saveStats(stats)
    }
    
    func getTotalWordsMastered() -> Int {
        return getStats().totalWordsMastered
    }
    
    func getCurrentStreak() -> Int {
        return getStats().currentStreak
    }
    
    func getBestStreak() -> Int {
        return getStats().bestStreak
    }
    
    func getPerfectScores(for level: String) -> Int {
        return getStats().perfectScoresPerLevel[level] ?? 0
    }
    
    func hasCompletedLevel(_ level: String) -> Bool {
        return getStats().levelsCompleted.contains(level)
    }
    
    func resetProgress() {
        userDefaults.removeObject(forKey: statsKey)
    }
}

// Make ProgressStats Codable
extension ProgressStats: Codable {
    enum CodingKeys: String, CodingKey {
        case totalWordsMastered
        case perfectScoresPerLevel
        case currentStreak
        case bestStreak
        case levelsCompleted
        case lastPlayDate
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        totalWordsMastered = try container.decode(Int.self, forKey: .totalWordsMastered)
        perfectScoresPerLevel = try container.decode([String: Int].self, forKey: .perfectScoresPerLevel)
        currentStreak = try container.decode(Int.self, forKey: .currentStreak)
        bestStreak = try container.decode(Int.self, forKey: .bestStreak)
        
        // Decode levelsCompleted as array and convert to Set
        let levelsArray = try container.decode([String].self, forKey: .levelsCompleted)
        levelsCompleted = Set(levelsArray)
        
        if let dateTimestamp = try? container.decode(Double.self, forKey: .lastPlayDate) {
            lastPlayDate = Date(timeIntervalSince1970: dateTimestamp)
        }
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(totalWordsMastered, forKey: .totalWordsMastered)
        try container.encode(perfectScoresPerLevel, forKey: .perfectScoresPerLevel)
        try container.encode(currentStreak, forKey: .currentStreak)
        try container.encode(bestStreak, forKey: .bestStreak)
        
        // Encode levelsCompleted as array
        try container.encode(Array(levelsCompleted), forKey: .levelsCompleted)
        
        if let date = lastPlayDate {
            try container.encode(date.timeIntervalSince1970, forKey: .lastPlayDate)
        }
    }
}

