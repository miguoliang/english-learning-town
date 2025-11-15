//
//  WelcomeScene.swift
//  EnglishLearningTown
//
//  Created by Frank Mi on 2025/11/8.
//

import SpriteKit
import Speech
import AVFoundation

class WelcomeScene: SKScene {
    
    private var titleLabel: SKLabelNode!
    private var statusLabel: SKLabelNode!
    private var instructionLabel: SKLabelNode!
    private var startButton: SKNode?
    
    private var speechPermissionGranted = false
    private var microphonePermissionGranted = false
    
    override func didMove(to view: SKView) {
        backgroundColor = GameConstants.Colors.welcomeBackground
        
        setupUI()
        
        // Automatically start requesting permissions
        requestPermissions()
    }
    
    private func setupUI() {
        // Title
        titleLabel = SKLabelNode(fontNamed: GameConstants.Typography.fontNameBold)
        titleLabel.text = "Welcome to English Learning Town"
        titleLabel.fontSize = GameConstants.Typography.FontSize.welcomeTitle
        titleLabel.fontColor = GameConstants.Colors.white
        titleLabel.position = CGPoint(x: size.width / 2, y: size.height * 0.75)
        addChild(titleLabel)
        
        // Status label
        statusLabel = SKLabelNode(fontNamed: GameConstants.Typography.fontName)
        statusLabel.text = "Requesting permissions..."
        statusLabel.fontSize = GameConstants.Typography.FontSize.welcomeStatus
        statusLabel.fontColor = GameConstants.Colors.yellow
        statusLabel.position = CGPoint(x: size.width / 2, y: size.height * 0.5)
        addChild(statusLabel)
        
        // Instruction label (initially hidden)
        instructionLabel = SKLabelNode(fontNamed: GameConstants.Typography.fontName)
        instructionLabel.text = ""
        instructionLabel.fontSize = GameConstants.Typography.FontSize.welcomeInstruction
        instructionLabel.fontColor = GameConstants.Colors.lightGray
        instructionLabel.position = CGPoint(x: size.width / 2, y: size.height * 0.3)
        instructionLabel.preferredMaxLayoutWidth = size.width * GameConstants.Layout.InstructionLabel.maxWidthRatio
        instructionLabel.numberOfLines = 0
        instructionLabel.horizontalAlignmentMode = .center
        addChild(instructionLabel)
    }
    
    private func requestPermissions() {
        // First, request speech recognition permission
        statusLabel.text = "Requesting Speech Recognition permission..."
        statusLabel.fontColor = .yellow
        
        SFSpeechRecognizer.requestAuthorization { [weak self] authStatus in
            DispatchQueue.main.async {
                guard let self = self else { return }
                
                switch authStatus {
                case .authorized:
                    print("[WelcomeScene] Speech recognition authorized")
                    self.speechPermissionGranted = true
                    self.statusLabel.text = "Speech Recognition granted ✓"
                    self.statusLabel.fontColor = GameConstants.Colors.green
                    
                    // Now request microphone permission
                    self.requestMicrophonePermission()
                    
                case .denied:
                    print("[WelcomeScene] Speech recognition denied")
                    self.statusLabel.text = "Speech Recognition DENIED"
                    self.statusLabel.fontColor = GameConstants.Colors.red
                    self.showPermissionDeniedInstructions(for: "Speech Recognition")
                    
                case .restricted:
                    print("[WelcomeScene] Speech recognition restricted")
                    self.statusLabel.text = "Speech Recognition RESTRICTED"
                    self.statusLabel.fontColor = GameConstants.Colors.red
                    self.showPermissionDeniedInstructions(for: "Speech Recognition")
                    
                case .notDetermined:
                    print("[WelcomeScene] Speech recognition not determined")
                    self.statusLabel.text = "Speech Recognition permission required"
                    self.statusLabel.fontColor = GameConstants.Colors.orange
                    
                @unknown default:
                    print("[WelcomeScene] Unknown speech recognition status")
                    self.statusLabel.text = "Unknown permission status"
                    self.statusLabel.fontColor = GameConstants.Colors.red
                }
            }
        }
    }
    
