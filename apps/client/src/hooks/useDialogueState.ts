import { useState, useEffect, useCallback } from "react";
import { useQuestStore } from "../stores/questStore";
import { useGameStore } from "../stores/unifiedGameStore";
import { AudioManager } from "../utils/audioManager";
import type { DialogueEntry, DialogueResponse } from "../types";
import { ObjectiveType } from "../types";
import { logger } from "../utils/logger";

// Mock dialogue data - in a real app, this would come from a data store or API
const npcDialogues: Record<string, DialogueEntry[]> = {
  "teacher-intro": [
    {
      id: "teacher_greeting",
      speakerName: "Ms. Johnson",
      text: "Hello there! Welcome to our English Learning Town. I'm Ms. Johnson, the teacher here. Are you ready to start your English learning journey?",
      vocabularyHighlights: ["welcome", "journey"],
      responses: [
        {
          id: "response_yes",
          text: "Yes, I'm excited to learn!",
          requiredVocabulary: [],
          nextDialogueId: "teacher_lesson1",
        },
        {
          id: "response_help",
          text: "I need help getting started.",
          nextDialogueId: "teacher_help",
        },
      ],
    },
    {
      id: "teacher_lesson1",
      speakerName: "Ms. Johnson",
      text: "Wonderful! Let's start with basic greetings. Can you say 'Hello' and 'Good morning' to me?",
      vocabularyHighlights: ["Hello", "Good morning"],
      responses: [
        {
          id: "greeting_correct",
          text: "Hello! Good morning, Ms. Johnson!",
          requiredVocabulary: ["Hello", "Good morning"],
          nextDialogueId: "teacher_praise",
        },
        {
          id: "greeting_partial",
          text: "Hello!",
          nextDialogueId: "teacher_encourage",
        },
      ],
    },
    {
      id: "teacher_praise",
      speakerName: "Ms. Johnson",
      text: "Excellent! You've mastered the basic greetings. Now, let's move on to the next lesson. Visit the shop to practice shopping vocabulary!",
      vocabularyHighlights: ["Excellent", "vocabulary"],
      responses: [],
    },
    {
      id: "teacher_encourage",
      speakerName: "Ms. Johnson",
      text: "Good start! Remember to also say 'Good morning' when greeting someone in the morning. Let's practice again!",
      responses: [
        {
          id: "retry_greeting",
          text: "Hello! Good morning!",
          requiredVocabulary: ["Hello", "Good morning"],
          nextDialogueId: "teacher_praise",
        },
      ],
    },
    {
      id: "teacher_help",
      speakerName: "Ms. Johnson",
      text: "Of course! Learning English is like exploring a new world. Start by talking to people, completing quests, and practicing new words. Don't worry about making mistakes - they help you learn!",
      responses: [
        {
          id: "understand",
          text: "I understand. Let's begin!",
          nextDialogueId: "teacher_lesson1",
        },
      ],
    },
  ],
  "shopkeeper-intro": [
    {
      id: "shopkeeper_greeting",
      speakerName: "Mr. Smith",
      text: "Welcome to my shop! I have school supplies and books. What would you like to buy today?",
      vocabularyHighlights: ["shop", "school supplies", "books"],
      responses: [
        {
          id: "buy_pencil",
          text: "I'd like to buy a pencil, please.",
          requiredVocabulary: ["please"],
          nextDialogueId: "shopkeeper_pencil",
        },
        {
          id: "buy_book",
          text: "How much is the book?",
          requiredVocabulary: ["how much"],
          nextDialogueId: "shopkeeper_book",
        },
        {
          id: "just_looking",
          text: "I'm just looking around.",
          nextDialogueId: "shopkeeper_browse",
        },
      ],
    },
    {
      id: "shopkeeper_pencil",
      speakerName: "Mr. Smith",
      text: "A pencil costs $2. Here you go! Thank you for shopping with us!",
      vocabularyHighlights: ["costs", "Thank you"],
      responses: [],
    },
    {
      id: "shopkeeper_book",
      speakerName: "Mr. Smith",
      text: "The English learning book is $15. It's very helpful for beginners!",
      vocabularyHighlights: ["helpful", "beginners"],
      responses: [
        {
          id: "buy_book_yes",
          text: "I'll take it, please.",
          nextDialogueId: "shopkeeper_book_purchase",
        },
        {
          id: "buy_book_no",
          text: "Maybe later, thank you.",
          nextDialogueId: "shopkeeper_goodbye",
        },
      ],
    },
    {
      id: "shopkeeper_book_purchase",
      speakerName: "Mr. Smith",
      text: "Excellent choice! This book will help you learn faster. Good luck with your studies!",
      responses: [],
    },
    {
      id: "shopkeeper_browse",
      speakerName: "Mr. Smith",
      text: "Feel free to look around! Let me know if you need any help.",
      responses: [],
    },
    {
      id: "shopkeeper_goodbye",
      speakerName: "Mr. Smith",
      text: "No problem! Come back anytime. Have a great day!",
      responses: [],
    },
  ],
  "librarian-intro": [
    {
      id: "librarian_greeting",
      speakerName: "Dr. Brown",
      text: "Shh... Welcome to the library! Here you can find books and practice reading. Are you looking for anything specific?",
      vocabularyHighlights: ["library", "reading", "specific"],
      responses: [
        {
          id: "practice_reading",
          text: "I want to practice reading.",
          nextDialogueId: "librarian_reading",
        },
        {
          id: "find_book",
          text: "I'm looking for an English book.",
          nextDialogueId: "librarian_book",
        },
      ],
    },
    {
      id: "librarian_reading",
      speakerName: "Dr. Brown",
      text: "Perfect! Reading is one of the best ways to improve your English. Start with simple stories and gradually work your way up to more complex texts.",
      vocabularyHighlights: ["improve", "gradually", "complex"],
      responses: [],
    },
    {
      id: "librarian_book",
      speakerName: "Dr. Brown",
      text: "We have many English books for different levels. Check the beginner section over there. Happy reading!",
      vocabularyHighlights: ["levels", "beginner", "section"],
      responses: [],
    },
  ],
  "school-teacher-lesson": [
    {
      id: "lesson_greeting",
      speakerName: "Ms. Johnson",
      text: "Welcome to our classroom! Today we'll learn about grammar and sentence structure. Are you ready to begin the lesson?",
      vocabularyHighlights: ["classroom", "grammar", "sentence structure"],
      responses: [
        {
          id: "ready_to_learn",
          text: "Yes, I'm ready to learn!",
          nextDialogueId: "lesson_start",
        },
        {
          id: "need_help",
          text: "Can you explain it slowly please?",
          nextDialogueId: "lesson_help",
        },
      ],
    },
    {
      id: "lesson_start",
      speakerName: "Ms. Johnson",
      text: "Great! Let's start with simple sentences. A sentence needs a subject and a verb. For example: 'I study English.'",
      vocabularyHighlights: ["subject", "verb", "sentence"],
      responses: [],
    },
    {
      id: "lesson_help",
      speakerName: "Ms. Johnson",
      text: "Of course! We'll take it step by step. Grammar is the foundation of good English. Don't worry, we have plenty of time.",
      vocabularyHighlights: ["step by step", "foundation"],
      responses: [],
    },
  ],
  "student-emily": [
    {
      id: "emily_greeting",
      speakerName: "Emily",
      text: "Hi! I'm Emily. I love learning English! Do you want to study together? We can help each other!",
      vocabularyHighlights: ["study together", "help each other"],
      responses: [
        {
          id: "study_yes",
          text: "Yes, let's study together!",
          nextDialogueId: "emily_excited",
        },
        {
          id: "study_maybe",
          text: "Maybe later, thanks!",
          nextDialogueId: "emily_understanding",
        },
      ],
    },
    {
      id: "emily_excited",
      speakerName: "Emily",
      text: "Wonderful! We can practice conversations and share vocabulary. Learning is more fun with friends!",
      vocabularyHighlights: ["conversations", "vocabulary", "friends"],
      responses: [],
    },
    {
      id: "emily_understanding",
      speakerName: "Emily",
      text: "That's okay! I'll be here when you're ready. Good luck with your studies!",
      responses: [],
    },
  ],
  "student-alex": [
    {
      id: "alex_greeting",
      speakerName: "Alex",
      text: "Hey there! I'm Alex. English is challenging, but I'm getting better every day. What's your favorite part about learning English?",
      vocabularyHighlights: ["challenging", "getting better", "favorite"],
      responses: [
        {
          id: "like_speaking",
          text: "I like speaking practice.",
          nextDialogueId: "alex_speaking",
        },
        {
          id: "like_reading",
          text: "I enjoy reading books.",
          nextDialogueId: "alex_reading",
        },
      ],
    },
    {
      id: "alex_speaking",
      speakerName: "Alex",
      text: "Speaking is great! The more you practice, the more confident you become. Keep talking!",
      vocabularyHighlights: ["confident", "practice"],
      responses: [],
    },
    {
      id: "alex_reading",
      speakerName: "Alex",
      text: "Reading is awesome! It helps you learn new words and understand different writing styles.",
      vocabularyHighlights: ["writing styles"],
      responses: [],
    },
  ],
  "student-sarah": [
    {
      id: "sarah_greeting",
      speakerName: "Sarah",
      text: "Hello! I'm Sarah. I've been studying English for two years now. The key is daily practice and never giving up!",
      vocabularyHighlights: ["daily practice", "never giving up"],
      responses: [
        {
          id: "ask_tips",
          text: "Can you give me some tips?",
          nextDialogueId: "sarah_tips",
        },
        {
          id: "share_experience",
          text: "How did you improve so much?",
          nextDialogueId: "sarah_experience",
        },
      ],
    },
    {
      id: "sarah_tips",
      speakerName: "Sarah",
      text: "Sure! Read for 30 minutes daily, practice speaking with classmates, and don't be afraid to make mistakes!",
      vocabularyHighlights: ["mistakes", "classmates"],
      responses: [],
    },
    {
      id: "sarah_experience",
      speakerName: "Sarah",
      text: "I watched English movies with subtitles and kept a vocabulary journal. Consistency is everything!",
      vocabularyHighlights: ["subtitles", "vocabulary journal", "consistency"],
      responses: [],
    },
  ],
};

