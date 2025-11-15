//
//  ViewController.swift
//  EnglishLearningTown
//
//  Created by Frank Mi on 2025/11/8.
//

import Cocoa
import SpriteKit

class ViewController: NSViewController {

    @IBOutlet var skView: SKView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Start with welcome scene to request permissions
        if let view = self.skView {
            let scene = SceneFactory.createWelcomeScene(size: view.bounds.size)
            
            view.presentScene(scene)
            view.ignoresSiblingOrder = true
            view.showsFPS = true
            view.showsNodeCount = true
        }
    }
}

