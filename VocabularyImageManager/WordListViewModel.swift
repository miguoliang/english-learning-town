//
//  WordListViewModel.swift
//  VocabularyImageManager
//
//  Created by Frank Mi on 2025/11/8.
//

import Foundation
import SwiftUI
import AppKit
import Combine

class WordListViewModel: ObservableObject {
    @Published var words: [VocabularyWord] = []
    @Published var searchText: String = ""
    @Published var selectedWord: VocabularyWord?
    @Published var currentImage: NSImage?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var csvFileURL: URL?
    private var projectRoot: URL?
    
    /// Load vocabulary words from CSV file.
    ///
    /// - Parameter url: The URL of the CSV file to load
    func loadCSV(from url: URL) {
        isLoading = true
        errorMessage = nil
        csvFileURL = url
        
        // Find project root using CSV file location as reference
        projectRoot = ImageManager.findProjectRoot(referenceURL: url)
        
        do {
            let content = try String(contentsOf: url, encoding: .utf8)
            words = parseCSV(content: content)
            isLoading = false
        } catch {
            errorMessage = "Failed to load CSV file: \(error.localizedDescription)"
            isLoading = false
        }
    }
    
    /// Parse CSV content into VocabularyWord array.
    ///
    /// - Parameter content: The CSV file content as a string
    /// - Returns: Array of VocabularyWord objects
    private func parseCSV(content: String) -> [VocabularyWord] {
        let lines = content.components(separatedBy: .newlines).filter { !$0.isEmpty }
        guard lines.count > 1 else { return [] }
        
        // Skip header line
        let dataLines = Array(lines.dropFirst())
        var parsedWords: [VocabularyWord] = []
        
        for line in dataLines {
            // Parse CSV line (handling quoted fields)
            let fields = parseCSVLine(line)
            guard fields.count >= 7 else { continue }
            
            let word = VocabularyWord(
                englishWord: fields[0],
                pos: fields[1],
                level: fields[2],
                chineseTranslation: fields[3],
                exampleSentence: fields[4],
                selfExaminePrompt: fields[5],
                theme: fields[6],
                imageName: nil // CSV doesn't have imageName, check from repository
            )
            parsedWords.append(word)
        }
        
        return parsedWords
    }
    
    /// Parse a single CSV line, handling quoted fields.
    ///
    /// - Parameter line: The CSV line to parse
    /// - Returns: Array of field values
    private func parseCSVLine(_ line: String) -> [String] {
        var fields: [String] = []
        var currentField = ""
        var insideQuotes = false
        
        for char in line {
            if char == "\"" {
                insideQuotes.toggle()
            } else if char == "," && !insideQuotes {
                fields.append(currentField.trimmingCharacters(in: .whitespaces))
                currentField = ""
            } else {
                currentField.append(char)
            }
        }
        fields.append(currentField.trimmingCharacters(in: .whitespaces))
        
        return fields
    }
    
    /// Filtered words based on search text.
    var filteredWords: [VocabularyWord] {
        if searchText.isEmpty {
            return words
        }
        return words.filter { word in
            word.englishWord.localizedCaseInsensitiveContains(searchText) ||
            word.chineseTranslation.localizedCaseInsensitiveContains(searchText)
        }
    }
    
    /// Select a word and load its image if available.
    ///
    /// - Parameter word: The vocabulary word to select
    func selectWord(_ word: VocabularyWord) {
        selectedWord = word
        currentImage = ImageManager.loadImage(for: word.englishWord, level: word.level)
    }
    
    /// Save an image for the selected word.
    ///
    /// - Parameter image: The image to save
    /// - Returns: True if successful, false otherwise
    func saveImage(_ image: NSImage) -> Bool {
        guard let word = selectedWord else { return false }
        
        // Save image to repository
        guard ImageManager.saveImage(image, for: word.englishWord, level: word.level, projectRoot: projectRoot) != nil else {
            errorMessage = "Failed to save image to repository. Project root: \(projectRoot?.path ?? "not found")"
            return false
        }
        
        // Update JSON file with imageName (find corresponding JSON file)
        let assetCatalogName = ImageManager.assetCatalogName(level: word.level, word: word.englishWord)
        if updateWordImageName(word: word, imageName: assetCatalogName) {
            currentImage = image
            // Update the word in the current list with imageName
            if let index = words.firstIndex(where: { $0.englishWord == word.englishWord }) {
                // Create updated word with imageName
                let updatedWord = VocabularyWord(
                    englishWord: word.englishWord,
                    pos: word.pos,
                    level: word.level,
                    chineseTranslation: word.chineseTranslation,
                    exampleSentence: word.exampleSentence,
                    selfExaminePrompt: word.selfExaminePrompt,
                    theme: word.theme,
                    imageName: assetCatalogName
                )
                words[index] = updatedWord
                selectWord(updatedWord)
            }
            return true
        }
        
        errorMessage = "Failed to update JSON file"
        return false
    }
    
