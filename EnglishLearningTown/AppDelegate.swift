//
//  AppDelegate.swift
//  EnglishLearningTown
//
//  Created by Frank Mi on 2025/11/8.
//


import Cocoa

@main
class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate {
    
    func applicationDidFinishLaunching(_ aNotification: Notification) {
        // Disable window restoration for this game app
        NSWindow.allowsAutomaticWindowTabbing = false
        if let window = NSApplication.shared.windows.first {
            window.restorationClass = nil
            window.isRestorable = false
            window.delegate = self
            
            // Enter full screen mode
            window.toggleFullScreen(nil)
        }
    }
    
    func applicationWillTerminate(_ aNotification: Notification) {
        // Insert code here to tear down your application
    }
    
    func windowShouldClose(_ sender: NSWindow) -> Bool {
        // Terminate the app when the window is closed
        NSApplication.shared.terminate(nil)
        return true
    }
    
    func windowWillEnterFullScreen(_ notification: Notification) {
        // Window is entering full screen
    }
    
    func windowWillExitFullScreen(_ notification: Notification) {
        // Prevent exiting full screen - re-enter full screen immediately
        if let window = notification.object as? NSWindow {
            DispatchQueue.main.async {
                window.toggleFullScreen(nil)
            }
        }
    }
}
