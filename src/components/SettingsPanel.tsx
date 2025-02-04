import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface SettingsPanelProps {
  focusDuration: number;
  onFocusDurationChange: (duration: number) => void;
  statistics: {
    totalSessions: number;
    totalFocusTime: number;
  };
}

const PanelContainer = styled(motion.div)`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 15px;
  color: white;
  z-index: 1000;
  max-width: 300px;
  width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    transform-origin: top right;
  }
`;

const ToggleButton = styled(motion.button)`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  color: white;
  cursor: pointer;
  z-index: 1001;
  display: none;
  align-items: center;
  justify-content: center;
  font-size: 24px;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const Title = styled.h2`
  margin: 0 0 20px 0;
  font-size: 1.5rem;
  font-weight: 500;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  opacity: 0.8;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const Stats = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 15px;
  border-radius: 8px;
`;

const StatItem = styled.div`
  margin-bottom: 10px;
  font-size: 0.9rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export function SettingsPanel({ focusDuration, onFocusDurationChange, statistics }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <>
      <ToggleButton
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? '×' : '⚙️'}
      </ToggleButton>

      <AnimatePresence>
        {isOpen && (
          <PanelContainer
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <Title>Settings</Title>
            
            <InputGroup>
              <Label>Focus Duration (minutes)</Label>
              <Input
                type="number"
                min="1"
                max="120"
                value={focusDuration}
                onChange={(e) => onFocusDurationChange(Number(e.target.value))}
              />
            </InputGroup>

            <Stats>
              <StatItem>Total Sessions: {statistics.totalSessions}</StatItem>
              <StatItem>Total Focus Time: {formatTime(statistics.totalFocusTime)}</StatItem>
            </Stats>
          </PanelContainer>
        )}
      </AnimatePresence>
    </>
  );
} 