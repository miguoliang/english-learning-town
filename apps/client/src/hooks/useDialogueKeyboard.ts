import { useEffect } from 'react';

interface UseDialogueKeyboardProps {
  onClose: () => void;
}

export const useDialogueKeyboard = ({
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