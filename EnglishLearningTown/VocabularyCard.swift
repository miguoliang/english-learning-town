//
//  VocabularyCard.swift
//  EnglishLearningTown
//
//  Created by Frank Mi on 2025/11/8.
//

import SpriteKit
import Speech
import AVFoundation

class VocabularyCard: SKNode {
    let vocabularyWord: VocabularyWord
    var isFlipped: Bool = false
    var isAnswered: Bool = false
    var correctAnswer: String
    var onAnswerSelected: ((Bool) -> Void)?
    
    var cardBack: SKShapeNode!
    var cardFront: SKShapeNode!
    private var emojiLabel: SKLabelNode?
    private var imageNode: SKSpriteNode?
    private var questionLabel: SKLabelNode!
    private var statusLabel: SKLabelNode!
    private var startButton: SKNode!
    private var stopButton: SKNode!
    private var showPromptButton: SKNode!
    private var promptLabel: SKLabelNode!
    private var isPromptVisible: Bool = false
    private var isListening: Bool = false
    private var isManuallyStopping: Bool = false
    private var starLabel: SKLabelNode?
    
    private var speechRecognizer: SFSpeechRecognizer?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    
    init(vocabularyWord: VocabularyWord, size: CGSize) {
        self.vocabularyWord = vocabularyWord
        self.correctAnswer = vocabularyWord.englishWord
        super.init()
        
        setupCard(size: size)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupCard(size: CGSize) {
        cardBack = SKShapeNode(rectOf: size, cornerRadius: 10)
        cardBack.fillColor = SKColor(red: 0.3, green: 0.5, blue: 0.8, alpha: 1.0)
        cardBack.strokeColor = SKColor.white
        cardBack.lineWidth = 3
        addChild(cardBack)
        
        let questionMark = SKLabelNode(fontNamed: "Arial-BoldMT")
        questionMark.text = "?"
        questionMark.fontSize = 60
        questionMark.fontColor = .white
        cardBack.addChild(questionMark)
        
        cardFront = SKShapeNode(rectOf: size, cornerRadius: 10)
        cardFront.fillColor = SKColor(red: 0.95, green: 0.95, blue: 0.95, alpha: 1.0)
        cardFront.strokeColor = SKColor.darkGray
        cardFront.lineWidth = 3
        cardFront.isHidden = true
        addChild(cardFront)
        
        // Try to load image from Asset Catalog first
        if let imageName = vocabularyWord.imageName, let image = NSImage(named: imageName) {
            // Create sprite node from image
            let texture = SKTexture(image: image)
            imageNode = SKSpriteNode(texture: texture)
            imageNode?.size = CGSize(width: 80, height: 80)
            imageNode?.position = CGPoint(x: 0, y: 10)
            cardFront.addChild(imageNode!)
        } else {
            // Fall back to emoji if no image available
            let emoji = EmojiMapper.emoji(for: vocabularyWord.englishWord) ?? "❓"
            emojiLabel = SKLabelNode(fontNamed: "Arial")
            emojiLabel.text = emoji
            emojiLabel.fontSize = 50
            emojiLabel.position = CGPoint(x: 0, y: 10)
            cardFront.addChild(emojiLabel)
        }
        
        questionLabel = SKLabelNode(fontNamed: "Arial")
        questionLabel.text = "Say the word"
        questionLabel.fontSize = 16
        questionLabel.fontColor = .darkGray
        questionLabel.position = CGPoint(x: 0, y: -30)
        cardFront.addChild(questionLabel)
        
        statusLabel = SKLabelNode(fontNamed: "Arial")
        statusLabel.fontSize = 14
        statusLabel.fontColor = .blue
        statusLabel.position = CGPoint(x: 0, y: -55)
        cardFront.addChild(statusLabel)
        
        startButton = createButton(text: "Start Listening", color: SKColor(red: 0.2, green: 0.6, blue: 0.9, alpha: 1.0))
        startButton.position = CGPoint(x: 0, y: -80)
        startButton.name = "startButton"
        cardFront.addChild(startButton)
        
        stopButton = createButton(text: "Stop Listening", color: SKColor(red: 0.9, green: 0.3, blue: 0.3, alpha: 1.0))
        stopButton.position = CGPoint(x: 0, y: -80)
        stopButton.name = "stopButton"
        stopButton.isHidden = true
        cardFront.addChild(stopButton)
        
        showPromptButton = createButton(text: "Show Prompt", color: SKColor(red: 0.6, green: 0.6, blue: 0.6, alpha: 1.0))
        showPromptButton.position = CGPoint(x: 0, y: -115)
        showPromptButton.name = "showPromptButton"
        cardFront.addChild(showPromptButton)
        
        promptLabel = SKLabelNode(fontNamed: "Arial")
        promptLabel.fontSize = 11
        promptLabel.fontColor = .darkGray
        promptLabel.position = CGPoint(x: 0, y: -145)
        promptLabel.horizontalAlignmentMode = .center
        promptLabel.verticalAlignmentMode = .top
        promptLabel.isHidden = true
        cardFront.addChild(promptLabel)
    }
    
    private func createButton(text: String, color: SKColor) -> SKNode {
        let button = SKNode()
        
        let background = SKShapeNode(rectOf: CGSize(width: 120, height: 30), cornerRadius: 6)
        background.fillColor = color
        background.strokeColor = .darkGray
        background.lineWidth = 2
        button.addChild(background)
        
        let label = SKLabelNode(fontNamed: "Arial-BoldMT")
        label.text = text
        label.fontSize = 14
        label.fontColor = .white
        label.verticalAlignmentMode = .center
        button.addChild(label)
        
        return button
    }
    
    func flip() {
        guard !isFlipped && !isAnswered else { return }
        
        isFlipped = true
        
        let flipAction = SKAction.scaleX(to: 0, duration: 0.15)
        let showFront = SKAction.run {
            self.cardBack.isHidden = true
            self.cardFront.isHidden = false
        }
        let flipBack = SKAction.scaleX(to: 1, duration: 0.15)
        run(SKAction.sequence([flipAction, showFront, flipBack]))
    }
    
    func startListening() {
        guard !isAnswered && !isListening else { return }
        isListening = true
        startButton.isHidden = true
        stopButton.isHidden = false
        statusLabel.text = "Listening..."
        statusLabel.fontColor = .blue
        
        SFSpeechRecognizer.requestAuthorization { [weak self] authStatus in
            DispatchQueue.main.async {
                switch authStatus {
                case .authorized:
                    self?.performStartListening()
                case .denied, .restricted, .notDetermined:
                    self?.statusLabel.text = "Speech recognition not authorized"
                    self?.statusLabel.fontColor = .red
                    self?.isListening = false
                    self?.startButton.isHidden = false
                    self?.stopButton.isHidden = true
                @unknown default:
                    self?.statusLabel.text = "Speech recognition unavailable"
                    self?.statusLabel.fontColor = .red
                    self?.isListening = false
                    self?.startButton.isHidden = false
                    self?.stopButton.isHidden = true
                }
            }
        }
    }
    
    func stopListening() {
        guard isListening else { return }
        isManuallyStopping = true
        isListening = false
        startButton.isHidden = false
        stopButton.isHidden = true
        statusLabel.text = ""
        statusLabel.fontColor = .blue
        
        performStopListening()
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
            self?.isManuallyStopping = false
        }
    }
    
