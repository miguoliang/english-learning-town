# Vocabulary Image Manager Setup Guide

## Overview
The Vocabulary Image Manager is a macOS GUI application for managing vocabulary word images. It allows you to paste or upload images for each word, saves them to the repository, and updates the JSON data sources.

## Adding the Target to Xcode

Since the VocabularyImageManager needs to be added as a new target in your Xcode project, follow these steps:

1. **Open your Xcode project** (`EnglishLearningTown.xcodeproj`)

2. **Add a new target:**
   - Go to File → New → Target...
   - Select "macOS" → "App"
   - Click "Next"
   - Product Name: `VocabularyImageManager`
   - Language: Swift
   - Interface: SwiftUI
   - Click "Finish"

3. **Add existing files to the target:**
   - Select all files in the `VocabularyImageManager/` folder
   - Right-click → "Add Files to EnglishLearningTown..."
   - Make sure "VocabularyImageManager" target is checked
   - Click "Add"

4. **Configure the target:**
   - Select the project in the navigator
   - Select the "VocabularyImageManager" target
   - Under "General" tab:
     - Set "Deployment Target" to macOS 11.0 or later
   - Under "Build Settings":
     - Ensure Swift Language Version is set appropriately
   - Under "Signing & Capabilities":
     - Configure code signing as needed

5. **Build and run:**
   - Select the "VocabularyImageManager" scheme from the scheme selector
   - Press Cmd+R to build and run

## Usage

1. **Launch the app** and select a CEFR level (A1, A2, B1, or B2)

2. **Select a word** from the list on the left

3. **Add an image** using one of these methods:
   - Click "Paste Image" to paste from clipboard
   - Click "Choose File" to select an image file
   - Drag and drop an image onto the preview area

4. **The app will:**
   - Save the image to `images/cefr-{level}/{word}.png`
   - Update the JSON file in `data-sources/` with the `imageName` field
   - The `imageName` follows the format: `{LEVEL}-{word}` (e.g., "A1-apple")

5. **Add images to Asset Catalog:**
   - After saving images via the tool, manually add them to `Assets.xcassets` in Xcode
   - Create Image Sets with names matching the `imageName` format (e.g., "A1-apple")
   - The game will automatically load images from Asset Catalog when available

## File Structure

```
EnglishLearningTown/
├── data-sources/          # JSON vocabulary files (updated by tool)
├── images/                # Image repository (source of truth)
│   ├── cefr-a1/
│   ├── cefr-a2/
│   ├── cefr-b1/
│   └── cefr-b2/
├── VocabularyImageManager/ # GUI tool source files
└── EnglishLearningTown/    # Game source files
```

## Notes

- Images are stored in the repository as PNG files
- The JSON `imageName` field stores the Asset Catalog name, not the file path
- The game loads images from Asset Catalog, not directly from the repository
- If auto-detection of project root fails, the app will show an error - ensure you run it from the project directory or configure the path manually

