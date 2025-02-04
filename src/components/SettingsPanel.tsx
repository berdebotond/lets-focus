import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const Panel = styled(motion.div)`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(30, 30, 30, 0.9);
  padding: 20px;
  border-radius: 12px;
  color: white;
  z-index: 1000;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(100, 108, 255, 0.3);
`;

const Title = styled.h2`
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  color: #646cff;
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-size: 0.9rem;
  color: #888;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(100, 108, 255, 0.2);
  border-radius: 4px;
  color: white;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #646cff;
  }
`;

const Stats = styled.div`
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #888;
`;

interface SettingsPanelProps {
  focusDuration: number;
  onFocusDurationChange: (duration: number) => void;
  statistics: {
    sessionsCompleted: number;
    totalFocusTime: number;
  };
}

export function SettingsPanel({ 
  focusDuration, 
  onFocusDurationChange,
  statistics 
}: SettingsPanelProps) {
  const formatTotalTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Panel
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20 }}
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
        <StatItem>
          <span>Sessions Completed:</span>
          <span>{statistics.sessionsCompleted}</span>
        </StatItem>
        <StatItem>
          <span>Total Focus Time:</span>
          <span>{formatTotalTime(statistics.totalFocusTime)}</span>
        </StatItem>
      </Stats>
    </Panel>
  );
} 