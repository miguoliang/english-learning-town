// Dialogue System Component

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useQuestStore } from '../../stores/questStore';
import { useGameStore } from '../../stores/gameStore';
import type { DialogueEntry, DialogueResponse } from '../../types';
import { ObjectiveType } from '../../types';

const DialogueOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 3000;
  backdrop-filter: blur(2px);
`;

const DialogueBox = styled(motion.div)`
  background: linear-gradient(135deg, #2d3436 0%, #636e72 100%);
  border: 3px solid #74b9ff;
  border-radius: 16px 16px 0 0;
  width: 90%;
  max-width: 800px;
  min-height: 200px;
  padding: 24px;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.3);
`;

const DialogueHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(116, 185, 255, 0.3);
`;

const SpeakerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SpeakerAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border: 2px solid #74b9ff;
`;

const SpeakerName = styled.h3`
  color: #74b9ff;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const EscapeHint = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
`;

const EscapeKey = styled.span`
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const DialogueText = styled(motion.div)`
  color: white;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 20px;
  min-height: 60px;
`;

const ResponseOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ResponseButton = styled(motion.button)<{ isCorrect?: boolean; isSelected?: boolean }>`
  background: ${props => {
    if (props.isCorrect) return 'linear-gradient(135deg, #00b894 0%, #00a085 100%)';
    if (props.isSelected) return 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)';
    return 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)';
  }};
  border: ${props => props.isSelected ? '2px solid #ffffff' : 'none'};
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 0.3s ease;
  transform: ${props => props.isSelected ? 'translateX(8px) scale(1.02)' : 'translateX(0)'};
  box-shadow: ${props => props.isSelected 
    ? '0 6px 20px rgba(232, 67, 147, 0.4)' 
    : '0 2px 8px rgba(0, 0, 0, 0.1)'
  };
  
  &:hover {
    transform: ${props => props.isSelected ? 'translateX(8px) scale(1.02)' : 'translateX(4px)'};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ContinueButton = styled(motion.button)`
  background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-end;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(232, 67, 147, 0.4);
  }
