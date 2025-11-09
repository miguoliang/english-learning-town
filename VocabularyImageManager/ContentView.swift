//
//  ContentView.swift
//  VocabularyImageManager
//
//  Created by Frank Mi on 2025/11/9.
//

import SwiftUI
import AppKit
internal import UniformTypeIdentifiers

private let clipRectangleSize: CGFloat = 256

struct ContentView: View {
    @StateObject private var viewModel = WordListViewModel()
    @State private var imageViewSize: CGSize = .zero
    
    /// Calculate the natural display size of the image maintaining aspect ratio.
    ///
    /// - Parameters:
    ///   - imageSize: The original image size
    ///   - containerSize: The container size
    /// - Returns: The display size that fits the container while maintaining aspect ratio
    private func calculateDisplaySize(imageSize: CGSize, containerSize: CGSize) -> CGSize {
        let imageAspectRatio = imageSize.width / imageSize.height
        let containerAspectRatio = containerSize.width / containerSize.height
        
        if imageAspectRatio > containerAspectRatio {
            // Image is wider - width is limiting
            return CGSize(width: containerSize.width, height: containerSize.width / imageAspectRatio)
        } else {
            // Image is taller - height is limiting
            return CGSize(width: containerSize.height * imageAspectRatio, height: containerSize.height)
        }
    }
    
