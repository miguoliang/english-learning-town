import { useEffect } from 'react';
import type { DialogueEntry, DialogueResponse } from '../types';

interface UseDialogueKeyboardProps {
  currentDialogue: DialogueEntry | null;
  hasResponded: boolean;
  selectedResponseIndex: number;
  onClose: () => void;
  onNavigateUp: () => void;
  onNavigateDown: () => void;
  onSelectResponse: (response: DialogueResponse) => void;
}

export const useDialogueKeyboard = ({
  currentDialogue,
  hasResponded,
  selectedResponseIndex,
  onClose,
  onNavigateUp,
  onNavigateDown,
  onSelectResponse,
}: UseDialogueKeyboardProps) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // ESC key to close dialogue
      if (event.code === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      // Arrow key navigation for response selection
      if (currentDialogue?.responses && currentDialogue.responses.length > 0 && !hasResponded) {
        if (event.code === 'ArrowUp') {
          event.preventDefault();
          onNavigateUp();
        } else if (event.code === 'ArrowDown') {
          event.preventDefault();
          onNavigateDown();
        } else if (event.code === 'Enter' || event.code === 'Space') {
          event.preventDefault();
          const selectedResponse = currentDialogue.responses[selectedResponseIndex];
          if (selectedResponse) {
            onSelectResponse(selectedResponse);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [
    currentDialogue,
    hasResponded,
    selectedResponseIndex,
    onClose,
    onNavigateUp,
    onNavigateDown,
    onSelectResponse,
  ]);
};