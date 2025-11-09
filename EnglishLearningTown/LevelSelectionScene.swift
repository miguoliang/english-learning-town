//
//  LevelSelectionScene.swift
//  EnglishLearningTown
//
//  Created by Frank Mi on 2025/11/8.
//

import SpriteKit
import Speech
import AVFoundation
import CoreAudio

class LevelSelectionScene: SKScene {
    
    // Speech recognition properties
    private var speechRecognizer: SFSpeechRecognizer?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let speechAudioEngine = AVAudioEngine()
    private var statusLabel: SKLabelNode?
    private var resultLabel: SKLabelNode?
    private var debugLabel: SKLabelNode?
    private var isTapInstalled = false
    
    override func didMove(to view: SKView) {
        backgroundColor = SKColor(red: 0.2, green: 0.3, blue: 0.5, alpha: 1.0)
        
        // Title
        let titleLabel = SKLabelNode(fontNamed: "Arial-BoldMT")
        titleLabel.text = "Speech Recognition Debug"
        titleLabel.fontSize = 48
        titleLabel.fontColor = .white
        titleLabel.position = CGPoint(x: size.width / 2, y: size.height * 0.85)
        addChild(titleLabel)
        
        // Status label
        statusLabel = SKLabelNode(fontNamed: "Arial")
        statusLabel?.text = "Initializing..."
        statusLabel?.fontSize = 32
        statusLabel?.fontColor = .yellow
        statusLabel?.position = CGPoint(x: size.width / 2, y: size.height * 0.65)
        addChild(statusLabel!)
        
        // Result label
        resultLabel = SKLabelNode(fontNamed: "Arial")
        resultLabel?.text = ""
        resultLabel?.fontSize = 28
        resultLabel?.fontColor = .white
        resultLabel?.position = CGPoint(x: size.width / 2, y: size.height * 0.5)
        addChild(resultLabel!)
        
        // Debug label
        debugLabel = SKLabelNode(fontNamed: "Arial")
        debugLabel?.text = ""
        debugLabel?.fontSize = 16
        debugLabel?.fontColor = .lightGray
        debugLabel?.position = CGPoint(x: size.width / 2, y: size.height * 0.3)
        addChild(debugLabel!)

        // Start button
        let startButton = createStartButton()
        startButton.position = CGPoint(x: size.width / 2, y: size.height * 0.15)
        addChild(startButton)

        // Set initial status
        statusLabel?.text = "Click 'Start Listening' to begin"
        statusLabel?.fontColor = .cyan
    }
    
    override func mouseDown(with event: NSEvent) {
        let location = event.location(in: self)
        let nodes = self.nodes(at: location)
        
        for node in nodes {
            if node.name == "startButton" {
                startSpeechRecognition()
                return
            }
            
            if node.name == "stopButton" {
                stopSpeechRecognition()
                return
            }
        }
    }
    
    private func createStartButton() -> SKNode {
        let button = SKNode()
        button.name = "startButton"
        
        let background = SKShapeNode(rectOf: CGSize(width: 200, height: 60), cornerRadius: 10)
        background.fillColor = SKColor(red: 0.2, green: 0.7, blue: 0.2, alpha: 1.0)
        background.strokeColor = .white
        background.lineWidth = 2
        button.addChild(background)
        
        let label = SKLabelNode(fontNamed: "Arial-BoldMT")
        label.text = "Start Listening"
        label.fontSize = 24
        label.fontColor = .white
        label.verticalAlignmentMode = .center
        button.addChild(label)
        
        return button
    }
    
