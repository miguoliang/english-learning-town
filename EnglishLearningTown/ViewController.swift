//
//  ViewController.swift
//  EnglishLearningTown
//
//  Created by Frank Mi on 2025/11/8.
//

import Cocoa
import SpriteKit
import GameplayKit

class ViewController: NSViewController {

    @IBOutlet var skView: SKView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Start with welcome scene to request permissions
        if let view = self.skView {
            let scene = WelcomeScene(size: view.bounds.size)
            scene.scaleMode = .aspectFill
            
            view.presentScene(scene)
            view.ignoresSiblingOrder = true
            view.showsFPS = true
            view.showsNodeCount = true
        }
    }
}