    private func requestMicrophonePermission() {
        statusLabel.text = "Requesting Microphone permission..."
        statusLabel.fontColor = .yellow
        
        // Check current status
        let authStatus = AVCaptureDevice.authorizationStatus(for: .audio)
        
        if authStatus == .authorized {
            print("[WelcomeScene] Microphone already authorized")
            microphonePermissionGranted = true
            checkAllPermissionsGranted()
            return
        }
        
        // Request microphone permission
        AVCaptureDevice.requestAccess(for: .audio) { [weak self] granted in
            DispatchQueue.main.async {
                guard let self = self else { return }
                
                if granted {
                    print("[WelcomeScene] Microphone permission granted")
                    self.microphonePermissionGranted = true
                    self.statusLabel.text = "Microphone granted ✓"
                    self.statusLabel.fontColor = GameConstants.Colors.green
                    self.checkAllPermissionsGranted()
                } else {
                    print("[WelcomeScene] Microphone permission denied")
                    self.statusLabel.text = "Microphone Permission DENIED"
                    self.statusLabel.fontColor = GameConstants.Colors.red
                    self.showPermissionDeniedInstructions(for: "Microphone")
                }
            }
        }
    }
    
    private func checkAllPermissionsGranted() {
        if speechPermissionGranted && microphonePermissionGranted {
            statusLabel.text = "All permissions granted!"
            statusLabel.fontColor = GameConstants.Colors.green
            
            // Show start button instead of auto-transitioning
            showStartButton()
        }
    }
    
    private func showStartButton() {
        // Remove existing button if any
        startButton?.removeFromParent()
        
        // Create start button with responsive sizing
        let button = SKNode()
        button.name = "startButton"
        
        // Calculate button size based on screen dimensions
        let buttonWidth = min(GameConstants.Layout.Button.StartGame.maxWidth, max(GameConstants.Layout.Button.StartGame.minWidth, size.width * GameConstants.Layout.Button.StartGame.widthRatio))
        let buttonHeight = min(GameConstants.Layout.Button.StartGame.maxHeight, max(GameConstants.Layout.Button.StartGame.minHeight, size.height * GameConstants.Layout.Button.StartGame.heightRatio))
        
        let background = SKShapeNode(rectOf: CGSize(width: buttonWidth, height: buttonHeight), cornerRadius: GameConstants.Layout.Button.StartGame.cornerRadius)
        background.fillColor = GameConstants.Colors.Button.startGame
        background.strokeColor = GameConstants.Colors.white
        background.lineWidth = GameConstants.Layout.Button.StartGame.strokeWidth
        button.addChild(background)
        
        let label = SKLabelNode(fontNamed: GameConstants.Typography.fontNameBold)
        label.text = GameConstants.Strings.startGame
        // Scale font size based on button height
        label.fontSize = buttonHeight * GameConstants.Typography.FontMultiplier.welcomeButton
        label.fontColor = GameConstants.Colors.white
        label.verticalAlignmentMode = .center
        button.addChild(label)
        
        button.position = CGPoint(x: size.width / 2, y: size.height * 0.2)
        addChild(button)
        
        startButton = button
    }
    
    private func transitionToLevelSelection() {
        let levelSelectionScene = SceneFactory.createLevelSelectionScene(size: size)
        let transition = SceneFactory.createTransition()
        view?.presentScene(levelSelectionScene, transition: transition)
    }
    
    private func showPermissionDeniedInstructions(for permission: String) {
        var instructions = ""
        
        if permission == "Speech Recognition" {
            instructions = "Please enable Speech Recognition:\nSystem Settings → Privacy & Security → Speech Recognition\nEnable: EnglishLearningTown"
        } else if permission == "Microphone" {
            instructions = "Please enable Microphone access:\nSystem Settings → Privacy & Security → Microphone\nEnable: EnglishLearningTown"
        }
        
        instructionLabel.text = instructions
        instructionLabel.fontColor = GameConstants.Colors.yellow
        
        // Optionally, add a button to retry or open settings
        // For now, the user needs to manually enable permissions in System Settings
    }
    
    override func mouseDown(with event: NSEvent) {
        let location = event.location(in: self)
        let nodes = self.nodes(at: location)
        
        for node in nodes {
            if node.name == "startButton" {
                transitionToLevelSelection()
                return
            }
        }
    }
}

