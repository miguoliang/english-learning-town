/**
 * Vocabulary Review Session Component
 * Interactive spaced repetition learning session
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Button, AnimatedEmoji } from '@elt/ui';
import { 
  ReviewSessionManager,
  SpacedRepetitionEngine,
  ReviewResult,
  type VocabularyCard,
  type SessionQuestion,
  type ReviewSession
} from '@elt/core';

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const SessionContainer = styled.div`
  background: ${({ theme }) => theme.gradients.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing[6]};
  max-width: 700px;
  margin: 0 auto;
  min-height: 500px;
  box-shadow: ${({ theme }) => theme.shadows.large};
  animation: ${slideIn} 0.5s ease-out;
`;

const SessionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  padding-bottom: ${({ theme }) => theme.spacing[4]};
  border-bottom: 2px solid ${({ theme }) => theme.colors.surfaceLight};
`;

const ProgressInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const ProgressText = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const AccuracyBadge = styled.div<{ accuracy: number }>`
  background: ${props => {
    if (props.accuracy >= 80) return props.theme.colors.success;
    if (props.accuracy >= 60) return props.theme.colors.warning;
    return props.theme.colors.error;
  }};
  color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const ProgressBarContainer = styled.div`
  background: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  height: 8px;
  margin: ${({ theme }) => theme.spacing[4]} 0;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ progress: number }>`
  background: ${({ theme }) => theme.gradients.primary};
  height: 100%;
  width: ${props => props.progress}%;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: width 0.3s ease;
`;

const QuestionCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[8]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  text-align: center;
  animation: ${slideIn} 0.4s ease-out;
`;

const QuestionTypeDisplay = styled.div`
  color: ${({ theme }) => theme.colors.accent};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const QuestionText = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  line-height: 1.4;
`;

const AnswerSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const MultipleChoiceGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[3]};
  max-width: 500px;
  margin: 0 auto;
`;

const ChoiceButton = styled.button<{ isSelected?: boolean; isCorrect?: boolean; isWrong?: boolean }>`
  background: ${props => {
    if (props.isCorrect) return props.theme.colors.success;
    if (props.isWrong) return props.theme.colors.error;
    if (props.isSelected) return props.theme.colors.accent;
    return props.theme.colors.surface;
  }};
  color: ${props => {
    if (props.isCorrect || props.isWrong || props.isSelected) return props.theme.colors.surface;
    return props.theme.colors.text;
  }};
  border: 2px solid ${props => {
    if (props.isCorrect) return props.theme.colors.success;
    if (props.isWrong) return props.theme.colors.error;
    if (props.isSelected) return props.theme.colors.accent;
    return props.theme.colors.surfaceLight;
  }};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[4]};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const TextInput = styled.input`
  width: 100%;
  max-width: 400px;
  padding: ${({ theme }) => theme.spacing[4]};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  border: 2px solid ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.body};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px rgba(69, 183, 209, 0.1);
  }
`;

const FeedbackSection = styled.div<{ isVisible: boolean }>`
  background: ${({ theme }) => theme.gradients.celebration};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[6]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  text-align: center;
  color: ${({ theme }) => theme.colors.surface};
  opacity: ${props => props.isVisible ? 1 : 0};
  transform: translateY(${props => props.isVisible ? 0 : 20}px);
  transition: all 0.3s ease;
`;

const FeedbackTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const FeedbackText = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  line-height: 1.5;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  justify-content: center;
`;

const CompletionScreen = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[8]};
`;

const CompletionTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const CompletionStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
  margin: ${({ theme }) => theme.spacing[8]} 0;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[4]};
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

interface VocabularyReviewSessionProps {
  vocabularyCards: VocabularyCard[];
  onSessionComplete: (session: ReviewSession, updatedCards: VocabularyCard[]) => void;
  onExit: () => void;
}

export const VocabularyReviewSession: React.FC<VocabularyReviewSessionProps> = ({
  vocabularyCards,
  onSessionComplete,
  onExit
}) => {
  const [sessionManager] = useState(() => new ReviewSessionManager());
  const [currentSession, setCurrentSession] = useState<ReviewSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<SessionQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation?: string } | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [completedSession, setCompletedSession] = useState<ReviewSession | null>(null);

  useEffect(() => {
    // Start the session
    const session = sessionManager.startSession(vocabularyCards);
    setCurrentSession(session);
    
    const question = sessionManager.getCurrentQuestion();
    setCurrentQuestion(question);
  }, [vocabularyCards, sessionManager]);

  const handleSubmitAnswer = useCallback(() => {
    if (!selectedAnswer || !currentQuestion) return;

    try {
      const result = sessionManager.submitAnswer(selectedAnswer);
      setFeedback(result);
      setShowFeedback(true);
      
      // Update the vocabulary card based on the result
      const cardIndex = vocabularyCards.findIndex(card => card.id === currentQuestion.cardId);
      if (cardIndex !== -1) {
        const card = vocabularyCards[cardIndex];
        const reviewResult = result.correct ? 
          (currentQuestion.responseTime! < 3000 ? ReviewResult.EASY : ReviewResult.GOOD) :
          ReviewResult.FORGOT;
        
        const updatedCard = SpacedRepetitionEngine.reviewCard(card, reviewResult, currentQuestion.responseTime || 5000);
        vocabularyCards[cardIndex] = updatedCard;
      }

    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  }, [selectedAnswer, currentQuestion, vocabularyCards, sessionManager]);

  const handleNextQuestion = useCallback(() => {
    setShowFeedback(false);
    setFeedback(null);
    setSelectedAnswer('');
    
    const nextQuestion = sessionManager.getCurrentQuestion();
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
    } else {
      // Session complete
      const session = sessionManager.completeSession();
      setCompletedSession(session);
      setIsComplete(true);
    }
  }, [sessionManager]);

  const handleSessionComplete = useCallback(() => {
    if (completedSession) {
      onSessionComplete(completedSession, vocabularyCards);
    }
  }, [completedSession, vocabularyCards, onSessionComplete]);

  const progress = sessionManager.getProgress();

  if (isComplete && completedSession) {
    return (
      <SessionContainer>
        <CompletionScreen>
          <CompletionTitle>
            <AnimatedEmoji emoji="🎉" mood="excited" />
            Session Complete!
            <AnimatedEmoji emoji="⭐" mood="floating" />
          </CompletionTitle>
          
          <CompletionStats>
            <StatCard>
              <StatValue>{completedSession.cardsReviewed}</StatValue>
              <StatLabel>Cards Reviewed</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatValue>{completedSession.cardsCorrect}</StatValue>
              <StatLabel>Correct Answers</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatValue>{Math.round((completedSession.cardsCorrect / completedSession.cardsReviewed) * 100)}%</StatValue>
              <StatLabel>Accuracy</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatValue>{Math.round(completedSession.averageTime / 1000)}s</StatValue>
              <StatLabel>Avg. Time</StatLabel>
            </StatCard>
          </CompletionStats>
          
          <ActionButtons>
            <Button variant="primary" size="lg" onClick={handleSessionComplete}>
              Continue Learning 🚀
            </Button>
            <Button variant="outline" size="lg" onClick={onExit}>
              Exit Session
            </Button>
          </ActionButtons>
        </CompletionScreen>
      </SessionContainer>
    );
  }

  if (!currentQuestion || !currentSession) {
    return (
      <SessionContainer>
        <QuestionCard>
          <QuestionText>Loading next question...</QuestionText>
        </QuestionCard>
      </SessionContainer>
    );
  }

  const isMultipleChoice = currentQuestion.options && currentQuestion.options.length > 1;

  return (
    <SessionContainer>
      <SessionHeader>
        <ProgressInfo>
          <ProgressText>
            Question {progress.current + 1} of {progress.total}
          </ProgressText>
          <AccuracyBadge accuracy={progress.accuracy}>
            {Math.round(progress.accuracy)}% Accuracy
          </AccuracyBadge>
        </ProgressInfo>
        <Button variant="ghost" size="sm" onClick={onExit}>
          Exit Session
        </Button>
      </SessionHeader>

      <ProgressBarContainer>
        <ProgressBarFill progress={progress.percentage} />
      </ProgressBarContainer>

      <QuestionCard>
        <QuestionTypeDisplay>{currentQuestion.questionType.replace('_', ' ')}</QuestionTypeDisplay>
        <QuestionText>{currentQuestion.question}</QuestionText>
        
        <AnswerSection>
          {isMultipleChoice ? (
            <MultipleChoiceGrid>
              {currentQuestion.options!.map((option, index) => (
                <ChoiceButton
                  key={index}
                  isSelected={selectedAnswer === option}
                  isCorrect={showFeedback && option === currentQuestion.correctAnswer}
                  isWrong={showFeedback && selectedAnswer === option && option !== currentQuestion.correctAnswer}
                  onClick={() => !showFeedback && setSelectedAnswer(option)}
                  disabled={showFeedback}
                >
                  {option}
                </ChoiceButton>
              ))}
            </MultipleChoiceGrid>
          ) : (
            <TextInput
              type="text"
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              placeholder="Type your answer..."
              disabled={showFeedback}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
            />
          )}
        </AnswerSection>

        {currentQuestion.hint && !showFeedback && (
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
            💡 Hint: {currentQuestion.hint}
          </div>
        )}
      </QuestionCard>

      <FeedbackSection isVisible={showFeedback}>
        {feedback && (
          <>
            <FeedbackTitle>
              <AnimatedEmoji emoji={feedback.correct ? "✅" : "❌"} mood="excited" />
              {feedback.correct ? 'Correct!' : 'Not quite right'}
            </FeedbackTitle>
            {feedback.explanation && (
              <FeedbackText>{feedback.explanation}</FeedbackText>
            )}
            {!feedback.correct && (
              <FeedbackText>
                The correct answer is: <strong>{currentQuestion.correctAnswer}</strong>
              </FeedbackText>
            )}
          </>
        )}
      </FeedbackSection>

      <ActionButtons>
        {!showFeedback ? (
          <Button 
            variant="primary" 
            size="lg" 
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer.trim()}
          >
            Submit Answer
          </Button>
        ) : (
          <Button variant="primary" size="lg" onClick={handleNextQuestion}>
            {progress.current + 1 < progress.total ? 'Next Question' : 'Finish Session'} →
          </Button>
        )}
      </ActionButtons>
    </SessionContainer>
  );
};