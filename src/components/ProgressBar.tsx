import styled from '@emotion/styled';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0 to 1
  isActive: boolean;
}

const ProgressContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  z-index: 1000;
`;

const Progress = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #646cff, #82ffd2);
  transform-origin: left;
`;

const TimeDisplay = styled(motion.div)`
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 4px 12px;
  border-radius: 12px;
  color: white;
  font-size: 0.9rem;
  pointer-events: none;
  white-space: nowrap;
`;

export function ProgressBar({ progress, isActive }: ProgressBarProps) {
  const formatTime = (progress: number) => {
    const remainingMinutes = Math.ceil((1 - progress) * 25); // Assuming 25 minutes is default
    return `${remainingMinutes}m remaining`;
  };

  return (
    <ProgressContainer>
      <Progress
        initial={{ scaleX: 0 }}
        animate={{ 
          scaleX: progress,
          transition: { duration: 0.5, ease: "easeOut" }
        }}
      />
      <TimeDisplay
        initial={{ opacity: 0, y: -10 }}
        animate={{ 
          opacity: isActive ? 1 : 0,
          y: isActive ? 0 : -10,
          transition: { duration: 0.3 }
        }}
      >
        {formatTime(progress)}
      </TimeDisplay>
    </ProgressContainer>
  );
} 