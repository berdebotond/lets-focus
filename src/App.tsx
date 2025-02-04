import { useState, useEffect, useCallback } from 'react'
import styled from '@emotion/styled'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EnhancedFocusScene } from './components/EnhancedFocusScene'
import { SettingsPanel } from './components/SettingsPanel'
import { ProgressBar } from './components/ProgressBar'

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #1a1a1a;
  color: white;
`

const TimerContainer = styled.div`
  position: absolute;
  z-index: 1;
  text-align: center;
`

const Timer = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`

const Controls = styled.div`
  display: flex;
  gap: 1rem;
`

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #646cff;
  color: white;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #535bf2;
  }
`

function App() {
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isAngry, setIsAngry] = useState(false);
  const [focusDuration, setFocusDuration] = useState(25);
  const [statistics, setStatistics] = useState({
    sessionsCompleted: 0,
    totalFocusTime: 0,
  });
  const [startTime, setStartTime] = useState<number | null>(null);

  // Calculate progress (0 to 1)
  const progress = 1 - (time / (focusDuration * 60));

  // Load statistics from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('focusStatistics');
    if (savedStats) {
      setStatistics(JSON.parse(savedStats));
    }
  }, []);

  // Save statistics to localStorage when updated
  useEffect(() => {
    localStorage.setItem('focusStatistics', JSON.stringify(statistics));
  }, [statistics]);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && time > 0) {
      interval = window.setInterval(() => {
        setTime((time) => {
          if (time <= 1) {
            setIsActive(false);
            // Wake up animation at the end
            setIsAngry(true);
            setTimeout(() => setIsAngry(false), 2000);
            // Update statistics
            setStatistics(prev => ({
              sessionsCompleted: prev.sessionsCompleted + 1,
              totalFocusTime: prev.totalFocusTime + focusDuration,
            }));
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, time, focusDuration]);

  // Handle user interaction during focus time
  useEffect(() => {
    const handleInteraction = (e: MouseEvent | KeyboardEvent) => {
      // Ignore interactions with the timer controls
      if (
        e.type === 'mousedown' &&
        (e.target as HTMLElement).closest('.timer-controls')
      ) {
        return;
      }

      if (isActive) {
        setIsAngry(true);
        setTimeout(() => setIsAngry(false), 2000);
      }
    };

    window.addEventListener('mousedown', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (time === 0) {
      resetTimer();
    }
    setIsActive(!isActive);
    if (isActive) {
      setStartTime(Date.now());
    } else {
      setStartTime(null);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(focusDuration * 60);
    setStartTime(null);
  };

  const handleFocusDurationChange = useCallback((duration: number) => {
    setFocusDuration(duration);
    if (!isActive) {
      setTime(duration * 60);
    }
  }, [isActive]);

  const calculateProgress = () => {
    if (!startTime || !isActive) return 0;
    const elapsed = (Date.now() - startTime) / 1000 / 60; // minutes
    return Math.min(elapsed / focusDuration, 1);
  };

  return (
    <AppContainer>
      <TimerContainer>
        <Timer>{formatTime(time)}</Timer>
        <Controls className="timer-controls">
          <Button onClick={toggleTimer}>
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={resetTimer}>Reset</Button>
        </Controls>
      </TimerContainer>
      
      <ProgressBar 
        progress={calculateProgress()}
        isActive={isActive}
      />
      
      <SettingsPanel
        focusDuration={focusDuration}
        onFocusDurationChange={handleFocusDurationChange}
        statistics={{
          totalSessions: statistics.sessionsCompleted,
          totalFocusTime: statistics.totalFocusTime
        }}
      />
      
      <Canvas style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <EnhancedFocusScene 
          isActive={isActive} 
          isAngry={isAngry} 
          progress={calculateProgress()}
        />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </AppContainer>
  );
}

export default App;
