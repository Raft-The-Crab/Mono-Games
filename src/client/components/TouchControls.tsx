/**
 * Mobile Touch Controls Component
 * On-screen buttons for mobile/Android gameplay
 * Redesigned for better visibility and no overlap with game content
 */

import { useEffect, useState } from 'react';
import type React from 'react';

interface TouchControlsProps {
  onLeftDown?: () => void;
  onLeftUp?: () => void;
  onRightDown?: () => void;
  onRightUp?: () => void;
  onUpDown?: () => void;
  onUpUp?: () => void;
  onDownDown?: () => void;
  onDownUp?: () => void;
  onActionDown?: () => void;
  onActionUp?: () => void;
  onAction2Down?: () => void;
  onAction2Up?: () => void;
  layout?: 'dpad' | 'arrows' | 'simple';
  visible?: boolean;
}

const TouchControls: React.FC<TouchControlsProps> = ({
  onLeftDown,
  onLeftUp,
  onRightDown,
  onRightUp,
  onUpDown,
  onUpUp,
  onDownDown,
  onDownUp,
  onActionDown,
  onActionUp,
  onAction2Down,
  onAction2Up,
  layout = 'dpad',
  visible = true
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth < 768;
    };
    setIsMobile(checkMobile());

    const handleResize = () => setIsMobile(checkMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMobile || !visible) return null;

  // Haptic feedback for better touch response
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handlePress = (callback?: () => void) => {
    triggerHaptic();
    if (callback) callback();
  };

  // Shared button styles - more visible with solid backgrounds
  const dpadButtonStyle: React.CSSProperties = {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'rgba(255, 255, 255, 0.85)',
    border: '3px solid rgba(255, 179, 71, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2C3E50',
    touchAction: 'manipulation',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    cursor: 'pointer',
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.25), inset 0 1px 2px rgba(255,255,255,0.5)',
    transition: 'transform 0.1s ease, box-shadow 0.1s ease'
  };

  const actionButtonStyle: React.CSSProperties = {
    ...dpadButtonStyle,
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    fontSize: '22px',
    fontWeight: 'bold'
  };

  return (
    <div
      className="touch-controls-container"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '160px',
        background: 'linear-gradient(to top, rgba(255,248,220,0.95) 0%, rgba(255,248,220,0.7) 70%, transparent 100%)',
        pointerEvents: 'none',
        zIndex: 1000,
        paddingBottom: 'env(safe-area-inset-bottom, 8px)'
      }}
    >
      {/* D-Pad Controls (Left Side) */}
      {layout === 'dpad' && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          width: '140px',
          height: '140px',
          pointerEvents: 'auto'
        }}>
          {/* Up */}
          {onUpDown && (
            <button
              onPointerDown={(e) => { e.preventDefault(); handlePress(onUpDown); }}
              onPointerUp={() => handlePress(onUpUp)}
              onPointerCancel={() => handlePress(onUpUp)}
              onPointerLeave={() => handlePress(onUpUp)}
              style={{
                ...dpadButtonStyle,
                position: 'absolute',
                top: '0',
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            >
              ▲
            </button>
          )}

          {/* Down */}
          {onDownDown && (
            <button
              onPointerDown={(e) => { e.preventDefault(); handlePress(onDownDown); }}
              onPointerUp={() => handlePress(onDownUp)}
              onPointerCancel={() => handlePress(onDownUp)}
              onPointerLeave={() => handlePress(onDownUp)}
              style={{
                ...dpadButtonStyle,
                position: 'absolute',
                bottom: '0',
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            >
              ▼
            </button>
          )}

          {/* Left */}
          {onLeftDown && (
            <button
              onPointerDown={(e) => { e.preventDefault(); handlePress(onLeftDown); }}
              onPointerUp={() => handlePress(onLeftUp)}
              onPointerCancel={() => handlePress(onLeftUp)}
              onPointerLeave={() => handlePress(onLeftUp)}
              style={{
                ...dpadButtonStyle,
                position: 'absolute',
                left: '0',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            >
              ◀
            </button>
          )}

          {/* Right */}
          {onRightDown && (
            <button
              onPointerDown={(e) => { e.preventDefault(); handlePress(onRightDown); }}
              onPointerUp={() => handlePress(onRightUp)}
              onPointerCancel={() => handlePress(onRightUp)}
              onPointerLeave={() => handlePress(onRightUp)}
              style={{
                ...dpadButtonStyle,
                position: 'absolute',
                right: '0',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            >
              ▶
            </button>
          )}
        </div>
      )}

      {/* Simple Left/Right (For endless runners, etc) */}
      {layout === 'simple' && (
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '16px',
          right: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          pointerEvents: 'auto'
        }}>
          {onLeftDown && (
            <button
              onPointerDown={(e) => { e.preventDefault(); handlePress(onLeftDown); }}
              onPointerUp={() => handlePress(onLeftUp)}
              onPointerCancel={() => handlePress(onLeftUp)}
              onPointerLeave={() => handlePress(onLeftUp)}
              style={dpadButtonStyle}
            >
              ◀
            </button>
          )}

          {onRightDown && (
            <button
              onPointerDown={(e) => { e.preventDefault(); handlePress(onRightDown); }}
              onPointerUp={() => handlePress(onRightUp)}
              onPointerCancel={() => handlePress(onRightUp)}
              onPointerLeave={() => handlePress(onRightUp)}
              style={dpadButtonStyle}
            >
              ▶
            </button>
          )}
        </div>
      )}

      {/* Action Buttons (Right Side) */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        right: '16px',
        display: 'flex',
        gap: '12px',
        pointerEvents: 'auto',
        alignItems: 'center'
      }}>
        {onAction2Down && (
          <button
            onPointerDown={(e) => { e.preventDefault(); handlePress(onAction2Down); }}
            onPointerUp={() => handlePress(onAction2Up)}
            onPointerCancel={() => handlePress(onAction2Up)}
            onPointerLeave={() => handlePress(onAction2Up)}
            style={{
              ...actionButtonStyle,
              background: 'linear-gradient(135deg, #4ECDC4 0%, #45B7AA 100%)',
              border: '3px solid #2C9F92',
              color: 'white'
            }}
          >
            B
          </button>
        )}

        {onActionDown && (
          <button
            onPointerDown={(e) => { e.preventDefault(); handlePress(onActionDown); }}
            onPointerUp={() => handlePress(onActionUp)}
            onPointerCancel={() => handlePress(onActionUp)}
            onPointerLeave={() => handlePress(onActionUp)}
            style={{
              ...actionButtonStyle,
              width: '72px',
              height: '72px',
              background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
              border: '3px solid #C64F25',
              color: 'white',
              fontSize: '24px'
            }}
          >
            A
          </button>
        )}
      </div>
    </div>
  );
};

export default TouchControls;