    private func startSpeechRecognition() {
        print("[DEBUG] Starting speech recognition...")
        updateDebug("Requesting speech recognition authorization...")
        statusLabel?.text = "Requesting authorization..."
        statusLabel?.fontColor = .yellow
        
        // Request speech recognition authorization first
        SFSpeechRecognizer.requestAuthorization { [weak self] authStatus in
            DispatchQueue.main.async {
                print("[DEBUG] Speech recognition authorization status: \(authStatus.rawValue)")
                switch authStatus {
                case .authorized:
                    print("[DEBUG] Speech recognition authorized, requesting microphone permission...")
                    self?.updateDebug("Speech authorized ✓, requesting mic...")
                    self?.requestMicrophonePermission()
                case .denied:
                    self?.updateDebug("Speech recognition DENIED")
                    self?.statusLabel?.text = "Speech Recognition DENIED"
                    self?.statusLabel?.fontColor = .red
                case .restricted:
                    self?.updateDebug("Speech recognition RESTRICTED")
                    self?.statusLabel?.text = "Speech Recognition RESTRICTED"
                    self?.statusLabel?.fontColor = .red
                case .notDetermined:
                    self?.updateDebug("Speech recognition NOT DETERMINED")
                    self?.statusLabel?.text = "Speech Recognition NOT DETERMINED"
                    self?.statusLabel?.fontColor = .orange
                @unknown default:
                    self?.updateDebug("Unknown authorization status")
                    self?.statusLabel?.text = "Unknown status"
                    self?.statusLabel?.fontColor = .red
                }
            }
        }
    }
    
    private func requestMicrophonePermission() {
        print("[DEBUG] Checking microphone permission...")
        updateDebug("Checking microphone permission...")

        // First check the current authorization status
        let authStatus = AVCaptureDevice.authorizationStatus(for: .audio)
        print("[DEBUG] Current AVCaptureDevice authorization status: \(authStatus.rawValue)")
        switch authStatus {
        case .authorized:
            print("[DEBUG] Already authorized")
        case .denied:
            print("[DEBUG] Previously denied")
        case .notDetermined:
            print("[DEBUG] Not yet determined")
        case .restricted:
            print("[DEBUG] Restricted")
        @unknown default:
            print("[DEBUG] Unknown status")
        }

        // Request microphone permission explicitly on macOS
        AVCaptureDevice.requestAccess(for: .audio) { [weak self] granted in
            DispatchQueue.main.async {
                print("[DEBUG] ========================================")
                print("[DEBUG] AVCaptureDevice.requestAccess result: \(granted)")
                print("[DEBUG] ========================================")

                if granted {
                    self?.updateDebug("Microphone permission granted ✓")

                    // Double-check by creating a test capture session
                    print("[DEBUG] Testing actual microphone access with AVCaptureSession...")
                    self?.testMicrophoneAccess()

                    self?.startListening()
                } else {
                    self?.updateDebug("Microphone permission DENIED")
                    self?.statusLabel?.text = "Microphone Permission DENIED - Check System Settings"
                    self?.statusLabel?.fontColor = .red
                    print("[DEBUG] ❌ ERROR: Microphone permission was denied!")
                    print("[DEBUG] Please go to:")
                    print("[DEBUG]   System Settings → Privacy & Security → Microphone")
                    print("[DEBUG]   Enable: EnglishLearningTown")
                }
            }
        }
    }

