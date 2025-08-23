import React from "react";
import styled from "styled-components";

const HealthIndicator = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(212, 144, 74, 0.4);
  border-radius: 8px;
  padding: 12px 16px;
  z-index: 3500;
  backdrop-filter: blur(6px);
  font-size: 0.8rem;
  color: rgba(232, 212, 184, 0.7);
  min-width: 200px;
`;

const IndicatorRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.span`
  font-weight: 500;
`;

const Value = styled.span`
  color: #d4904a;
  font-weight: 500;
`;

const TimeBar = styled.div`
  width: 100%;
  height: 3px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
`;

const TimeProgress = styled.div<{ progress: number; warning?: boolean }>`
  height: 100%;
  background: ${(props) =>
    props.warning
      ? "linear-gradient(90deg, #d4904a, #e74c3c)"
      : "linear-gradient(90deg, #2ecc71, #d4904a)"};
  width: ${(props) => props.progress}%;
  transition: all 0.3s ease;
`;

interface EyeHealthIndicatorProps {
  sessionStats: {
    readingTimeMinutes: number;
    totalTimeMinutes: number;
    blinkRemindersShown: number;
    nextBreakIn: number;
  };
  isVisible: boolean;
}

export const EyeHealthIndicator: React.FC<EyeHealthIndicatorProps> = ({
  sessionStats,
  isVisible,
}) => {
  if (!isVisible) return null;

  const { readingTimeMinutes, blinkRemindersShown, nextBreakIn } = sessionStats;
  const breakProgress = Math.max(
    0,
    Math.min(100, ((20 - nextBreakIn) / 20) * 100),
  );
  const isWarning = nextBreakIn <= 2; // Warning when less than 2 minutes until break

  return (
    <HealthIndicator>
      <IndicatorRow>
        <Label>👁️ Session:</Label>
        <Value>{readingTimeMinutes}m</Value>
      </IndicatorRow>

      <IndicatorRow>
        <Label>💧 Blink reminders:</Label>
        <Value>{blinkRemindersShown}</Value>
      </IndicatorRow>

      <IndicatorRow>
        <Label>⏰ Next break:</Label>
        <Value>{nextBreakIn}m</Value>
      </IndicatorRow>

      <TimeBar>
        <TimeProgress progress={breakProgress} warning={isWarning} />
      </TimeBar>
    </HealthIndicator>
  );
};
