//
//  EmojiMapper.swift
//  EnglishLearningTown
//
//  Created by Frank Mi on 2025/11/8.
//

import Foundation

class EmojiMapper {
    private static let wordToEmoji: [String: String] = [
        // Animals
        "cat": "🐱", "dog": "🐶", "bird": "🐦", "fish": "🐟", "horse": "🐴",
        "lion": "🦁", "tiger": "🐯", "elephant": "🐘", "bear": "🐻", "rabbit": "🐰",
        "mouse": "🐭", "cow": "🐮", "pig": "🐷", "chicken": "🐔", "duck": "🦆",
        "animal": "🐾",
        
        // Food & Drink
        "apple": "🍎", "banana": "🍌", "orange": "🍊", "grape": "🍇", "strawberry": "🍓",
        "pizza": "🍕", "hamburger": "🍔", "sandwich": "🥪",
        "bread": "🍞", "cake": "🍰", "cookie": "🍪", "ice cream": "🍦",
        "coffee": "☕", "tea": "🍵", "water": "💧", "juice": "🧃", "milk": "🥛",
        "beer": "🍺", "wine": "🍷",
        
        // Emotions
        "happy": "😊", "sad": "😢", "angry": "😠", "afraid": "😨", "surprised": "😲",
        "love": "❤️", "like": "👍", "amazing": "🤩", "excited": "🤗",
        
        // Body parts
        "head": "👤", "eye": "👁️", "hand": "✋", "foot": "🦶",
        "arm": "💪", "leg": "🦵",
        
        // Daily Life
        "house": "🏠", "home": "🏡", "car": "🚗", "bicycle": "🚲", "bus": "🚌",
        "train": "🚂", "plane": "✈️", "boat": "⛵", "phone": "📱", "computer": "💻",
        "book": "📚", "pen": "✏️", "bag": "🎒", "clock": "🕐",
        "bed": "🛏️", "chair": "💺", "table": "🪑",
        
        // Weather & Nature
        "sun": "☀️", "rain": "🌧️", "snow": "❄️", "cloud": "☁️", "wind": "💨",
        "tree": "🌳", "flower": "🌸", "grass": "🌱", "mountain": "⛰️", "beach": "🏖️",
        
        // Colors
        "red": "🔴", "blue": "🔵", "green": "🟢", "yellow": "🟡",
        "purple": "🟣", "black": "⚫", "white": "⚪",
        
        // Time
        "morning": "🌅", "afternoon": "🌆", "evening": "🌇", "night": "🌙",
        "week": "📅", "month": "📆",
        
        // Family
        "baby": "👶", "child": "🧒", "boy": "👦", "girl": "👧", "man": "👨",
        "woman": "👩", "family": "👨‍👩‍👧‍👦",
        
        // Actions
        "run": "🏃", "walk": "🚶", "jump": "🦘", "swim": "🏊", "play": "🎮",
        "eat": "🍽️", "drink": "🥤", "sleep": "😴", "read": "📖", "write": "✍️",
        
        // Places
        "school": "🏫", "hospital": "🏥", "shop": "🏪",
        "station": "🚉", "park": "🏞️",
        
        // Sports
        "football": "⚽", "basketball": "🏀", "tennis": "🎾",
        
        // Common objects
        "key": "🔑", "door": "🚪", "window": "🪟", "light": "💡", "fire": "🔥",
        "money": "💰", "gift": "🎁"
    ]
    
    static func emoji(for word: String) -> String? {
        let lowercaseWord = word.lowercased()
        return wordToEmoji[lowercaseWord]
    }
    
    static func hasEmoji(for word: String) -> Bool {
        return emoji(for: word) != nil
    }
}
