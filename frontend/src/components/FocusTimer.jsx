import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';

const FocusTimer = () => {
  const WORK_TIME = 30 * 60; // 25 minutes
  const BREAK_TIME = 5 * 60; // 5 minutes

  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isWorkPhase, setIsWorkPhase] = useState(true);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Phase completed
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.log('Audio play failed:', e));

      if (isWorkPhase) {
        setSessionsCompleted(s => s + 1);
        setIsWorkPhase(false);
        setTimeLeft(BREAK_TIME);
      } else {
        setIsWorkPhase(true);
        setTimeLeft(WORK_TIME);
      }
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isWorkPhase]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isWorkPhase ? WORK_TIME : BREAK_TIME);
  };

  const skipPhase = () => {
    setIsActive(false);
    if (isWorkPhase) {
      setSessionsCompleted(s => s + 1);
      setIsWorkPhase(false);
      setTimeLeft(BREAK_TIME);
    } else {
      setIsWorkPhase(true);
      setTimeLeft(WORK_TIME);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalTime = isWorkPhase ? WORK_TIME : BREAK_TIME;
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div>
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1 className="page-title">Focus Timer</h1>
        <p className="page-subtitle"></p>
      </div>

      <div className="timer-container">
        <div
          className="timer-ring glow-effect"
          style={{
            '--progress': `${progressPercent}%`,
            '--primary': isWorkPhase ? 'var(--primary)' : 'var(--success)'
          }}
        >
          <div className="timer-inner">
            {isWorkPhase ? <Brain size={32} color="var(--primary)" /> : <Coffee size={32} color="var(--success)" />}
            <div className="timer-time">{formatTime(timeLeft)}</div>
            <div className="timer-phase">{isWorkPhase ? 'Focus' : 'Break'}</div>
          </div>
        </div>

        <div className="timer-controls">
          <button className="timer-btn" onClick={resetTimer} title="Reset">
            <RotateCcw size={24} />
          </button>
          <button className="timer-btn play block" style={{ width: '80px', height: '80px' }} onClick={toggleTimer}>
            {isActive ? <Pause size={32} color="white" /> : <Play size={32} color="white" style={{ marginLeft: '4px' }} />}
          </button>
          <button className="timer-btn" onClick={skipPhase} title="Skip">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
          </button>
        </div>

        <div className="card" style={{ minWidth: '300px', textAlign: 'center' }}>
          <div className="text-muted mb-4 uppercase text-sm tracking-wide">Today's Sessions</div>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  backgroundColor: i <= sessionsCompleted ? 'var(--primary)' : 'var(--surface-hover)',
                  boxShadow: i <= sessionsCompleted ? '0 0 10px var(--primary)' : 'none'
                }}
              />
            ))}
          </div>
          <div className="mt-4 font-bold">{sessionsCompleted} Pomodoros completed</div>
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;