`;


const QuestProgress = styled(motion.div)`
  background: rgba(116, 185, 255, 0.1);
  border: 1px solid rgba(116, 185, 255, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
`;

const ProgressText = styled.div`
  color: #74b9ff;
  font-size: 0.9rem;
  font-weight: 500;
`;

// Mock dialogue data - in a real app, this would come from a data store or API
const npcDialogues: Record<string, DialogueEntry[]> = {
  teacher: [
    {
      id: 'teacher_greeting',
      speakerName: 'Ms. Johnson',
      text: "Hello there! Welcome to our English Learning Town. I'm Ms. Johnson, the teacher here. Are you ready to start your English learning journey?",
      vocabularyHighlights: ['welcome', 'journey'],
      responses: [
        {
          id: 'response_yes',
          text: "Yes, I'm excited to learn!",
          requiredVocabulary: [],
          nextDialogueId: 'teacher_lesson1'
        },
        {
          id: 'response_help',
          text: "I need help getting started.",
          nextDialogueId: 'teacher_help'
        }
      ]
    },
    {
      id: 'teacher_lesson1',
      speakerName: 'Ms. Johnson',
      text: "Wonderful! Let's start with basic greetings. Can you say 'Hello' and 'Good morning' to me?",
      vocabularyHighlights: ['Hello', 'Good morning'],
      responses: [
        {
          id: 'greeting_correct',
          text: "Hello! Good morning, Ms. Johnson!",
          requiredVocabulary: ['Hello', 'Good morning'],
          nextDialogueId: 'teacher_praise'
        },
        {
          id: 'greeting_partial',
          text: "Hello!",
          nextDialogueId: 'teacher_encourage'
        }
      ]
    },
    {
      id: 'teacher_praise',
      speakerName: 'Ms. Johnson',
      text: "Excellent! You've mastered the basic greetings. Now, let's move on to the next lesson. Visit the shop to practice shopping vocabulary!",
      vocabularyHighlights: ['Excellent', 'vocabulary'],
      responses: []
    },
    {
      id: 'teacher_encourage',
      speakerName: 'Ms. Johnson',
      text: "Good start! Remember to also say 'Good morning' when greeting someone in the morning. Let's practice again!",
      responses: [
        {
          id: 'retry_greeting',
          text: "Hello! Good morning!",
          requiredVocabulary: ['Hello', 'Good morning'],
          nextDialogueId: 'teacher_praise'
        }
      ]
    },
    {
      id: 'teacher_help',
      speakerName: 'Ms. Johnson',
      text: "Of course! Learning English is like exploring a new world. Start by talking to people, completing quests, and practicing new words. Don't worry about making mistakes - they help you learn!",
      responses: [
        {
          id: 'understand',
          text: "I understand. Let's begin!",
          nextDialogueId: 'teacher_lesson1'
        }
      ]
    }
  ],
  shopkeeper: [
    {
      id: 'shopkeeper_greeting',
      speakerName: 'Mr. Smith',
      text: "Welcome to my shop! I have school supplies and books. What would you like to buy today?",
      vocabularyHighlights: ['shop', 'school supplies', 'books'],
      responses: [
        {
          id: 'buy_pencil',
          text: "I'd like to buy a pencil, please.",
          requiredVocabulary: ['please'],
          nextDialogueId: 'shopkeeper_pencil'
        },
        {
          id: 'buy_book',
          text: "How much is the book?",
          requiredVocabulary: ['how much'],
          nextDialogueId: 'shopkeeper_book'
        },
        {
          id: 'just_looking',
          text: "I'm just looking around.",
          nextDialogueId: 'shopkeeper_browse'
        }
      ]
    },
    {
      id: 'shopkeeper_pencil',
      speakerName: 'Mr. Smith',
      text: "A pencil costs $2. Here you go! Thank you for shopping with us!",
      vocabularyHighlights: ['costs', 'Thank you'],
      responses: []
    },
    {
      id: 'shopkeeper_book',
      speakerName: 'Mr. Smith',
      text: "The English learning book is $15. It's very helpful for beginners!",
      vocabularyHighlights: ['helpful', 'beginners'],
      responses: [
        {
          id: 'buy_book_yes',
          text: "I'll take it, please.",
          nextDialogueId: 'shopkeeper_book_purchase'
        },
        {
          id: 'buy_book_no',
          text: "Maybe later, thank you.",
          nextDialogueId: 'shopkeeper_goodbye'
        }
      ]
    },
    {
      id: 'shopkeeper_book_purchase',
      speakerName: 'Mr. Smith',
      text: "Excellent choice! This book will help you learn faster. Good luck with your studies!",
      responses: []
    },
    {
      id: 'shopkeeper_browse',
      speakerName: 'Mr. Smith',
      text: "Feel free to look around! Let me know if you need any help.",
      responses: []
    },
    {
      id: 'shopkeeper_goodbye',
      speakerName: 'Mr. Smith',
      text: "No problem! Come back anytime. Have a great day!",
      responses: []
    }
  ],
  librarian: [
    {
      id: 'librarian_greeting',
      speakerName: 'Dr. Brown',
      text: "Shh... Welcome to the library! Here you can find books and practice reading. Are you looking for anything specific?",
      vocabularyHighlights: ['library', 'reading', 'specific'],
      responses: [
        {
          id: 'practice_reading',
          text: "I want to practice reading.",
          nextDialogueId: 'librarian_reading'
        },
        {
          id: 'find_book',
          text: "I'm looking for an English book.",
          nextDialogueId: 'librarian_book'
        }
      ]
    },
    {
      id: 'librarian_reading',
      speakerName: 'Dr. Brown',
      text: "Perfect! Reading is one of the best ways to improve your English. Start with simple stories and gradually work your way up to more complex texts.",
      vocabularyHighlights: ['improve', 'gradually', 'complex'],
      responses: []
    },
    {
      id: 'librarian_book',
      speakerName: 'Dr. Brown',
      text: "We have many English books for different levels. Check the beginner section over there. Happy reading!",
      vocabularyHighlights: ['levels', 'beginner', 'section'],
      responses: []
    }
  ]
};

const getNPCAvatar = (npcId: string): string => {
  switch (npcId) {
    case 'teacher': return '👩‍🏫';
    case 'shopkeeper': return '👨‍💼';
    case 'librarian': return '👩‍🎓';
    default: return '👤';
  }
};

interface DialogueSystemProps {
  npcId: string;
  onClose: () => void;
}

export const DialogueSystem: React.FC<DialogueSystemProps> = ({ npcId, onClose }) => {
  const [currentDialogue, setCurrentDialogue] = useState<DialogueEntry | null>(null);
  const [hasResponded, setHasResponded] = useState(false);
  const [learnedVocabulary, setLearnedVocabulary] = useState<string[]>([]);
  const [selectedResponseIndex, setSelectedResponseIndex] = useState(0);
  
  const { updateQuestObjective } = useQuestStore();
  const { addVocabulary } = useGameStore();

  useEffect(() => {
    // Initialize dialogue
    const dialogues = npcDialogues[npcId];
    if (dialogues && dialogues.length > 0) {
      setCurrentDialogue(dialogues[0]);
      setSelectedResponseIndex(0);
    }
  }, [npcId]);

  // Keyboard handlers for ESC and arrow key navigation
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
        const maxIndex = currentDialogue.responses.length - 1;
        
        if (event.code === 'ArrowUp') {
          event.preventDefault();
          setSelectedResponseIndex(prev => prev > 0 ? prev - 1 : maxIndex);
        } else if (event.code === 'ArrowDown') {
          event.preventDefault();
          setSelectedResponseIndex(prev => prev < maxIndex ? prev + 1 : 0);
        } else if (event.code === 'Enter' || event.code === 'Space') {
          event.preventDefault();
          const selectedResponse = currentDialogue.responses[selectedResponseIndex];
          if (selectedResponse) {
            handleResponseClick(selectedResponse);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [onClose, currentDialogue, hasResponded, selectedResponseIndex]);

  const highlightVocabulary = (text: string, vocabulary: string[] = []) => {
    if (!vocabulary.length) return text;

    let highlightedText = text;
    vocabulary.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      highlightedText = highlightedText.replace(
        regex, 
        `<span class="vocabulary-highlight">${word}</span>`
      );
    });

    return highlightedText;
  };

  const handleResponseClick = (response: DialogueResponse) => {
    if (hasResponded) return;

    setHasResponded(true);

    // Learn vocabulary from response
    if (response.requiredVocabulary && response.requiredVocabulary.length > 0) {
      const newWords = response.requiredVocabulary.filter(
        word => !learnedVocabulary.includes(word)
      );
      
      if (newWords.length > 0) {
        setLearnedVocabulary(prev => [...prev, ...newWords]);
        addVocabulary(newWords);
      }
    }

    // Update quest objectives
    updateQuestObjective('welcome', ObjectiveType.TALK_TO_NPC, npcId);

    // Handle next dialogue
    if (response.nextDialogueId) {
      const dialogues = npcDialogues[npcId];
      const nextDialogue = dialogues.find(d => d.id === response.nextDialogueId);
      if (nextDialogue) {
        setTimeout(() => {
          setCurrentDialogue(nextDialogue);
          setHasResponded(false);
          setSelectedResponseIndex(0); // Reset selection for new dialogue
        }, 1000);
      }
    } else {
      // End dialogue
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const handleContinue = () => {
    onClose();
  };

  if (!currentDialogue) {
    return null;
  }

  const hasResponses = currentDialogue.responses && currentDialogue.responses.length > 0;

  return (
    <DialogueOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <DialogueBox
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogueHeader>
          <SpeakerInfo>
            <SpeakerAvatar>
              {getNPCAvatar(npcId)}
            </SpeakerAvatar>
            <SpeakerName>{currentDialogue.speakerName}</SpeakerName>
          </SpeakerInfo>
          <EscapeHint>
            <EscapeKey>↑↓</EscapeKey>
            <EscapeKey>ENTER</EscapeKey>
            <EscapeKey>ESC</EscapeKey>
            controls
          </EscapeHint>
          <CloseButton onClick={onClose}>×</CloseButton>
        </DialogueHeader>

        <DialogueText
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          dangerouslySetInnerHTML={{
            __html: highlightVocabulary(
              currentDialogue.text, 
              currentDialogue.vocabularyHighlights
            ).replace(
              /<span class="vocabulary-highlight">/g,
              '<span style="background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%); color: white; padding: 2px 6px; border-radius: 4px; font-weight: 600;">'
            )
          }}
        />

        {hasResponses && !hasResponded ? (
          <ResponseOptions>
            {currentDialogue.responses!.map((response, index) => (
              <ResponseButton
                key={response.id}
                onClick={() => handleResponseClick(response)}
                isSelected={index === selectedResponseIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {response.text}
              </ResponseButton>
            ))}
          </ResponseOptions>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ContinueButton
              onClick={handleContinue}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Continue
            </ContinueButton>
          </div>
        )}

        {learnedVocabulary.length > 0 && (
          <QuestProgress
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 1 }}
          >
            <ProgressText>
              📚 New vocabulary learned: {learnedVocabulary.join(', ')}
            </ProgressText>
          </QuestProgress>
        )}
      </DialogueBox>
    </DialogueOverlay>
  );
};

export default DialogueSystem;