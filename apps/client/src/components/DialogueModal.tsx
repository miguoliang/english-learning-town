import React, { useEffect } from 'react';
import { useGameData, useGameActions } from '@english-learning-town/store';

interface DialogueModalProps {
  dialogueId: string;
  onClose: () => void;
}

const DialogueModal: React.FC<DialogueModalProps> = ({
  dialogueId,
  onClose,
}) => {
  const gameData = useGameData();
  const { setCurrentDialogue } = useGameActions();

  // Get dialogue data from store
  const dialogue =
    gameData?.dialogues?.[dialogueId as keyof typeof gameData.dialogues];
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);

  console.log('DialogueModal rendered with:', {
    dialogueId,
    dialogue,
    gameData,
  });

  if (!dialogue) {
    return (
      <div style={modalOverlayStyle}>
        <div style={modalContentStyle}>
          <h3>Error</h3>
          <p>Dialogue not found: {dialogueId}</p>
          <button onClick={onClose} style={buttonStyle}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentStep = (dialogue as any).steps?.[currentStepIndex];
  const characterName =
    gameData?.characters?.[
      (dialogue as any).character as keyof typeof gameData.characters
    ]?.name || 'Character';

  const handleClose = () => {
    setCurrentDialogue(null);
    onClose();
  };

  const handleContinue = () => {
    const totalSteps = (dialogue as any).steps?.length || 1;

    if (currentStepIndex < totalSteps - 1) {
      // Move to next step
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // End of dialogue
      handleClose();
    }
  };

  // Handle keyboard input for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case 'Enter':
        case ' ':
          handleContinue();
          break;
        default:
          return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, handleContinue]);

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={headerStyle}>
          <h3>{characterName}</h3>
          <button onClick={handleClose} style={closeButtonStyle}>
            ×
          </button>
        </div>

        <div style={dialogueTextStyle}>
          <p>{currentStep?.text || 'Hello there!'}</p>
        </div>

        <div style={actionButtonsStyle}>
          <button onClick={handleContinue} style={continueButtonStyle}>
            {currentStepIndex < ((dialogue as any).steps?.length || 1) - 1
              ? 'Continue'
              : 'End Conversation'}
          </button>
        </div>

        <div style={instructionsStyle}>
          <small>Press ESC to close • ENTER to continue</small>
        </div>
      </div>
    </div>
  );
};

// Styles
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: '#2C3E50',
  border: '3px solid #34495E',
  borderRadius: '10px',
  padding: '20px',
  minWidth: '400px',
  maxWidth: '600px',
  color: 'white',
  fontFamily: 'Arial, sans-serif',
  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px',
  borderBottom: '2px solid #34495E',
  paddingBottom: '10px',
};

const closeButtonStyle: React.CSSProperties = {
  background: '#E74C3C',
  border: 'none',
  color: 'white',
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  fontSize: '18px',
  fontWeight: 'bold',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const dialogueTextStyle: React.CSSProperties = {
  marginBottom: '20px',
  fontSize: '16px',
  lineHeight: '1.5',
  padding: '15px',
  backgroundColor: '#34495E',
  borderRadius: '8px',
  border: '1px solid #4A5F7A',
};

const actionButtonsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: '10px',
  marginBottom: '10px',
};

const continueButtonStyle: React.CSSProperties = {
  backgroundColor: '#3498DB',
  border: 'none',
  color: 'white',
  padding: '10px 20px',
  borderRadius: '5px',
  fontSize: '14px',
  cursor: 'pointer',
  fontWeight: 'bold',
  minWidth: '100px',
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#95A5A6',
  border: 'none',
  color: 'white',
  padding: '10px 20px',
  borderRadius: '5px',
  fontSize: '14px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const instructionsStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#BDC3C7',
  marginTop: '10px',
};

export default DialogueModal;
