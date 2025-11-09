//
//  CSVParser.swift
//  EnglishLearningTown
//
//  Created by Frank Mi on 2025/11/8.
//

import Foundation

class CSVParser {
    static func parseCSV(fileName: String) -> [VocabularyWord] {
        guard let path = Bundle.main.path(forResource: fileName, ofType: "csv") else {
            print("Could not find CSV file: \(fileName)")
            return []
        }
        
        guard let content = try? String(contentsOfFile: path, encoding: .utf8) else {
            print("Could not read CSV file: \(fileName)")
            return []
        }
        
        var words: [VocabularyWord] = []
        let lines = content.components(separatedBy: .newlines)
        
        // Skip header line
        for (index, line) in lines.enumerated() {
            if index == 0 || line.isEmpty {
                continue
            }
            
            // Parse CSV line (handling quoted fields)
            let parsed = parseCSVLine(line)
            if parsed.count >= 7 {
                let word = VocabularyWord(
                    englishWord: parsed[0].trimmingCharacters(in: .whitespacesAndNewlines),
                    pos: parsed[1].trimmingCharacters(in: .whitespacesAndNewlines),
                    level: parsed[2].trimmingCharacters(in: .whitespacesAndNewlines),
                    chineseTranslation: parsed[3].trimmingCharacters(in: .whitespacesAndNewlines),
                    exampleSentence: parsed[4].trimmingCharacters(in: .whitespacesAndNewlines),
                    selfExaminePrompt: parsed[5].trimmingCharacters(in: .whitespacesAndNewlines),
                    theme: parsed[6].trimmingCharacters(in: .whitespacesAndNewlines)
                )
                words.append(word)
            }
        }
        
        return words
    }
    
    private static func parseCSVLine(_ line: String) -> [String] {
        var result: [String] = []
        var currentField = ""
        var insideQuotes = false
        
        for char in line {
            if char == "\"" {
                insideQuotes.toggle()
            } else if char == "," && !insideQuotes {
                result.append(currentField)
                currentField = ""
            } else {
                currentField.append(char)
            }
        }
        result.append(currentField)
        
        return result
    }
}