interface UseDialogueStateProps {
  npcId: string;
  onClose: () => void;
}

export const useDialogueState = ({ npcId, onClose }: UseDialogueStateProps) => {
  const [currentDialogue, setCurrentDialogue] = useState<DialogueEntry | null>(
    null,
  );
  const [hasResponded, setHasResponded] = useState(false);
  const [learnedVocabulary, setLearnedVocabulary] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const { updateQuestObjective } = useQuestStore();
  const { addVocabulary } = useGameStore();

  // Initialize dialogue
  useEffect(() => {
    const dialogues = npcDialogues[npcId];
    if (dialogues && dialogues.length > 0) {
      setCurrentDialogue(dialogues[0]);
    }
  }, [npcId]);

  const handleResponseClick = useCallback(
    (response: DialogueResponse) => {
      if (hasResponded) return;

      setHasResponded(true);

      // Learn vocabulary from response
      if (
        response.requiredVocabulary &&
        response.requiredVocabulary.length > 0
      ) {
        const newWords = response.requiredVocabulary.filter(
          (word) => !learnedVocabulary.includes(word),
        );

        if (newWords.length > 0) {
          setLearnedVocabulary((prev) => [...prev, ...newWords]);
          addVocabulary(newWords);
        }
      }

      // Update quest objectives
      updateQuestObjective("welcome", ObjectiveType.TALK_TO_NPC, npcId);

      // Handle next dialogue
      if (response.nextDialogueId) {
        const dialogues = npcDialogues[npcId];
        const nextDialogue = dialogues.find(
          (d) => d.id === response.nextDialogueId,
        );
        if (nextDialogue) {
          setTimeout(() => {
            setCurrentDialogue(nextDialogue);
            setHasResponded(false);
          }, 1000);
        }
      } else {
        // End dialogue
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    },
    [
      hasResponded,
      learnedVocabulary,
      updateQuestObjective,
      addVocabulary,
      npcId,
      onClose,
    ],
  );

  const handleSpeak = useCallback(
    async (text: string) => {
      if (isSpeaking) return;

      setIsSpeaking(true);
      try {
        await AudioManager.speakText(text, {
          rate: 0.8,
          pitch: 1.0,
          volume: 0.9,
          voice: "en-US",
        });
      } catch (error) {
        logger.error("Speech synthesis failed:", error);
      } finally {
        setIsSpeaking(false);
      }
    },
    [isSpeaking],
  );

  const handleStopSpeech = useCallback(() => {
    AudioManager.stopSpeech();
    setIsSpeaking(false);
  }, []);

  return {
    currentDialogue,
    hasResponded,
    learnedVocabulary,
    isSpeaking,
    handleResponseClick,
    handleSpeak,
    handleStopSpeech,
  };
};
