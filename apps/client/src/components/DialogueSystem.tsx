import React, { useState } from 'react';

interface DialogueSystemProps {
  dialogueId: string;
}

const DialogueSystem: React.FC<DialogueSystemProps> = ({ dialogueId: _dialogueId }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');

  const handleSpeechRecognition = () => {
    setIsListening(true);
    // TODO: Implement speech recognition using the speech package
    setTimeout(() => {
      setIsListening(false);
      setRecognizedText('Hello there!'); // Mock result
    }, 2000);
  };

  const closeDialogue = () => {
    // TODO: Connect to proper store to end dialogue
    console.log('Close dialogue');
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '200px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      {/* Dialogue Content */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>
          <strong>NPC:</strong> Hello! Can you say "Hello" back to me?
        </div>
        
        {recognizedText && (
          <div style={{ fontSize: '16px', color: '#4CAF50' }}>
            <strong>You said:</strong> {recognizedText}
          </div>
        )}
      </div>

      {/* Speech Recognition Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: '10px'
      }}>
        <button
          onClick={handleSpeechRecognition}
          disabled={isListening}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: isListening ? '#666' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isListening ? 'not-allowed' : 'pointer'
          }}
        >
          {isListening ? '🎤 Listening...' : '🎤 Click to Speak'}
        </button>

        <div style={{ fontSize: '14px', color: '#ccc' }}>
          Press ESC to close dialogue
        </div>

        <button
          onClick={closeDialogue}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DialogueSystem;