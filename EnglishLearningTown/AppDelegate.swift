//
//  AppDelegate.swift
//  EnglishLearningTown
//
//  Created by Frank Mi on 2025/11/8.
//


import Cocoa

@main
class AppDelegate: NSObject, NSApplicationDelegate {
    
    func applicationDidFinishLaunching(_ aNotification: Notification) {
        // Disable window restoration for this game app
        NSWindow.allowsAutomaticWindowTabbing = false
        if let window = NSApplication.shared.windows.first {
            window.restorationClass = nil
            window.isRestorable = false
        }
    }
    
    func applicationWillTerminate(_ aNotification: Notification) {
        // Insert code here to tear down your application
    }
}
