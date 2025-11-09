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
    @Published var imageScale: CGFloat = 1.0
    @Published var imageOffset: CGSize = .zero
    @Published var isClipped: Bool = false
    private var baseOffset: CGSize = .zero
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
        print("[ImageEdit] Selecting word: \(word.englishWord) (Level: \(word.level))")
        selectedWord = word
        currentImage = ImageManager.loadImage(for: word.englishWord, level: word.level)
        if let image = currentImage {
            print("[ImageEdit] Image loaded - Size: \(image.size.width)x\(image.size.height)")
        } else {
            print("[ImageEdit] No image found for word")
        }
        // Reset zoom and offset when selecting a new word
        imageScale = 1.0
        imageOffset = .zero
        baseOffset = .zero
        isClipped = false
        print("[ImageEdit] Reset transform - Scale: 1.0, Offset: (0, 0), Clipped: false")
    }
    
    /// Save an image for the selected word.
    ///
    /// - Parameter image: The image to save
    /// - Returns: True if successful, false otherwise
    func saveImage(_ image: NSImage) -> Bool {
        guard let word = selectedWord else {
            print("[ImageEdit] Save failed - No word selected")
            return false
        }
        
        print("[ImageEdit] Saving image for word: \(word.englishWord) (Level: \(word.level))")
        print("[ImageEdit] Image size: \(image.size.width)x\(image.size.height), Clipped: \(isClipped)")
        
        // Save image to repository
        guard let savedPath = ImageManager.saveImage(image, for: word.englishWord, level: word.level, projectRoot: projectRoot) else {
            print("[ImageEdit] Save failed - Could not save to repository. Project root: \(projectRoot?.path ?? "not found")")
            errorMessage = "Failed to save image to repository. Project root: \(projectRoot?.path ?? "not found")"
            return false
        }
        
        print("[ImageEdit] Image saved to: \(savedPath)")
        
        // Update JSON file with imageName (find corresponding JSON file)
        let assetCatalogName = ImageManager.assetCatalogName(level: word.level, word: word.englishWord)
        print("[ImageEdit] Asset catalog name: \(assetCatalogName)")
        if updateWordImageName(word: word, imageName: assetCatalogName) {
            print("[ImageEdit] JSON file updated successfully")
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
            print("[ImageEdit] Save complete - Success")
            return true
        }
        
        print("[ImageEdit] Save failed - Could not update JSON file")
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
        print("[ImageEdit] Attempting to paste image from clipboard")
        let pasteboard = NSPasteboard.general
        
        // Check available types for debugging
        let availableTypes = pasteboard.types
        print("[ImageEdit] Available clipboard types: \(availableTypes)")
        
        // Method 1: Try reading as NSImage directly (most common)
        if pasteboard.canReadObject(forClasses: [NSImage.self], options: nil) {
            if let images = pasteboard.readObjects(forClasses: [NSImage.self], options: nil) as? [NSImage],
               let image = images.first {
                print("[ImageEdit] Successfully read image using NSImage class")
                print("[ImageEdit] Pasted image size: \(image.size.width)x\(image.size.height)")
                // Reset zoom and offset when pasting new image
                imageScale = 1.0
                imageOffset = .zero
                baseOffset = .zero
                isClipped = false
                print("[ImageEdit] Reset transform after paste - Scale: 1.0, Offset: (0, 0), Clipped: false")
                return image
            }
        }
        
        // Method 2: Try reading PNG data
        if pasteboard.availableType(from: [.png]) != nil {
            if let pngData = pasteboard.data(forType: .png),
               let image = NSImage(data: pngData) {
                print("[ImageEdit] Successfully read image from PNG data")
                print("[ImageEdit] Pasted image size: \(image.size.width)x\(image.size.height)")
                imageScale = 1.0
                imageOffset = .zero
                baseOffset = .zero
                isClipped = false
                print("[ImageEdit] Reset transform after paste - Scale: 1.0, Offset: (0, 0), Clipped: false")
                return image
            }
        }
        
        // Method 3: Try reading TIFF data
        if pasteboard.availableType(from: [.tiff]) != nil {
            if let tiffData = pasteboard.data(forType: .tiff),
               let image = NSImage(data: tiffData) {
                print("[ImageEdit] Successfully read image from TIFF data")
                print("[ImageEdit] Pasted image size: \(image.size.width)x\(image.size.height)")
                imageScale = 1.0
                imageOffset = .zero
                baseOffset = .zero
                isClipped = false
                print("[ImageEdit] Reset transform after paste - Scale: 1.0, Offset: (0, 0), Clipped: false")
                return image
            }
        }
        
        // Method 4: Try reading from file URL (if image file was copied)
        if let fileURLType = pasteboard.availableType(from: [.fileURL]) {
            // Try as property list first (most common on macOS)
            if let filePaths = pasteboard.propertyList(forType: fileURLType) as? [String],
               let firstPath = filePaths.first,
               let image = NSImage(contentsOfFile: firstPath) {
                print("[ImageEdit] Successfully read image from file path (property list): \(firstPath)")
                print("[ImageEdit] Pasted image size: \(image.size.width)x\(image.size.height)")
                imageScale = 1.0
                imageOffset = .zero
                baseOffset = .zero
                isClipped = false
                print("[ImageEdit] Reset transform after paste - Scale: 1.0, Offset: (0, 0), Clipped: false")
                return image
            }
            // Try as data/string
            if let fileURLData = pasteboard.data(forType: fileURLType),
               let fileURLString = String(data: fileURLData, encoding: .utf8),
               let fileURL = URL(string: fileURLString),
               let image = NSImage(contentsOf: fileURL) {
                print("[ImageEdit] Successfully read image from file URL (data): \(fileURLString)")
                print("[ImageEdit] Pasted image size: \(image.size.width)x\(image.size.height)")
                imageScale = 1.0
                imageOffset = .zero
                baseOffset = .zero
                isClipped = false
                print("[ImageEdit] Reset transform after paste - Scale: 1.0, Offset: (0, 0), Clipped: false")
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
                print("[ImageEdit] Successfully read image from public.file-url: \(urlString)")
                print("[ImageEdit] Pasted image size: \(image.size.width)x\(image.size.height)")
                imageScale = 1.0
                imageOffset = .zero
                baseOffset = .zero
                isClipped = false
                print("[ImageEdit] Reset transform after paste - Scale: 1.0, Offset: (0, 0), Clipped: false")
                return image
            }
        }
        
        print("[ImageEdit] Failed to read image from clipboard")
        return nil
    }
    
    /// Zoom in the image.
    func zoomIn() {
        let oldScale = imageScale
        imageScale = min(imageScale + 0.1, 5.0)
        print("[ImageEdit] Zoom in - Scale: \(String(format: "%.1f", oldScale)) -> \(String(format: "%.1f", imageScale)) (\(Int(imageScale * 100))%)")
    }
    
    /// Zoom out the image.
    func zoomOut() {
        let oldScale = imageScale
        imageScale = max(imageScale - 0.1, 0.1)
        print("[ImageEdit] Zoom out - Scale: \(String(format: "%.1f", oldScale)) -> \(String(format: "%.1f", imageScale)) (\(Int(imageScale * 100))%)")
    }
    
    /// Reset image transform (zoom and offset).
    func resetImageTransform() {
        print("[ImageEdit] Reset transform - Scale: \(String(format: "%.1f", imageScale)) -> 1.0, Offset: (\(String(format: "%.1f", imageOffset.width)), \(String(format: "%.1f", imageOffset.height))) -> (0, 0)")
        imageScale = 1.0
        imageOffset = .zero
        baseOffset = .zero
    }
    
    /// Clip the image to the 256x256 area defined by the clip rectangle.
    ///
    /// - Parameter viewSize: The size of the view containing the image
    func clipImage(viewSize: CGSize? = nil) {
        guard let originalImage = currentImage else {
            print("[ImageEdit] Clip failed - No image available")
            return
        }
        
        print("[ImageEdit] Starting clip operation")
        let clipSize: CGFloat = 256
        let imageSize = originalImage.size
        print("[ImageEdit] Original image size: \(imageSize.width)x\(imageSize.height)")
        print("[ImageEdit] Current scale: \(String(format: "%.2f", imageScale)), Offset: (\(String(format: "%.1f", imageOffset.width)), \(String(format: "%.1f", imageOffset.height)))")
        
        // Use provided view size or estimate based on image
        let viewWidth = viewSize?.width ?? max(imageSize.width, clipSize * 2)
        let viewHeight = viewSize?.height ?? max(imageSize.height, clipSize * 2)
        print("[ImageEdit] View size: \(viewWidth)x\(viewHeight)")
        
        // Calculate displayed image size using actual pixel size scaled by zoom
        // Displayed size = actual image size * zoom scale
        let displayedWidth = imageSize.width * imageScale
        let displayedHeight = imageSize.height * imageScale
        print("[ImageEdit] Displayed image size (real size * scale): \(displayedWidth)x\(displayedHeight)")
        
        // Clip rectangle is centered in view
        let clipCenterX = viewWidth / 2
        let clipCenterY = viewHeight / 2
        
        // Image center in view coordinates (accounting for offset)
        // The image is displayed at its actual size, so we need to find where its center is
        let imageCenterX = viewWidth / 2 + imageOffset.width
        let imageCenterY = viewHeight / 2 + imageOffset.height
        print("[ImageEdit] Clip center: (\(clipCenterX), \(clipCenterY)), Image center: (\(imageCenterX), \(imageCenterY))")
        
        // Clip rectangle is 256x256 in view coordinates
        // When zoomed, this represents a smaller area in displayed image coordinates
        // Clip size in displayed image coordinates = clipSize / imageScale
        let clipSizeInDisplayedX = clipSize / imageScale
        let clipSizeInDisplayedY = clipSize / imageScale
        
        // Convert clip size from displayed image coordinates to original image coordinates
        // Since displayed = original * scale, we divide by scale to get original coordinates
        let clipSizeInImageX = clipSizeInDisplayedX
        let clipSizeInImageY = clipSizeInDisplayedY
        print("[ImageEdit] Clip size in displayed coordinates: \(clipSizeInDisplayedX)x\(clipSizeInDisplayedY)")
        print("[ImageEdit] Clip size in image coordinates: \(clipSizeInImageX)x\(clipSizeInImageY)")
        
        // Calculate offset from image center to clip center
        // The offset is in view coordinates, need to convert to original image coordinates
        let clipOffsetInViewX = clipCenterX - imageCenterX
        let clipOffsetInViewY = clipCenterY - imageCenterY
        
        // Convert view offset to original image coordinates
        // Since displayed = original * scale, we divide by scale
        let clipOffsetInImageX = clipOffsetInViewX / imageScale
        let clipOffsetInImageY = clipOffsetInViewY / imageScale
        
        // Calculate clip position in original image coordinates
        let sourceClipX = (imageSize.width / 2) + clipOffsetInImageX - (clipSizeInImageX / 2)
        let sourceClipY = (imageSize.height / 2) - clipOffsetInImageY - (clipSizeInImageY / 2)
        print("[ImageEdit] Clip offset in view: (\(clipOffsetInViewX), \(clipOffsetInViewY))")
        print("[ImageEdit] Clip offset in image: (\(clipOffsetInImageX), \(clipOffsetInImageY))")
        print("[ImageEdit] Source clip position (before clamp): (\(sourceClipX), \(sourceClipY))")
        
        // Clamp to image bounds
        let clampedX = max(0, min(sourceClipX, imageSize.width - clipSizeInImageX))
        let clampedY = max(0, min(sourceClipY, imageSize.height - clipSizeInImageY))
        let clampedWidth = min(clipSizeInImageX, imageSize.width - clampedX)
        let clampedHeight = min(clipSizeInImageY, imageSize.height - clampedY)
        print("[ImageEdit] Clamped clip rect: (\(clampedX), \(clampedY), \(clampedWidth), \(clampedHeight))")
        
        // Create clipped image
        guard let cgImage = originalImage.cgImage(forProposedRect: nil, context: nil, hints: nil),
              let croppedCGImage = cgImage.cropping(to: CGRect(x: clampedX, y: clampedY, width: clampedWidth, height: clampedHeight)) else {
            print("[ImageEdit] Clip failed - Could not create CGImage or crop")
            errorMessage = "Failed to clip image"
            return
        }
        
        // Create new NSImage and scale to exact clip size
        let clippedImage = NSImage(cgImage: croppedCGImage, size: NSSize(width: clipSize, height: clipSize))
        print("[ImageEdit] Clipped image created - Size: \(clippedImage.size.width)x\(clippedImage.size.height)")
        
        // Update the image and reset transform
        // After clipping, treat the new image as a fresh start (isClipped = false)
        // so it can be zoomed and clipped again if needed
        currentImage = clippedImage
        imageScale = 1.0
        imageOffset = .zero
        baseOffset = .zero
        isClipped = false
        print("[ImageEdit] Clip complete - Reset transform to Scale: 1.0, Offset: (0, 0), Fresh start (isClipped: false)")
    }
    
    /// Update image offset from drag gesture.
    ///
    /// - Parameter translation: The drag translation
    func updateImageOffset(translation: CGSize) {
        let oldOffset = imageOffset
        imageOffset = CGSize(
            width: baseOffset.width + translation.width,
            height: baseOffset.height + translation.height
        )
        // Only log periodically to avoid spam during dragging
        if abs(imageOffset.width - oldOffset.width) > 10 || abs(imageOffset.height - oldOffset.height) > 10 {
            print("[ImageEdit] Pan update - Offset: (\(String(format: "%.1f", imageOffset.width)), \(String(format: "%.1f", imageOffset.height))), Translation: (\(String(format: "%.1f", translation.width)), \(String(format: "%.1f", translation.height)))")
        }
    }
    
    /// End drag gesture and save final position.
    func endDrag() {
        print("[ImageEdit] Drag ended - Final offset: (\(String(format: "%.1f", imageOffset.width)), \(String(format: "%.1f", imageOffset.height)))")
        baseOffset = imageOffset
    }
    
    /// Check if a word has an image.
    ///
    /// - Parameter word: The vocabulary word
    /// - Returns: True if image exists, false otherwise
    func hasImage(_ word: VocabularyWord) -> Bool {
        return ImageManager.imageExists(for: word.englishWord, level: word.level)
    }
}

