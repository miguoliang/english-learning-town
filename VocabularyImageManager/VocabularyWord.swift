//
//  VocabularyWord.swift
//  VocabularyImageManager
//
//  Created by Frank Mi on 2025/11/8.
//

import Foundation

struct VocabularyWord: Codable {
    let englishWord: String
    let pos: String
    let level: String
    let chineseTranslation: String
    let exampleSentence: String
    let selfExaminePrompt: String
    let theme: String
    let imageName: String?
}

