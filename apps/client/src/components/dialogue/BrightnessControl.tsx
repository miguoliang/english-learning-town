import React, { useState } from "react";
import styled from "styled-components";
import { useAdaptiveBrightness } from "../../hooks/useAdaptiveBrightness";

const ControlPanel = styled.div<{ isExpanded: boolean }>`
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(212, 144, 74, 0.4);
  border-radius: 12px;
  z-index: 3500;
  backdrop-filter: blur(8px);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.6),
    0 4px 8px rgba(212, 144, 74, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;

  width: ${(props) => (props.isExpanded ? "280px" : "60px")};
  height: ${(props) => (props.isExpanded ? "auto" : "60px")};
`;

const ToggleButton = styled.button`
  width: 60px;
  height: 60px;
  background: transparent;
  border: none;
  color: #d4904a;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;

  &:hover {
    background: rgba(212, 144, 74, 0.1);
    color: #e8d4b8;
  }
`;

const ControlContent = styled.div<{ isExpanded: boolean }>`
  padding: ${(props) => (props.isExpanded ? "0 20px 20px 20px" : "0")};
  opacity: ${(props) => (props.isExpanded ? 1 : 0)};
  visibility: ${(props) => (props.isExpanded ? "visible" : "hidden")};
  transition: all 0.3s ease;
`;

const ControlSection = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  color: #d4904a;
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BrightnessSlider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.4);
  outline: none;
  margin: 12px 0;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #d4904a;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    transition: all 0.2s;
  }

  &::-webkit-slider-thumb:hover {
    background: #e8d4b8;
    transform: scale(1.1);
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #d4904a;
    cursor: pointer;
    border: none;
  }
`;

const AutoModeToggle = styled.button<{ isActive: boolean }>`
  background: ${(props) =>
    props.isActive ? "rgba(212, 144, 74, 0.8)" : "rgba(0, 0, 0, 0.6)"};
  border: 1px solid rgba(212, 144, 74, 0.6);
  color: ${(props) => (props.isActive ? "#0a0906" : "#d4904a")};
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  width: 100%;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: ${(props) =>
      props.isActive ? "rgba(212, 144, 74, 1)" : "rgba(212, 144, 74, 0.2)"};
  }
`;

const StatusDisplay = styled.div`
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(212, 144, 74, 0.2);
  border-radius: 8px;
  padding: 12px;
  font-size: 0.8rem;
  color: rgba(232, 212, 184, 0.8);
  line-height: 1.4;
`;

const BrightnessValue = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(232, 212, 184, 0.9);
  font-size: 0.85rem;
  margin: 8px 0;
`;

const QuickPresets = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const PresetButton = styled.button<{ brightness: number; current: number }>`
  flex: 1;
  padding: 8px 4px;
  background: ${(props) =>
    Math.abs(props.brightness - props.current) <= 5
      ? "rgba(212, 144, 74, 0.6)"
      : "rgba(0, 0, 0, 0.6)"};
  border: 1px solid rgba(212, 144, 74, 0.4);
  border-radius: 6px;
  color: rgba(232, 212, 184, 0.9);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(212, 144, 74, 0.3);
  }
`;

interface BrightnessControlProps {
  isVisible?: boolean;
}

export const BrightnessControl: React.FC<BrightnessControlProps> = ({
  isVisible = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    brightness,
    targetBrightness,
    isAutoMode,
    ambientLight,
    setBrightness,
    toggleAutoMode,
    getBrightnessLevel,
    getRecommendation,
  } = useAdaptiveBrightness();

  if (!isVisible) return null;

  const brightnessLevel = getBrightnessLevel();
  const recommendation = getRecommendation();

  const presets = [
    { name: "Night", value: 25, icon: "🌙" },
    { name: "Low", value: 50, icon: "🔅" },
    { name: "Med", value: 75, icon: "💡" },
    { name: "High", value: 100, icon: "🔆" },
  ];

  return (
    <ControlPanel isExpanded={isExpanded}>
      <ToggleButton onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? "✕" : getBrightnessIcon(brightnessLevel)}
      </ToggleButton>

      <ControlContent isExpanded={isExpanded}>
        <ControlSection>
          <SectionTitle>💡 Brightness Control</SectionTitle>

          <BrightnessValue>
            <span>Current: {brightness}%</span>
            <span>{brightnessLevel.toUpperCase()}</span>
          </BrightnessValue>

          <BrightnessSlider
            type="range"
            min="20"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            disabled={isAutoMode}
          />

          <QuickPresets>
            {presets.map((preset) => (
              <PresetButton
                key={preset.name}
                brightness={preset.value}
                current={brightness}
                onClick={() => setBrightness(preset.value)}
                disabled={isAutoMode}
                title={`${preset.name}: ${preset.value}%`}
              >
                {preset.icon}
                <br />
                {preset.name}
              </PresetButton>
            ))}
          </QuickPresets>
        </ControlSection>

        <ControlSection>
          <SectionTitle>🤖 Auto Mode</SectionTitle>

          <AutoModeToggle isActive={isAutoMode} onClick={toggleAutoMode}>
            {isAutoMode ? "🔄 Auto ON" : "⏸️ Manual"}
          </AutoModeToggle>

          {isAutoMode && (
            <StatusDisplay>
              <div>🌡️ Ambient: {Math.round(ambientLight)}%</div>
              <div>🎯 Target: {targetBrightness}%</div>
              <div style={{ marginTop: "8px", fontSize: "0.75rem" }}>
                {recommendation}
              </div>
            </StatusDisplay>
          )}
        </ControlSection>
      </ControlContent>
    </ControlPanel>
  );
};

const getBrightnessIcon = (level: string): string => {
  switch (level) {
    case "high":
      return "🔆";
    case "medium":
      return "💡";
    case "low":
      return "🔅";
    default:
      return "💡";
  }
};
