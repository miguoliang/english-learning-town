// Notification System Component

import React, { useEffect } from "react";
import styled from "styled-components";
import { useGameStore } from "../../stores/unifiedGameStore";
import type { Notification } from "../../types";

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
  pointer-events: none;
`;

const NotificationItem = styled.div.withConfig({
  shouldForwardProp: (prop) => !["type"].includes(prop),
})<{ type?: string }>`
  background: ${(props) => {
    switch (props.type) {
      case "quest_started":
        return "linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)";
      case "quest_completed":
        return "linear-gradient(135deg, #00b894 0%, #00a085 100%)";
      case "objective_completed":
        return "linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)";
      case "experience_gained":
        return "linear-gradient(135deg, #fd79a8 0%, #e84393 100%)";
      case "level_up":
        return "linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)";
      default:
        return "linear-gradient(135deg, #636e72 0%, #2d3436 100%)";
    }
  }};
  color: white;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 12px;
  min-width: 300px;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(-5px) scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const NotificationIcon = styled.span.withConfig({
  shouldForwardProp: (prop) => !["type"].includes(prop),
})<{ type?: string }>`
  font-size: 20px;
  ${(props) => {
    switch (props.type) {
      case "quest_started":
        return "";
      case "quest_completed":
        return "filter: drop-shadow(0 0 8px rgba(0, 184, 148, 0.8));";
      case "objective_completed":
        return "filter: drop-shadow(0 0 8px rgba(253, 203, 110, 0.8));";
      case "experience_gained":
        return "filter: drop-shadow(0 0 8px rgba(253, 121, 168, 0.8));";
      case "level_up":
        return "filter: drop-shadow(0 0 12px rgba(255, 234, 167, 1)); animation: pulse 2s infinite;";
      default:
        return "";
    }
  }}

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }
`;

const NotificationTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  flex: 1;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const NotificationMessage = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  opacity: 0.95;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
`;

const ProgressFill = styled.div.withConfig({
  shouldForwardProp: (prop) => !["progress"].includes(prop),
})<{ progress: number }>`
  height: 100%;
  width: ${(props) => props.progress}%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 2px;
  transition: width 0.8s ease-out;
`;

const getNotificationIcon = (type: string): string => {
  switch (type) {
    case "quest_started":
      return "🎯";
    case "quest_completed":
      return "✅";
    case "objective_completed":
      return "⭐";
    case "experience_gained":
      return "📈";
    case "level_up":
      return "🎉";
    default:
      return "💡";
  }
};

interface NotificationItemProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const NotificationComponent: React.FC<NotificationItemProps> = ({
  notification,
  onClose,
}) => {
  useEffect(() => {
    if (notification.duration > 0) {
      const timer = setTimeout(() => {
        onClose(notification.id);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration, notification.id, onClose]);

  const handleClick = () => {
    onClose(notification.id);
  };

  return (
    <NotificationItem type={notification.type} onClick={handleClick}>
      <NotificationHeader>
        <NotificationIcon type={notification.type}>
          {getNotificationIcon(notification.type)}
        </NotificationIcon>
        <NotificationTitle>{notification.title}</NotificationTitle>
        <CloseButton
          onClick={(e) => {
            e.stopPropagation();
            onClose(notification.id);
          }}
        >
          ×
        </CloseButton>
      </NotificationHeader>

      <NotificationMessage
        dangerouslySetInnerHTML={{ __html: notification.message }}
      />

      {notification.progress !== undefined && notification.progress >= 0 && (
        <ProgressBar>
          <ProgressFill progress={notification.progress} />
        </ProgressBar>
      )}
    </NotificationItem>
  );
};

export const NotificationSystem: React.FC = () => {
  const { notifications, removeNotification } = useGameStore();

  // Sort notifications by timestamp (newest first) and limit to 5
  const displayNotifications = [...notifications]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  return (
    <NotificationContainer>
      {displayNotifications.map((notification) => (
        <NotificationComponent
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </NotificationContainer>
  );
};

export default NotificationSystem;
