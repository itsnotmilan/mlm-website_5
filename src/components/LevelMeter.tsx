import React, { useState, useEffect } from 'react';

interface LevelMeterProps {
  level: number;
  experience: number;
  maxExperience: number;
}

export const LevelMeter: React.FC<LevelMeterProps> = ({ level, experience, maxExperience }) => {
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [displayLevel, setDisplayLevel] = useState(level);
  const [displayExperience, setDisplayExperience] = useState(experience);
  const [displayMaxExperience, setDisplayMaxExperience] = useState(maxExperience);
  const [showProgress, setShowProgress] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (initialLoad) {
      setDisplayExperience(experience);
      setDisplayLevel(level);
      setDisplayMaxExperience(maxExperience);
      setInitialLoad(false);
      return;
    }

    if (isAnimating) return;

    if (level !== displayLevel || experience !== displayExperience) {
      handleExperienceChange(experience, level);
    }
  }, [level, experience, displayLevel, displayExperience, isAnimating, initialLoad, maxExperience]);

  const animateXP = async (startExp: number, endExp: number, duration: number = 1000) => {
    const startTime = Date.now();
    const expDiff = endExp - startExp;

    return new Promise<void>(resolve => {
      const updateXP = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smoother animation
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const currentExp = Math.floor(startExp + (expDiff * easeProgress));
        setDisplayExperience(currentExp);

        if (progress < 1) {
          requestAnimationFrame(updateXP);
        } else {
          setDisplayExperience(endExp);
          resolve();
        }
      };

      requestAnimationFrame(updateXP);
    });
  };

  const handleExperienceChange = async (newExp: number, targetLevel: number) => {
    setIsAnimating(true);
    let currentLevel = displayLevel;
    let currentExp = displayExperience;
    let currentMaxExp = displayMaxExperience;

    // If we're just updating XP within the same level
    if (currentLevel === targetLevel) {
      await animateXP(currentExp, newExp);
      setIsAnimating(false);
      return;
    }

    while (currentLevel < targetLevel) {
      // First, animate filling up the current level's XP bar
      await animateXP(currentExp, currentMaxExp);
      
      // Once the bar is full, trigger level up animation
      setShowProgress(false);
      setIsLevelingUp(true);
      
      // Update level
      currentLevel++;
      setDisplayLevel(currentLevel);
      
      // Wait for level up animation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Prepare for next level
      currentMaxExp = Math.floor(currentMaxExp * 1.2);
      currentExp = 0;
      
      setIsLevelingUp(false);
      setDisplayMaxExperience(currentMaxExp);
      setDisplayExperience(0);
      
      // Show new progress bar
      setShowProgress(true);
      
      // Small delay to ensure the bar reset is visible
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Animate to final experience value for the last level
    if (newExp > 0) {
      await animateXP(0, newExp);
    }

    setIsAnimating(false);
  };

  const progressWidth = `${(displayExperience / displayMaxExperience) * 100}%`;

  return (
    <div className="space-y-2 relative">
      <div className="flex justify-between items-center">
        <div className={`text-sm transition-all duration-500 ${isLevelingUp ? 'animate-levelUp text-yellow-400 font-bold' : ''}`}>
          Level {displayLevel} <span className="text-green-400">+{displayLevel * 20}%</span>
        </div>
        <span className="text-xs text-gray-400">{displayExperience}/{displayMaxExperience} XP</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden relative">
        {showProgress && (
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-green-300 transition-transform duration-300 origin-left"
            style={{ 
              width: progressWidth,
              transform: 'scaleX(1)',
              transformOrigin: 'left'
            }}
          />
        )}
        {isLevelingUp && (
          <>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(LevelMeter);