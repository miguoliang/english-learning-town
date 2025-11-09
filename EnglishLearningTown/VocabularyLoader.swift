//
//  VocabularyLoader.swift
//  EnglishLearningTown
//
//  Created by Frank Mi on 2025/11/8.
//

import Foundation
import AppKit

class VocabularyLoader {
    /// Load vocabulary words from Asset Catalog Data Set.
    ///
    /// Maps filename pattern (e.g., "cefr-a1") to Data Set name (e.g., "CEFRA1Vocabulary")
    /// and loads JSON data from the Asset Catalog.
    ///
    /// - Parameter fileName: The base filename without extension (e.g., "cefr-a1")
    /// - Returns: Array of VocabularyWord objects, or empty array if loading fails
    static func loadVocabulary(fileName: String) -> [VocabularyWord] {
        // Map filename pattern to Data Set name
        // e.g., "cefr-a1" -> "CEFRA1Vocabulary"
        let dataSetName = mapFileNameToDataSetName(fileName)
        
        // Load data from Asset Catalog
        guard let dataAsset = NSDataAsset(name: dataSetName) else {
            print("Could not find data asset: \(dataSetName) for file: \(fileName)")
            return []
        }
        
        // Decode JSON data
        do {
            let words = try JSONDecoder().decode([VocabularyWord].self, from: dataAsset.data)
            print("Loaded \(words.count) words from \(dataSetName)")
            return words
        } catch {
            print("Error decoding JSON from \(dataSetName): \(error)")
            return []
        }
    }
    
    /// Maps filename pattern to Asset Catalog Data Set name.
    ///
    /// - Parameter fileName: Base filename (e.g., "cefr-a1")
    /// - Returns: Data Set name (e.g., "CEFRA1Vocabulary")
    private static func mapFileNameToDataSetName(_ fileName: String) -> String {
        // Remove "cefr-" prefix and convert to uppercase
        let level = fileName.replacingOccurrences(of: "cefr-", with: "").uppercased()
        return "CEFR\(level)Vocabulary"
    }
}