    /// Update the imageName field for a word in the JSON file.
    ///
    /// - Parameters:
    ///   - word: The vocabulary word to update
    ///   - imageName: The Asset Catalog image name
    /// - Returns: True if successful, false otherwise
    private func updateWordImageName(word: VocabularyWord, imageName: String) -> Bool {
        guard let root = projectRoot ?? ImageManager.findProjectRoot() else { return false }
        let projectRoot = root
        
        let fileName = "cefr-\(word.level.lowercased())"
        let jsonURL = projectRoot.appendingPathComponent("data-sources").appendingPathComponent("\(fileName).json")
        
        guard FileManager.default.fileExists(atPath: jsonURL.path) else {
            // JSON file doesn't exist, that's okay - image is saved to repository
            return true
        }
        
        do {
            let data = try Data(contentsOf: jsonURL)
            // Parse as dictionary array to preserve order and formatting
            guard var jsonArray = try JSONSerialization.jsonObject(with: data) as? [[String: Any]] else {
                return false
            }
            
            // Find and update the word
            if let index = jsonArray.firstIndex(where: { ($0["englishWord"] as? String) == word.englishWord }) {
                jsonArray[index]["imageName"] = imageName
                
                // Write back to file with pretty printing
                let jsonData = try JSONSerialization.data(withJSONObject: jsonArray, options: [.prettyPrinted])
                try jsonData.write(to: jsonURL)
                
                return true
            }
        } catch {
            print("Error updating JSON: \(error)")
            errorMessage = "Failed to update JSON: \(error.localizedDescription)"
        }
        
        return false
    }
    
    /// Paste image from clipboard.
    ///
    /// - Returns: The pasted image, or nil if clipboard doesn't contain an image
    func pasteImageFromClipboard() -> NSImage? {
        let pasteboard = NSPasteboard.general
        
        // Check available types for debugging
        let availableTypes = pasteboard.types
        print("Available clipboard types: \(availableTypes)")
        
        // Method 1: Try reading as NSImage directly (most common)
        if pasteboard.canReadObject(forClasses: [NSImage.self], options: nil) {
            if let images = pasteboard.readObjects(forClasses: [NSImage.self], options: nil) as? [NSImage],
               let image = images.first {
                print("Successfully read image using NSImage class")
                return image
            }
        }
        
        // Method 2: Try reading PNG data
        if pasteboard.availableType(from: [.png]) != nil {
            if let pngData = pasteboard.data(forType: .png),
               let image = NSImage(data: pngData) {
                print("Successfully read image from PNG data")
                return image
            }
        }
        
        // Method 3: Try reading TIFF data
        if pasteboard.availableType(from: [.tiff]) != nil {
            if let tiffData = pasteboard.data(forType: .tiff),
               let image = NSImage(data: tiffData) {
                print("Successfully read image from TIFF data")
                return image
            }
        }
        
        // Method 4: Try reading from file URL (if image file was copied)
        if let fileURLType = pasteboard.availableType(from: [.fileURL]) {
            // Try as property list first (most common on macOS)
            if let filePaths = pasteboard.propertyList(forType: fileURLType) as? [String],
               let firstPath = filePaths.first,
               let image = NSImage(contentsOfFile: firstPath) {
                print("Successfully read image from file path (property list)")
                return image
            }
            // Try as data/string
            if let fileURLData = pasteboard.data(forType: fileURLType),
               let fileURLString = String(data: fileURLData, encoding: .utf8),
               let fileURL = URL(string: fileURLString),
               let image = NSImage(contentsOf: fileURL) {
                print("Successfully read image from file URL (data)")
                return image
            }
        }
        
        // Method 5: Try reading from NSPasteboardTypeURLString
        let urlStringType = NSPasteboard.PasteboardType("public.file-url")
        if pasteboard.availableType(from: [urlStringType]) != nil {
            if let urlData = pasteboard.data(forType: urlStringType),
               let urlString = String(data: urlData, encoding: .utf8),
               let fileURL = URL(string: urlString),
               let image = NSImage(contentsOf: fileURL) {
                print("Successfully read image from public.file-url")
                return image
            }
        }
        
        print("Failed to read image from clipboard")
        return nil
    }
    
    /// Check if a word has an image.
    ///
    /// - Parameter word: The vocabulary word
    /// - Returns: True if image exists, false otherwise
    func hasImage(_ word: VocabularyWord) -> Bool {
        return ImageManager.imageExists(for: word.englishWord, level: word.level)
    }
}

