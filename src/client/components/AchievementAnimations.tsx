/**
 * Achievement Animations & Confetti Effects
 * Beautiful visual feedback for unlocks and rewards
 */

import React, { useEffect, useState } from 'react';


interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
  shape: 'circle' | 'square' | 'triangle';
}

interface AchievementToastProps {
  achievement: {
    title: string;
    description: string;
    icon?: string;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
    reward?: number;
  };
  onClose: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const rarityColors = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b'
  };

  const rarityGradients = {
    common: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
    rare: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
    epic: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)',
    legendary: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
  };

  const rarity = achievement.rarity || 'common';

  return (
    <div style={{
      position: 'fixed',
      top: isVisible ? '20px' : '-200px',
      right: '20px',
      zIndex: 10000,
      transition: 'top 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      maxWidth: '400px',
      minWidth: '320px'
    }}>
      <div style={{
        background: rarityGradients[rarity],
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        border: `4px solid ${rarityColors[rarity]}`,
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '12px',
          gap: '10px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#fff',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            {achievement.icon || '🏆'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Comic Sans MS', cursive",
              fontWeight: 'bold',
              fontSize: '12px',
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '2px'
            }}>
              Achievement Unlocked!
            </div>
            <div style={{
              fontFamily: "'Comic Sans MS', cursive",
              fontWeight: 'bold',
              fontSize: '18px',
              color: '#fff',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              {achievement.title}
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            style={{
              background: 'rgba(255,255,255,0.3)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#fff',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Description */}
        <p style={{
          fontFamily: "'Comic Sans MS', cursive",
          fontSize: '14px',
          color: '#fff',
          margin: '0 0 12px 0',
          lineHeight: '1.5'
        }}>
          {achievement.description}
        </p>

        {/* Reward */}
        {achievement.reward && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.2)',
            padding: '8px 12px',
            borderRadius: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>💎</span>
            <span style={{
              fontFamily: "'Comic Sans MS', cursive",
              fontWeight: 'bold',
              fontSize: '16px',
              color: '#fff'
            }}>
              +{achievement.reward} Diamonds
            </span>
          </div>
        )}

        {/* Rarity Badge */}
        <div style={{
          position: 'absolute',
          top: '-12px',
          left: '20px',
          background: rarityColors[rarity],
          color: '#fff',
          padding: '4px 12px',
          borderRadius: '12px',
          fontFamily: "'Comic Sans MS', cursive",
          fontWeight: 'bold',
          fontSize: '12px',
          textTransform: 'uppercase',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          {rarity}
        </div>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
};

export const ConfettiExplosion: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    // Generate confetti particles
    const newParticles: ConfettiParticle[] = [];
    const colors = ['#fbbf24', '#f59e0b', '#3b82f6', '#60a5fa', '#a855f7', '#ec4899', '#10b981', '#f87171'];
    const shapes: Array<'circle' | 'square' | 'triangle'> = ['circle', 'square', 'triangle'];

    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15 - 5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        shape: shapes[Math.floor(Math.random() * shapes.length)]
      });
    }

    setParticles(newParticles);

    // Animate particles
    let animationFrame: number;
    const animate = () => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.5, // Gravity
        rotation: p.rotation + p.rotationSpeed
      })).filter(p => p.y < window.innerHeight + 50)); // Remove off-screen particles

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    // Clean up after 3 seconds
    const timer = setTimeout(() => {
      cancelAnimationFrame(animationFrame);
      if (onComplete) onComplete();
    }, 3000);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 9999
    }}>
      {particles.map(particle => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            background: particle.color,
            borderRadius: particle.shape === 'circle' ? '50%' : '0',
            transform: `rotate(${particle.rotation}deg)`,
            transition: 'all 0.05s linear'
          }}
        />
      ))}
    </div>
  );
};

// Achievement notification manager
export class AchievementManager {
  private static notifications: Array<{
    id: number;
    achievement: any;
  }> = [];
  private static listeners: Array<(notifications: any[]) => void> = [];
  private static nextId = 0;

  static show(achievement: any) {
    const notification = {
      id: this.nextId++,
      achievement
    };

    this.notifications.push(notification);
    this.notifyListeners();

    // Auto remove after 5.5 seconds
    setTimeout(() => {
      this.remove(notification.id);
    }, 5500);
  }

  static remove(id: number) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  static subscribe(listener: (notifications: any[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }
}

// Provider component to render all achievement toasts
export const AchievementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    return AchievementManager.subscribe((newNotifications) => {
      setNotifications(newNotifications);
      
      // Show confetti for rare+ achievements
      const hasRare = newNotifications.some(n => 
        ['rare', 'epic', 'legendary'].includes(n.achievement.rarity)
      );
      if (hasRare && !showConfetti) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    });
  }, [showConfetti]);

  return (
    <>
      {children}
      <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 10000 }}>
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{
              marginTop: index > 0 ? '10px' : '0'
            }}
          >
            <AchievementToast
              achievement={notification.achievement}
              onClose={() => AchievementManager.remove(notification.id)}
            />
          </div>
        ))}
      </div>
      {showConfetti && <ConfettiExplosion onComplete={() => setShowConfetti(false)} />}
    </>
  );
};

export default AchievementManager;