    private func performStartListening() {
        performStopListening()
        
        if audioEngine.isRunning {
            audioEngine.stop()
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
            self?.setupSpeechRecognition()
        }
    }
    
    private func setupSpeechRecognition() {
        speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
        
        guard let speechRecognizer = speechRecognizer, speechRecognizer.isAvailable else {
            statusLabel.text = "Speech recognition unavailable"
            statusLabel.fontColor = .red
            return
        }
        
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let recognitionRequest = recognitionRequest else {
            statusLabel.text = "Could not create recognition request"
            statusLabel.fontColor = .red
            return
        }
        
        recognitionRequest.shouldReportPartialResults = true
        
        let inputNode = audioEngine.inputNode
        inputNode.removeTap(onBus: 0)
        audioEngine.reset()
        
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { [weak self] buffer, _ in
            guard let self = self, let recognitionRequest = self.recognitionRequest else { return }
            recognitionRequest.append(buffer)
        }
        
        let mainMixerNode = audioEngine.mainMixerNode
        mainMixerNode.outputVolume = 0.0
        audioEngine.connect(inputNode, to: mainMixerNode, format: recordingFormat)
        audioEngine.prepare()
        
        do {
            try audioEngine.start()
        } catch {
            statusLabel.text = "Audio engine error"
            statusLabel.fontColor = .red
            return
        }
        
        recognitionTask = speechRecognizer.recognitionTask(with: recognitionRequest) { [weak self] result, error in
            guard let self = self else { return }
            
            if let error = error {
                print("[Speech Recognition] Error: \(error.localizedDescription)")
                let nsError = error as NSError
                if nsError.code == 216 {
                    return
                }
                DispatchQueue.main.async {
                    guard !self.isAnswered && !self.isManuallyStopping else { return }
                    self.isListening = false
                    self.startButton.isHidden = false
                    self.stopButton.isHidden = true
                    self.statusLabel.text = "Error: \(error.localizedDescription)"
                    self.statusLabel.fontColor = .red
                    self.performStopListening()
                }
                return
            }
            
            guard let result = result else { return }
            
            let spokenText = result.bestTranscription.formattedString.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
            let isFinal = result.isFinal
            let correctAnswerLower = self.correctAnswer.lowercased()
            
            DispatchQueue.main.async {
                if spokenText == correctAnswerLower || spokenText.contains(correctAnswerLower) {
                    self.markAsAnswered(correct: true)
                    self.isListening = false
                    self.startButton.isHidden = true
                    self.stopButton.isHidden = true
                    self.statusLabel.text = "Correct! ✓"
                    self.statusLabel.fontColor = .green
                    self.performStopListening()
                    self.onAnswerSelected?(true)
                } else if isFinal && !spokenText.isEmpty {
                    self.statusLabel.text = "Try again"
                    self.statusLabel.fontColor = .orange
                    self.isListening = false
                    self.startButton.isHidden = false
                    self.stopButton.isHidden = true
                    self.performStopListening()
                } else if !spokenText.isEmpty {
                    self.statusLabel.text = "Heard: \(spokenText)"
                    self.statusLabel.fontColor = .blue
                }
            }
        }
    }
    