    var body: some View {
        GeometryReader { geometry in
            HSplitView {
            // Left panel: File selection and word list
            VStack(alignment: .leading, spacing: 0) {
                // File selection button
                HStack {
                    Button(action: openCSVFile) {
                        Label("Open CSV File", systemImage: "folder")
                    }
                    .buttonStyle(.borderedProminent)
                    .padding()
                    
                    Spacer()
                    
                    if let url = viewModel.csvFileURL {
                        Text(url.lastPathComponent)
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .lineLimit(1)
                            .padding(.trailing)
                    }
                }
                .frame(maxWidth: .infinity)
                .background(Color(NSColor.controlBackgroundColor))
                
                // Search bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.secondary)
                    TextField("Search words...", text: $viewModel.searchText)
                }
                .padding(.horizontal)
                .padding(.vertical, 8)
                .background(Color(NSColor.controlBackgroundColor))
                
                // Word list
                if viewModel.words.isEmpty && !viewModel.isLoading {
                    VStack(spacing: 16) {
                        Image(systemName: "doc.text")
                            .font(.system(size: 48))
                            .foregroundColor(.secondary)
                        Text("No words loaded")
                            .foregroundColor(.secondary)
                        Text("Click 'Open CSV File' to begin")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List(viewModel.filteredWords, id: \.englishWord) { word in
                        WordRowView(word: word, hasImage: viewModel.hasImage(word))
                            .contentShape(Rectangle())
                            .onTapGesture {
                                viewModel.selectWord(word)
                            }
                    }
                    .listStyle(.plain)
                }
            }
            .frame(width: geometry.size.width * 0.2)
            .frame(maxHeight: .infinity)
            
            // Right panel: Word details and image
            VStack(alignment: .leading, spacing: 20) {
                if let word = viewModel.selectedWord {
                    // Word information
                    VStack(alignment: .leading, spacing: 12) {
                        Text(word.englishWord)
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        Text(word.chineseTranslation)
                            .font(.title2)
                            .foregroundColor(.secondary)
                        
                        Text(word.exampleSentence)
                            .font(.body)
                            .italic()
                            .foregroundColor(.secondary)
                        
                        HStack {
                            Text("POS: \(word.pos)")
                            Spacer()
                            Text("Level: \(word.level)")
                            Spacer()
                            Text("Theme: \(word.theme)")
                        }
                        .font(.caption)
                        .foregroundColor(.secondary)
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(NSColor.controlBackgroundColor))
                    .cornerRadius(8)
                    
                    // Image preview area - uses remaining height
                    VStack(spacing: 16) {
                        // Zoom controls
                        HStack {
                            Button(action: { viewModel.zoomOut() }) {
                                Image(systemName: "minus")
                            }
                            .buttonStyle(.bordered)
                            .disabled(viewModel.imageScale <= 0.1)
                            
                            Text("Zoom: \(Int(viewModel.imageScale * 100))%")
                                .font(.caption)
                                .frame(minWidth: 80)
                            
                            Button(action: { viewModel.zoomIn() }) {
                                Image(systemName: "plus")
                            }
                            .buttonStyle(.bordered)
                            .disabled(viewModel.imageScale >= 5.0)
                            
                            Spacer()
                            
                            Button(action: pasteImage) {
                                Label("Paste", systemImage: "doc.on.clipboard")
                            }
                            .buttonStyle(.bordered)
                            
                            Button(action: { 
                                viewModel.clipImage(viewSize: imageViewSize)
                            }) {
                                Label("Clip", systemImage: "scissors")
                            }
                            .buttonStyle(.bordered)
                            .disabled(viewModel.currentImage == nil)
                            
                            Button(action: { viewModel.resetImageTransform() }) {
                                Text("Reset")
                            }
                            .buttonStyle(.bordered)
                            .disabled(viewModel.currentImage == nil)
                        }
                        .padding(.horizontal)
                        
                        // Image clipping area
                        GeometryReader { geometry in
                            ZStack {
                                // Background
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color(NSColor.controlBackgroundColor))
                                
                                if let image = viewModel.currentImage {
                                    // Calculate scaled dimensions
                                    let imageSize = image.size
                                    let (scaledWidth, scaledHeight): (CGFloat, CGFloat) = {
                                        if viewModel.isClipped {
                                            // Clipped images should not exceed clip rectangle size
                                            let maxSize = min(clipRectangleSize, min(geometry.size.width, geometry.size.height))
                                            let scale = min(maxSize / clipRectangleSize, 1.0) * viewModel.imageScale
                                            return (clipRectangleSize * scale, clipRectangleSize * scale)
                                        } else {
                                            // Calculate natural display size maintaining aspect ratio
                                            let displaySize = calculateDisplaySize(imageSize: imageSize, containerSize: geometry.size)
                                            return (displaySize.width * viewModel.imageScale, displaySize.height * viewModel.imageScale)
                                        }
                                    }()
                                    
                                    // Image with zoom and pan
                                    Image(nsImage: image)
                                        .resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .frame(width: scaledWidth, height: scaledHeight)
                                        .offset(viewModel.imageOffset)
                                        .gesture(
                                            DragGesture()
                                                .onChanged { value in
                                                    viewModel.updateImageOffset(translation: value.translation)
                                                }
                                                .onEnded { _ in
                                                    viewModel.endDrag()
                                                }
                                        )
                                } else {
                                    VStack(spacing: 20) {
                                        Image(systemName: "photo")
                                            .font(.system(size: 64))
                                            .foregroundColor(.secondary)
                                        
                                        Text("No image")
                                            .foregroundColor(.secondary)
                                    }
                                }
                                
                                // 256x256 clip rectangle overlay - highlight the clip area
                                Rectangle()
                                    .fill(Color.blue.opacity(0.2))
                                    .frame(width: clipRectangleSize, height: clipRectangleSize)
                                    .overlay(
                                        Rectangle()
                                            .stroke(Color.blue, lineWidth: 2)
                                            .frame(width: clipRectangleSize, height: clipRectangleSize)
                                    )
                                    .overlay(
                                        Rectangle()
                                            .stroke(Color.white.opacity(0.5), lineWidth: 1)
                                            .frame(width: clipRectangleSize, height: clipRectangleSize)
                                    )
                            }
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                            .onAppear {
                                imageViewSize = geometry.size
                            }
                            .onChange(of: geometry.size) { newSize in
                                imageViewSize = newSize
                            }
                        }
                        
                        // Image status
                        if viewModel.hasImage(word) {
                            HStack {
                                Label("Image saved", systemImage: "checkmark.circle.fill")
                                    .foregroundColor(.green)
                                Spacer()
                                if let imageName = word.imageName {
                                    Text("Asset: \(imageName)")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                    }
                    .padding()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color(NSColor.windowBackgroundColor))
                    .cornerRadius(8)
                    
                } else {
                    // No word selected
                    VStack(spacing: 16) {
                        Image(systemName: "hand.point.left")
                            .font(.system(size: 64))
                            .foregroundColor(.secondary)
                        Text("Select a word from the list")
                            .font(.title2)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
            }
            .padding()
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .alert("Error", isPresented: .constant(viewModel.errorMessage != nil)) {
            Button("OK") {
                viewModel.errorMessage = nil
            }
        } message: {
            if let error = viewModel.errorMessage {
                Text(error)
            }
        }
        .overlay {
            if viewModel.isLoading {
                ProgressView("Loading...")
                    .padding()
                    .background(Color(NSColor.windowBackgroundColor).opacity(0.9))
                    .cornerRadius(8)
            }
        }
    }
    
    private func openCSVFile() {
        let panel = NSOpenPanel()
        panel.allowedContentTypes = [.commaSeparatedText]
        panel.allowsMultipleSelection = false
        panel.canChooseDirectories = false
        panel.canChooseFiles = true
        panel.title = "Select CSV File"
        
        if panel.runModal() == .OK, let url = panel.url {
            viewModel.loadCSV(from: url)
        }
    }
    
    private func pasteImage() {
        if let image = viewModel.pasteImageFromClipboard() {
            viewModel.currentImage = image
        } else {
            viewModel.errorMessage = "No image found in clipboard. Please copy an image first (Cmd+C or right-click > Copy)."
        }
    }
}

struct WordRowView: View {
    let word: VocabularyWord
    let hasImage: Bool
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(word.englishWord)
                    .font(.headline)
                Text(word.chineseTranslation)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            if hasImage {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.green)
            } else {
                Image(systemName: "photo")
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    ContentView()
}
