//
//  VocabularyDialog.swift
//  EnglishLearningTown
//
//  Created by Frank Mi on 2025/11/8.
//

import SpriteKit
import Speech
import AVFoundation

class VocabularyDialog: SKNode {
    var vocabularyWord: VocabularyWord
    var correctAnswer: String
    var onAnswerSelected: ((Bool) -> Void)?
    
    private var dialogBackground: SKShapeNode!
    private var emojiLabel: SKLabelNode!
    private var statusLabel: SKLabelNode!
    private var instructionLabel: SKLabelNode!
    private var cancelButton: SKNode!
    
    private var speechRecognizer: SFSpeechRecognizer?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    
    init(vocabularyWord: VocabularyWord, allWords: [VocabularyWord]) {
        self.vocabularyWord = vocabularyWord
        self.correctAnswer = vocabularyWord.englishWord
        
        super.init()
        
        setupDialog()
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupDialog() {
        // Create background
        dialogBackground = SKShapeNode(rectOf: CGSize(width: 500, height: 400), cornerRadius: 20)
        dialogBackground.fillColor = SKColor(red: 0.95, green: 0.95, blue: 0.95, alpha: 0.95)
        dialogBackground.strokeColor = .black
        dialogBackground.lineWidth = 3
        dialogBackground.position = CGPoint(x: 0, y: 0)
        addChild(dialogBackground)
        
        // Emoji display
        let emoji = EmojiMapper.emoji(for: vocabularyWord.englishWord) ?? "❓"
        emojiLabel = SKLabelNode(fontNamed: "Arial")
        emojiLabel.text = emoji
        emojiLabel.fontSize = 100
        emojiLabel.position = CGPoint(x: 0, y: 100)
        addChild(emojiLabel)
        
        // Instruction label
        instructionLabel = SKLabelNode(fontNamed: "Arial")
        instructionLabel.text = "Say the word matching the emoji"
        instructionLabel.fontSize = 20
        instructionLabel.fontColor = .darkGray
        instructionLabel.position = CGPoint(x: 0, y: -50)
        addChild(instructionLabel)
        
        // Status label (shows listening/result)
        statusLabel = SKLabelNode(fontNamed: "Arial")
        statusLabel.text = "Listening..."
        statusLabel.fontSize = 24
        statusLabel.fontColor = .blue
        statusLabel.position = CGPoint(x: 0, y: -100)
        addChild(statusLabel)
        
        // Cancel button
        cancelButton = createCancelButton()
        cancelButton.position = CGPoint(x: 0, y: -160)
        cancelButton.name = "cancelButton"
        addChild(cancelButton)
        
        // Request speech recognition authorization and start listening
        requestSpeechAuthorization()
    }
    
    private func requestSpeechAuthorization() {
        // On macOS, microphone permission is handled through System Preferences
        // The orange indicator appears when the mic is actually being used
        // Request speech recognition permission first
        SFSpeechRecognizer.requestAuthorization { [weak self] authStatus in
            DispatchQueue.main.async {
                switch authStatus {
                case .authorized:
                    // Check microphone permission status
                    #if os(macOS)
                    // On macOS, AVAudioSession might not be available
                    // The mic indicator will appear when audio engine starts
                    self?.startListening()
                    #else
                    // On iOS, explicitly request microphone permission
                    AVAudioSession.sharedInstance().requestRecordPermission { granted in
                        print("[Speech Recognition] Microphone permission: \(granted ? "granted" : "denied")")
                        DispatchQueue.main.async {
                            if granted {
                                self?.startListening()
                            } else {
                                self?.statusLabel.text = "Microphone permission denied"
                                self?.statusLabel.fontColor = .red
                            }
                        }
                    }
                    #endif
                case .denied, .restricted, .notDetermined:
                    self?.statusLabel.text = "Speech recognition not authorized"
                    self?.statusLabel.fontColor = .red
                @unknown default:
                    self?.statusLabel.text = "Speech recognition unavailable"
                    self?.statusLabel.fontColor = .red
                }
            }
        }
    }
    
    private func startListening() {
        // Stop any existing recognition and ensure clean state
        stopListening()
        
        // Ensure audio engine is completely stopped and reset
        if audioEngine.isRunning {
            audioEngine.stop()
        }
        
        // Small delay to ensure audio engine is fully stopped
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
            self?.performStartListening()
        }
    }
    
