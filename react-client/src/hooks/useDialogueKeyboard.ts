import { useEffect } from 'react';
import type { DialogueEntry, DialogueResponse } from '../types';

interface UseDialogueKeyboardProps {
  currentDialogue: DialogueEntry | null;
  hasResponded: boolean;
  onClose: () => void;
}

export const useDialogueKeyboard = ({
  currentDialogue,
  hasResponded,
  onClose,
}: UseDialogueKeyboardProps) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // ESC key to close dialogue
      if (event.code === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [onClose]);
};