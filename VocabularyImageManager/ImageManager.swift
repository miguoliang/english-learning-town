//
//  ImageManager.swift
//  VocabularyImageManager
//
//  Created by Frank Mi on 2025/11/8.
//

import Foundation
import AppKit

class ImageManager {
    /// Get the images directory path for a given level.
    ///
    /// - Parameters:
    ///   - level: The CEFR level (e.g., "A1", "A2")
    ///   - projectRoot: Optional project root URL (if nil, will try to find it)
    /// - Returns: URL to the images directory for that level
    static func imagesDirectory(for level: String, projectRoot: URL? = nil) -> URL? {
        let root = projectRoot ?? findProjectRoot()
        guard let projectRoot = root else { return nil }
        let levelDir = level.lowercased()
        let imagesDir = projectRoot.appendingPathComponent("images").appendingPathComponent("cefr-\(levelDir)")
        return imagesDir
    }
    
    /// Find the project root directory (containing data-sources and images folders).
    ///
    /// - Parameter referenceURL: Optional URL to use as reference (e.g., CSV file location)
    /// - Returns: URL to project root, or nil if not found
    static func findProjectRoot(referenceURL: URL? = nil) -> URL? {
        // Strategy 1: If we have a reference URL (like CSV file), walk up from there
        if let refURL = referenceURL {
            var searchDir = refURL.deletingLastPathComponent()
            for _ in 0..<5 {
                let dataSourcesDir = searchDir.appendingPathComponent("data-sources")
                if FileManager.default.fileExists(atPath: dataSourcesDir.path) {
                    print("Found project root via reference URL: \(searchDir.path)")
                    return searchDir
                }
                searchDir = searchDir.deletingLastPathComponent()
            }
        }
        
        // Strategy 2: Check if we're running from Xcode/build directory
        // Look for the executable's location and walk up
        if let executablePath = Bundle.main.executablePath {
            var searchDir = URL(fileURLWithPath: executablePath).deletingLastPathComponent()
            
            // Walk up from executable location (could be in DerivedData or build folder)
            for _ in 0..<15 {
                let dataSourcesDir = searchDir.appendingPathComponent("data-sources")
                if FileManager.default.fileExists(atPath: dataSourcesDir.path) {
                    print("Found project root via executable path: \(searchDir.path)")
                    return searchDir
                }
                searchDir = searchDir.deletingLastPathComponent()
            }
        }
        
        // Strategy 3: Check current working directory
        var currentDir = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
        for _ in 0..<10 {
            let dataSourcesDir = currentDir.appendingPathComponent("data-sources")
            if FileManager.default.fileExists(atPath: dataSourcesDir.path) {
                print("Found project root via current directory: \(currentDir.path)")
                return currentDir
            }
            currentDir = currentDir.deletingLastPathComponent()
        }
        
        // Strategy 4: Try common project locations relative to home directory
        let homeDir = FileManager.default.homeDirectoryForCurrentUser
        let possiblePaths = [
            "Documents/GitHub/EnglishLearningTown",
            "Desktop/EnglishLearningTown",
            "Projects/EnglishLearningTown"
        ]
        
        for path in possiblePaths {
            let url = homeDir.appendingPathComponent(path)
            let dataSourcesDir = url.appendingPathComponent("data-sources")
            if FileManager.default.fileExists(atPath: dataSourcesDir.path) {
                print("Found project root via home directory: \(url.path)")
                return url
            }
        }
        
        print("Could not find project root directory")
        return nil
    }
    
    /// Save an image to the repository for a given word and level.
    ///
    /// - Parameters:
    ///   - image: The NSImage to save
    ///   - word: The vocabulary word (used for filename)
    ///   - level: The CEFR level
    ///   - projectRoot: Optional project root URL (if nil, will try to find it)
    /// - Returns: The file path where the image was saved, or nil on failure
    static func saveImage(_ image: NSImage, for word: String, level: String, projectRoot: URL? = nil) -> String? {
        guard let imagesDir = imagesDirectory(for: level, projectRoot: projectRoot) else {
            print("Could not find images directory for level \(level)")
            return nil
        }
        
        // Create directory if it doesn't exist
        try? FileManager.default.createDirectory(at: imagesDir, withIntermediateDirectories: true)
        
        // Sanitize word for filename
        let sanitizedWord = sanitizeFilename(word)
        let imageURL = imagesDir.appendingPathComponent("\(sanitizedWord).png")
        
        // Convert NSImage to PNG data
        guard let tiffData = image.tiffRepresentation,
              let bitmapImage = NSBitmapImageRep(data: tiffData),
              let pngData = bitmapImage.representation(using: .png, properties: [:]) else {
            print("Failed to convert image to PNG")
            return nil
        }
        
        // Write to file
        do {
            try pngData.write(to: imageURL)
            return imageURL.path
        } catch {
            print("Failed to save image: \(error)")
            return nil
        }
    }
    
    /// Load an image from the repository for a given word and level.
    ///
    /// - Parameters:
    ///   - word: The vocabulary word
    ///   - level: The CEFR level
    /// - Returns: The NSImage if found, or nil
    static func loadImage(for word: String, level: String) -> NSImage? {
        guard let imagesDir = imagesDirectory(for: level) else { return nil }
        let sanitizedWord = sanitizeFilename(word)
        let imageURL = imagesDir.appendingPathComponent("\(sanitizedWord).png")
        
        guard FileManager.default.fileExists(atPath: imageURL.path) else { return nil }
        return NSImage(contentsOf: imageURL)
    }
    
    /// Check if an image exists for a given word and level.
    ///
    /// - Parameters:
    ///   - word: The vocabulary word
    ///   - level: The CEFR level
    /// - Returns: True if image exists, false otherwise
    static func imageExists(for word: String, level: String) -> Bool {
        guard let imagesDir = imagesDirectory(for: level) else { return false }
        let sanitizedWord = sanitizeFilename(word)
        let imageURL = imagesDir.appendingPathComponent("\(sanitizedWord).png")
        return FileManager.default.fileExists(atPath: imageURL.path)
    }
    
    /// Sanitize a string to be used as a filename.
    ///
    /// - Parameter filename: The original string
    /// - Returns: Sanitized filename (lowercase, spaces replaced with hyphens)
    static func sanitizeFilename(_ filename: String) -> String {
        return filename.lowercased()
            .replacingOccurrences(of: " ", with: "-")
            .replacingOccurrences(of: "/", with: "-")
            .replacingOccurrences(of: "\\", with: "-")
            .replacingOccurrences(of: ":", with: "-")
            .replacingOccurrences(of: "*", with: "-")
            .replacingOccurrences(of: "?", with: "-")
            .replacingOccurrences(of: "\"", with: "-")
            .replacingOccurrences(of: "<", with: "-")
            .replacingOccurrences(of: ">", with: "-")
            .replacingOccurrences(of: "|", with: "-")
    }
    
    /// Generate Asset Catalog image name from level and word.
    ///
    /// - Parameters:
    ///   - level: The CEFR level (e.g., "A1")
    ///   - word: The vocabulary word
    /// - Returns: Asset Catalog name (e.g., "A1-apple")
    static func assetCatalogName(level: String, word: String) -> String {
        let sanitizedWord = sanitizeFilename(word)
        return "\(level.uppercased())-\(sanitizedWord)"
    }
}