    private func performStartListening() {
        print("[Speech Recognition] Starting to listen for word: '\(correctAnswer)'")
        
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
        
        // Safely remove tap if installed (may throw if not installed, but that's okay)
        inputNode.removeTap(onBus: 0)
        
        // Reset audio engine connections
        audioEngine.reset()
        
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        
        print("[Speech Recognition] Audio engine input node format: \(recordingFormat)")
        print("[Speech Recognition] Input node available: \(inputNode)")
        print("[Speech Recognition] Input node number of inputs: \(inputNode.numberOfInputs)")
        
        // Check available audio input devices
        let availableInputs = inputNode.inputFormat(forBus: 0)
        print("[Speech Recognition] Available input format: \(availableInputs)")
        
        // Check if we have input channels
        if availableInputs.channelCount > 0 {
            print("[Speech Recognition] Default input device has \(availableInputs.channelCount) channels")
        } else {
            print("[Speech Recognition] WARNING: No input channels available!")
            statusLabel.text = "No microphone available"
            statusLabel.fontColor = .red
            return
        }
        
        print("[Speech Recognition] Installing tap on input node...")
        
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { [weak self] buffer, _ in
            guard let self = self, let recognitionRequest = self.recognitionRequest else { return }
            recognitionRequest.append(buffer)
            // Debug: Check if we're actually receiving audio data
            let channelData = buffer.floatChannelData?[0]
            if let channelData = channelData {
                let frameLength = Int(buffer.frameLength)
                var sum: Float = 0
                for i in 0..<min(frameLength, 100) {
                    sum += abs(channelData[i])
                }
                let average = sum / Float(min(frameLength, 100))
                // Log audio activity periodically (every 50th buffer to avoid spam)
                if Int.random(in: 0..<50) == 0 {
                    print("[Speech Recognition] Audio buffer received - average amplitude: \(String(format: "%.6f", average))")
                }
            }
        }
        
        // On macOS, we need to connect the input node to the main mixer
        // to force the audio engine to actually pull audio from the microphone
        let mainMixerNode = audioEngine.mainMixerNode
        audioEngine.connect(inputNode, to: mainMixerNode, format: recordingFormat)
        
        // Note: prepare() must be called after connecting nodes
        audioEngine.prepare()
        
        do {
            try audioEngine.start()
            print("[Speech Recognition] Audio engine started successfully")
            print("[Speech Recognition] Audio engine isRunning: \(audioEngine.isRunning)")
            
            // Check input node status
            let inputFormat = audioEngine.inputNode.inputFormat(forBus: 0)
            print("[Speech Recognition] Input format after start: \(inputFormat)")
            print("[Speech Recognition] Sample rate: \(inputFormat.sampleRate)")
            print("[Speech Recognition] Channel count: \(inputFormat.channelCount)")
        } catch {
            print("[Speech Recognition] Audio engine error: \(error.localizedDescription)")
            statusLabel.text = "Audio engine error"
            statusLabel.fontColor = .red
            return
        }
        
        recognitionTask = speechRecognizer.recognitionTask(with: recognitionRequest) { [weak self] result, error in
            guard let self = self else { return }
            
            var isFinal = false
            
            if let result = result {
                let spokenText = result.bestTranscription.formattedString.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
                isFinal = result.isFinal
                
                // Debug output
                print("[Speech Recognition] Heard: '\(spokenText)' (isFinal: \(isFinal))")
                
                // Check if spoken text matches the correct answer
                let correctAnswerLower = self.correctAnswer.lowercased()
                
                if spokenText == correctAnswerLower || spokenText.contains(correctAnswerLower) {
                    // Correct answer!
                    print("[Speech Recognition] ✓ MATCH! Spoken: '\(spokenText)' matches correct answer: '\(correctAnswerLower)'")
                    self.stopListening()
                    self.statusLabel.text = "Correct! ✓"
                    self.statusLabel.fontColor = .green
                    
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                        self.onAnswerSelected?(true)
                    }
                    isFinal = true
                } else if isFinal && !spokenText.isEmpty {
                    // Final result but incorrect
                    print("[Speech Recognition] ✗ No match. Spoken: '\(spokenText)', Expected: '\(correctAnswerLower)'")
                    self.stopListening()
                    self.statusLabel.text = "Try again"
                    self.statusLabel.fontColor = .orange
                    
                    // Restart listening after a delay
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                        self.startListening()
                    }
                } else if !spokenText.isEmpty {
                    // Show partial results
                    print("[Speech Recognition] Partial result: '\(spokenText)'")
                    self.statusLabel.text = "Heard: \(spokenText)"
                    self.statusLabel.fontColor = .blue
                }
            }
            
            if error != nil || isFinal {
                if let error = error {
                    print("[Speech Recognition] Error: \(error.localizedDescription)")
                }
                if error != nil && !isFinal {
                    // Error occurred, restart listening
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                        self.startListening()
                    }
                }
            }
        }
    }
    
    private func stopListening() {
        print("[Speech Recognition] Stopping audio engine...")
        
        // Cancel recognition task first
        recognitionTask?.cancel()
        recognitionTask = nil
        
        // End audio recognition request
        recognitionRequest?.endAudio()
        recognitionRequest = nil
        
        // Stop audio engine if running
        if audioEngine.isRunning {
            audioEngine.stop()
        }
        
        // Safely remove tap if installed
        let inputNode = audioEngine.inputNode
        inputNode.removeTap(onBus: 0)
        
        // Reset audio engine to clean state
        audioEngine.reset()
        
        print("[Speech Recognition] Audio engine stopped. isRunning: \(audioEngine.isRunning)")
    }
    
    func cleanup() {
        stopListening()
    }
    
    func handleClick(at location: CGPoint) -> Bool {
        // Convert scene coordinates to dialog's local coordinates
        guard let parent = self.parent else { return false }
        let localLocation = self.convert(location, from: parent)
        
        if cancelButton.contains(localLocation) {
            cancel()
            return true
        }
        
        return false
    }
    
    private func cancel() {
        stopListening()
        print("[Speech Recognition] Cancelled by user")
        statusLabel.text = "Cancelled"
        statusLabel.fontColor = .gray
        
        // Notify that dialog was cancelled (false means incorrect/cancelled)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.onAnswerSelected?(false)
        }
    }
    
    private func createCancelButton() -> SKNode {
        let button = SKNode()
        
        let background = SKShapeNode(rectOf: CGSize(width: 150, height: 40), cornerRadius: 8)
        background.fillColor = SKColor(red: 0.8, green: 0.3, blue: 0.3, alpha: 1.0)
        background.strokeColor = .darkGray
        background.lineWidth = 2
        button.addChild(background)
        
        let label = SKLabelNode(fontNamed: "Arial-BoldMT")
        label.text = "Cancel"
        label.fontSize = 20
        label.fontColor = .white
        label.verticalAlignmentMode = .center
        button.addChild(label)
        
        return button
    }
    
    deinit {
        cleanup()
    }
}