    private func performStopListening() {
        recognitionTask?.cancel()
        recognitionTask = nil
        
        recognitionRequest?.endAudio()
        recognitionRequest = nil
        
        if audioEngine.isRunning {
            audioEngine.stop()
        }
        
        let inputNode = audioEngine.inputNode
        inputNode.removeTap(onBus: 0)
        audioEngine.reset()
    }
    
    func cleanup() {
        stopListening()
    }
    
    func handleButtonClick(at location: CGPoint) -> Bool {
        guard let scene = self.scene else { return false }
        let localLocation = self.convert(location, from: scene)
        
        if startButton.contains(localLocation) && !startButton.isHidden {
            startListening()
            return true
        } else if stopButton.contains(localLocation) && !stopButton.isHidden {
            stopListening()
            return true
        } else if showPromptButton.contains(localLocation) && !showPromptButton.isHidden {
            togglePrompt()
            return true
        }
        return false
    }
    
    private func togglePrompt() {
        isPromptVisible.toggle()
        promptLabel.isHidden = !isPromptVisible
        
        if isPromptVisible {
            let promptText = "\(vocabularyWord.chineseTranslation)\n\(vocabularyWord.exampleSentence)"
            promptLabel.text = promptText
            updateButtonText(showPromptButton, text: "Hide Prompt")
        } else {
            promptLabel.text = ""
            updateButtonText(showPromptButton, text: "Show Prompt")
        }
    }
    
    private func updateButtonText(_ button: SKNode, text: String) {
        if let label = button.children.first(where: { $0 is SKLabelNode }) as? SKLabelNode {
            label.text = text
        }
    }
    
    func markAsAnswered(correct: Bool) {
        isAnswered = true
        
        if correct {
            cardFront.fillColor = SKColor(red: 0.4, green: 0.8, blue: 0.4, alpha: 1.0)
            playSuccessAnimation()
        } else {
            cardFront.fillColor = SKColor(red: 0.8, green: 0.4, blue: 0.4, alpha: 1.0)
        }
        
        startButton.isHidden = true
        stopButton.isHidden = true
        showPromptButton.isHidden = true
        promptLabel.isHidden = true
        performStopListening()
    }
    
    private func playSuccessAnimation() {
        guard self.scene != nil else { return }
        
        // Add confetti/sparkle effect
        let confetti = ConfettiEmitter.createSparkle(at: CGPoint(x: 0, y: 0))
        addChild(confetti)
        
        // Add star above card
        let star = SKLabelNode(fontNamed: "Arial")
        star.text = "⭐"
        star.fontSize = 40
        star.position = CGPoint(x: 0, y: cardFront.frame.height / 2 + 30)
        star.alpha = 0
        star.setScale(0.5)
        addChild(star)
        starLabel = star
        
        // Animate star appearance
        let scaleUp = SKAction.scale(to: 1.2, duration: 0.3)
        let scaleDown = SKAction.scale(to: 1.0, duration: 0.1)
        let fadeIn = SKAction.fadeIn(withDuration: 0.2)
        let bounce = SKAction.sequence([scaleUp, scaleDown])
        
        star.run(SKAction.group([bounce, fadeIn]))
        
        // Pulse animation for card
        let pulseUp = SKAction.scale(to: 1.1, duration: 0.15)
        let pulseDown = SKAction.scale(to: 1.0, duration: 0.15)
        let pulse = SKAction.sequence([pulseUp, pulseDown])
        run(pulse)
    }
    
    deinit {
        cleanup()
    }
}