    private func testMicrophoneAccess() {
        let captureSession = AVCaptureSession()

        guard let audioDevice = AVCaptureDevice.default(for: .audio) else {
            print("[DEBUG] ❌ No audio device available for testing")
            return
        }

        print("[DEBUG] Testing with device: \(audioDevice.localizedName)")

        do {
            let audioInput = try AVCaptureDeviceInput(device: audioDevice)
            if captureSession.canAddInput(audioInput) {
                captureSession.addInput(audioInput)
                print("[DEBUG] ✓ Successfully added audio input to test capture session")

                // Start and immediately stop the session
                captureSession.startRunning()
                print("[DEBUG] ✓ Test capture session started - microphone access works!")
                print("[DEBUG] ✓ You should see the orange indicator now!")

                // Stop after a moment
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    captureSession.stopRunning()
                    print("[DEBUG] Test capture session stopped")
                }
            } else {
                print("[DEBUG] ❌ Cannot add audio input to test session")
            }
        } catch {
            print("[DEBUG] ❌ Error creating audio input: \(error.localizedDescription)")
        }
    }
    
    private func updateDebug(_ message: String) {
        print("[DEBUG] \(message)")
        debugLabel?.text = message
    }
    
    private func startListening() {
        print("[DEBUG] startListening() called")
        updateDebug("Stopping any existing recognition...")

        // Stop any existing recognition - this will properly clean up the engine
        stopListening()

        // Give the audio system time to fully release resources
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) { [weak self] in
            self?.performStartListening()
        }
    }
    
    private func performStartListening() {
        print("[DEBUG] performStartListening() called")
        updateDebug("Creating speech recognizer...")
        statusLabel?.text = "Initializing..."
        statusLabel?.fontColor = .yellow
        
        speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
        
        guard let speechRecognizer = speechRecognizer else {
            print("[DEBUG] ERROR: Could not create speech recognizer")
            updateDebug("ERROR: Could not create speech recognizer")
            statusLabel?.text = "ERROR: No recognizer"
            statusLabel?.fontColor = .red
            return
        }
        
        print("[DEBUG] Speech recognizer created, available: \(speechRecognizer.isAvailable)")
        updateDebug("Recognizer available: \(speechRecognizer.isAvailable)")
        
        guard speechRecognizer.isAvailable else {
            print("[DEBUG] ERROR: Speech recognizer not available")
            updateDebug("ERROR: Recognizer not available")
            statusLabel?.text = "ERROR: Recognizer unavailable"
            statusLabel?.fontColor = .red
            return
        }
        
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        
        guard let recognitionRequest = recognitionRequest else {
            print("[DEBUG] ERROR: Could not create recognition request")
            updateDebug("ERROR: Could not create request")
            statusLabel?.text = "ERROR: No request"
            statusLabel?.fontColor = .red
            return
        }
        
        print("[DEBUG] Recognition request created")
        updateDebug("Setting up audio engine...")
        
        recognitionRequest.shouldReportPartialResults = true

        // Ensure engine is fully stopped before configuration
        if speechAudioEngine.isRunning {
            print("[DEBUG] Stopping audio engine before reconfiguration...")
            speechAudioEngine.stop()
        }

        // Remove any existing tap (must be done when engine is stopped)
        if isTapInstalled {
            let inputNodeTemp = speechAudioEngine.inputNode
            inputNodeTemp.removeTap(onBus: 0)
            isTapInstalled = false
            print("[DEBUG] Removed existing tap")
        } else {
            print("[DEBUG] No tap to remove (first time setup)")
        }

        // Get input node reference
        let inputNode = speechAudioEngine.inputNode
        print("[DEBUG] Input node: \(inputNode)")
        print("[DEBUG] Input node number of inputs: \(inputNode.numberOfInputs)")

        // Check current input device
        #if os(macOS)
        let inputDevice = inputNode.auAudioUnit.deviceID
        print("[DEBUG] Current input device ID: \(inputDevice)")

        // List all available audio input devices
        let devices = AVCaptureDevice.DiscoverySession(
            deviceTypes: [.microphone, .external],
            mediaType: .audio,
            position: .unspecified
        ).devices

        print("[DEBUG] Available audio input devices:")
        for device in devices {
            print("[DEBUG]   - \(device.localizedName) (ID: \(device.uniqueID))")
        }

        // Also check system audio devices
        if let defaultInputDevice = AVCaptureDevice.default(for: .audio) {
            print("[DEBUG] Default audio capture device: \(defaultInputDevice.localizedName)")
        } else {
            print("[DEBUG] WARNING: No default audio capture device found!")
        }
        #endif

        // Use the default output format from the input node
        // This is the format that the microphone will provide
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        print("[DEBUG] ============ AUDIO FORMAT INFO ============")
        print("[DEBUG] Recording format: \(recordingFormat)")
        print("[DEBUG]   Sample rate: \(recordingFormat.sampleRate) Hz")
        print("[DEBUG]   Channels: \(recordingFormat.channelCount)")
        print("[DEBUG]   Format ID: \(recordingFormat.formatDescription)")
        print("[DEBUG]   Common format: \(recordingFormat.commonFormat.rawValue)")
        print("[DEBUG]   Is standard: \(recordingFormat.isStandard)")
        print("[DEBUG] ==========================================")

        // Validate the recording format
        if recordingFormat.sampleRate == 0 || recordingFormat.channelCount == 0 {
            print("[DEBUG] ERROR: Invalid recording format - no audio device connected!")
            updateDebug("ERROR: Invalid audio format!")
            statusLabel?.text = "ERROR: No audio input device"
            statusLabel?.fontColor = .red
            return
        }

        updateDebug("Format: \(Int(recordingFormat.sampleRate))Hz, \(recordingFormat.channelCount)ch")
        
        var bufferCount = 0
        var amplitudeSum: Float = 0
        var firstBufferReceived = false

        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { [weak self] buffer, _ in
            guard let self = self, let recognitionRequest = self.recognitionRequest else { return }

            // Log first buffer to confirm tap is working
            if !firstBufferReceived {
                firstBufferReceived = true
                print("[DEBUG] ✓ FIRST AUDIO BUFFER RECEIVED! Microphone is working!")
                print("[DEBUG] ✓ Buffer frame length: \(buffer.frameLength)")
                print("[DEBUG] ✓ Buffer format: \(buffer.format)")
            }

            // Check if buffer contains actual audio data
            var currentBufferAmplitude: Float = 0
            if let channelData = buffer.floatChannelData?[0] {
                let frameLength = Int(buffer.frameLength)
                var sum: Float = 0
                for i in 0..<frameLength {
                    sum += abs(channelData[i])
                }
                currentBufferAmplitude = sum / Float(frameLength)
                amplitudeSum += currentBufferAmplitude
            }

            recognitionRequest.append(buffer)
            bufferCount += 1

            // Reset amplitude sum periodically
            if bufferCount % 10 == 0 {
                amplitudeSum = 0 // Reset for next batch
            }

            if bufferCount % 50 == 0 {
                print("[DEBUG] Received \(bufferCount) audio buffers - current amplitude: \(String(format: "%.6f", currentBufferAmplitude))")

                // If amplitude is very low, might be silence
                if currentBufferAmplitude < 0.0001 {
                    print("[DEBUG] WARNING: Very low audio amplitude - microphone might not be picking up sound")
                }
            }
        }

        isTapInstalled = true
        print("[DEBUG] Tap installed on input node")
        updateDebug("Preparing audio engine...")

        // Prepare the audio engine
        speechAudioEngine.prepare()

        print("[DEBUG] Audio engine prepared")
        updateDebug("Starting audio engine...")
        
        do {
            try speechAudioEngine.start()
            print("[DEBUG] ✓ Audio engine started successfully")
            print("[DEBUG] ✓ Audio engine isRunning: \(speechAudioEngine.isRunning)")
            print("[DEBUG] ✓ Input node: \(inputNode)")

            // Check if we're actually getting audio input
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
                print("[DEBUG] Checking if microphone is active after 1 second...")
                if self?.speechAudioEngine.isRunning == true {
                    print("[DEBUG] ✓ Engine still running - microphone should be active")
                    print("[DEBUG] ✓ Check for orange indicator in macOS menu bar")
                } else {
                    print("[DEBUG] ✗ Engine stopped unexpectedly")
                }
            }

            updateDebug("Audio engine running: \(speechAudioEngine.isRunning)")
            statusLabel?.text = "Listening... (check menu bar for orange indicator)"
            statusLabel?.fontColor = .green
        } catch {
            print("[DEBUG] ERROR: Audio engine failed to start: \(error.localizedDescription)")
            print("[DEBUG] Error details: \(error)")
            updateDebug("ERROR: \(error.localizedDescription)")
            statusLabel?.text = "ERROR: Audio engine failed"
            statusLabel?.fontColor = .red
            return
        }
        
        print("[DEBUG] Starting recognition task...")
        updateDebug("Starting recognition task...")
        
        // Add task state tracking
        var taskStateCount = 0
        
        recognitionTask = speechRecognizer.recognitionTask(with: recognitionRequest) { [weak self] result, error in
            taskStateCount += 1
            print("[DEBUG] Recognition callback invoked (#\(taskStateCount)) - result: \(result != nil ? "YES" : "nil"), error: \(error != nil ? error!.localizedDescription : "nil")")
            
            DispatchQueue.main.async {
                guard let self = self else { return }
                
                if let result = result {
                    let spokenText = result.bestTranscription.formattedString
                    let confidence = result.bestTranscription.segments.first?.confidence ?? 0
                    print("[DEBUG] Recognition result: '\(spokenText)' (isFinal: \(result.isFinal), confidence: \(confidence))")
                    self.resultLabel?.text = spokenText
                    self.updateDebug("Heard: \(spokenText)")
                    
                    if result.isFinal {
                        print("[DEBUG] Final result received")
                        self.updateDebug("Final result received")
                        self.statusLabel?.text = "Final result ✓"
                        self.statusLabel?.fontColor = .green
                    } else {
                        self.statusLabel?.text = "Listening..."
                        self.statusLabel?.fontColor = .green
                    }
                } else {
                    print("[DEBUG] No recognition result in callback")
                }
                
                if let error = error {
                    let nsError = error as NSError
                    print("[DEBUG] Recognition error: \(error.localizedDescription)")
                    print("[DEBUG] Error domain: \(nsError.domain), code: \(nsError.code)")
                    print("[DEBUG] Error userInfo: \(nsError.userInfo)")
                    self.updateDebug("Error: \(error.localizedDescription)")
                    // Don't change status on error if we have a result
                    if result == nil {
                        self.statusLabel?.text = "ERROR: \(error.localizedDescription)"
                        self.statusLabel?.fontColor = .red
                    }
                } else if result == nil {
                    // No result and no error - this might indicate the task is waiting
                    if taskStateCount == 1 {
                        print("[DEBUG] First callback - task initialized, waiting for audio...")
                        self.updateDebug("Waiting for speech...")
                    }
                }
            }
        }
        
        print("[DEBUG] Recognition task created")
        if let task = recognitionTask {
            print("[DEBUG] Recognition task state: \(task.state.rawValue)")
        }
        updateDebug("Recognition task active - say something!")
    }
    
    private func stopSpeechRecognition() {
        print("[DEBUG] stopSpeechRecognition() called")
        updateDebug("Stopping speech recognition...")
        stopListening()
        statusLabel?.text = "Stopped"
        statusLabel?.fontColor = .gray
    }
    
    private func stopListening() {
        print("[DEBUG] stopListening() called")

        // Cancel recognition task first
        recognitionTask?.cancel()
        recognitionTask = nil
        print("[DEBUG] Recognition task cancelled")

        // End audio on recognition request
        recognitionRequest?.endAudio()
        recognitionRequest = nil
        print("[DEBUG] Recognition request ended")

        // Stop the audio engine before removing tap
        if speechAudioEngine.isRunning {
            speechAudioEngine.stop()
            print("[DEBUG] Audio engine stopped")
        }

        // Remove tap only if it was installed and engine is stopped
        if isTapInstalled {
            let inputNode = speechAudioEngine.inputNode
            inputNode.removeTap(onBus: 0)
            isTapInstalled = false
            print("[DEBUG] Tap removed")
        } else {
            print("[DEBUG] No tap to remove in stopListening")
        }
    }
    
    deinit {
        stopListening()
    }
}

