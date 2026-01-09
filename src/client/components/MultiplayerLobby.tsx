// Multiplayer Lobby - SUPER CARTOONY UI!
import { useState, useEffect } from 'react';
import type React from 'react';

interface Player {
    id: string;
    username: string;
    avatar: string;
    rank: string;
    isReady: boolean;
    isHost: boolean;
}

interface Room {
    id: string;
    name: string;
    game: string;
    host: string;
    players: Player[];
    maxPlayers: number;
    gameMode: string;
}

const MultiplayerLobby: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

    useEffect(() => {
        // Mock data
        setRooms([
            {
                id: '1',
                name: '🏆 Pro Players Only',
                game: 'Snake Battle',
                host: 'SnakeKing',
                players: [
                    { id: '1', username: 'SnakeKing', avatar: '👑', rank: 'Master', isReady: true, isHost: true },
                    { id: '2', username: 'ProGamer', avatar: '🎮', rank: 'Diamond', isReady: false, isHost: false }
                ],
                maxPlayers: 4,
                gameMode: 'Battle Royale'
            },
            {
                id: '2',
                name: '✨ Chill & Fun',
                game: 'Tetris',
                host: 'ChillDude',
                players: [
                    { id: '3', username: 'ChillDude', avatar: '😎', rank: 'Gold', isReady: true, isHost: true }
                ],
                maxPlayers: 2,
                gameMode: 'Versus'
            }
        ]);
    }, []);

    return (
        <div style={{
            padding: '2rem',
            background: 'var(--bg-gradient)',
            minHeight: '100vh',
            fontFamily: "'Comic Sans MS', cursive"
        }}>
            {/* BOUNCY HEADER */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: '6px solid var(--text-primary)',
                borderRadius: '32px',
                padding: '2.5rem',
                marginBottom: '2rem',
                boxShadow: '0 15px 0 var(--text-primary), 0 25px 50px rgba(0,0,0,0.4)',
                transform: 'rotate(-2deg)',
                animation: 'headerBounce 4s ease-in-out infinite'
            }}>
                <h1 style={{
                    fontSize: '3.5rem',
                    color: 'white',
                    textShadow: '5px 5px 0 var(--text-primary)',
                    margin: 0,
                    transform: 'rotate(2deg)',
                    animation: 'textWobble 2s ease-in-out infinite'
                }}>
                    🎮 Multiplayer Lobby!
                </h1>
                <p style={{
                    fontSize: '1.3rem',
                    color: 'white',
                    margin: '1rem 0 0 0',
                    fontWeight: 700,
                    textShadow: '2px 2px 0 rgba(0,0,0,0.3)'
                }}>
                    Battle friends in real-time! 🚀
                </p>
            </div>

            {/* CREATE ROOM BUTTON */}
            <button style={{
                padding: '1.5rem 3rem',
                background: 'linear-gradient(135deg, #FFD93D, #FFA07A)',
                border: '5px solid var(--text-primary)',
                borderRadius: '28px',
                fontSize: '1.5rem',
                fontWeight: 900,
                cursor: 'pointer',
                marginBottom: '2rem',
                boxShadow: '0 8px 0 var(--text-primary)',
                transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                color: 'var(--text-primary)'
            }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.05) rotate(-2deg)';
                    e.currentTarget.style.boxShadow = '0 12px 0 var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 8px 0 var(--text-primary)';
                }}>
                ✨ Create New Room
            </button>

            {/* ROOMS GRID */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                gap: '2rem'
            }}>
                {rooms.map(room => (
                    <div
                        key={room.id}
                        style={{
                            background: 'var(--bg-card)',
                            border: '6px solid var(--border-color)',
                            borderRadius: '28px',
                            padding: '2rem',
                            boxShadow: '0 10px 0 var(--text-primary)',
                            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px) rotate(1deg)';
                            e.currentTarget.style.boxShadow = '0 15px 0 var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 10px 0 var(--text-primary)';
                        }}
                    >
                        {/* Decorative Corner */}
                        <div style={{
                            position: 'absolute',
                            top: -20,
                            right: -20,
                            width: 80,
                            height: 80,
                            background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
                            borderRadius: '50%',
                            border: '4px solid var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            animation: 'spin 10s linear infinite'
                        }}>
                            {room.game.includes('Snake') && '🐍'}
                            {room.game.includes('Tetris') && '🧱'}
                        </div>

                        {/* Room Name */}
                        <h2 style={{
                            fontSize: '1.8rem',
                            color: 'var(--primary)',
                            margin: '0 0 1rem 0',
                            fontWeight: 900,
                            textShadow: '2px 2px 0 rgba(0,0,0,0.1)'
                        }}>
                            {room.name}
                        </h2>

                        {/* Game Info */}
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: 'white',
                            padding: '1rem',
                            borderRadius: '16px',
                            marginBottom: '1rem',
                            border: '3px solid var(--text-primary)',
                            boxShadow: '0 4px 0 var(--text-primary)'
                        }}>
                            <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>🎮 {room.game}</div>
                            <div style={{ fontSize: '0.95rem', marginTop: '0.25rem', opacity: 0.9 }}>
                                Mode: {room.gameMode}
                            </div>
                        </div>

                        {/* Players */}
                        <div style={{
                            background: 'rgba(0,0,0,0.05)',
                            padding: '1rem',
                            borderRadius: '16px',
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '0.75rem',
                                fontWeight: 900,
                                fontSize: '1.1rem'
                            }}>
                                <span>👥 Players</span>
                                <span>{room.players.length}/{room.maxPlayers}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {room.players.map(player => (
                                    <div key={player.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.5rem',
                                        background: 'white',
                                        borderRadius: '12px',
                                        border: '3px solid var(--text-primary)'
                                    }}>
                                        <div style={{ fontSize: '2rem' }}>{player.avatar}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 900, fontSize: '1.05rem' }}>
                                                {player.username} {player.isHost && '👑'}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>{player.rank}</div>
                                        </div>
                                        {player.isReady ? (
                                            <div style={{
                                                padding: '0.4rem 0.8rem',
                                                background: '#4ECDC4',
                                                borderRadius: '12px',
                                                fontSize: '0.9rem',
                                                fontWeight: 900,
                                                border: '2px solid var(--text-primary)'
                                            }}>
                                                ✅ Ready
                                            </div>
                                        ) : (
                                            <div style={{
                                                padding: '0.4rem 0.8rem',
                                                background: '#FFD93D',
                                                borderRadius: '12px',
                                                fontSize: '0.9rem',
                                                fontWeight: 900,
                                                border: '2px solid var(--text-primary)'
                                            }}>
                                                ⏳ Waiting
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {new Array(room.maxPlayers - room.players.length).fill(0).map((_, i) => (
                                    <div key={`empty-${i}`} style={{
                                        padding: '0.75rem',
                                        background: 'rgba(0,0,0,0.05)',
                                        borderRadius: '12px',
                                        border: '3px dashed var(--border-color)',
                                        textAlign: 'center',
                                        opacity: 0.5,
                                        fontWeight: 700
                                    }}>
                                        Empty Slot
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Join Button */}
                        <button style={{
                            width: '100%',
                            padding: '1.2rem',
                            background: room.players.length < room.maxPlayers
                                ? 'linear-gradient(135deg, #4ECDC4, #44A08D)'
                                : '#999',
                            border: '4px solid var(--text-primary)',
                            borderRadius: '20px',
                            color: 'white',
                            fontSize: '1.3rem',
                            fontWeight: 900,
                            cursor: room.players.length < room.maxPlayers ? 'pointer' : 'not-allowed',
                            boxShadow: '0 6px 0 var(--text-primary)',
                            transition: 'all 0.2s ease'
                        }}
                            disabled={room.players.length >= room.maxPlayers}
                            onMouseEnter={(e) => {
                                if (room.players.length < room.maxPlayers) {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'none';
                            }}>
                            {room.players.length < room.maxPlayers ? '🚀 Join Room!' : '🔒 Room Full'}
                        </button>
                    </div>
                ))}
            </div>

            {/* No Rooms Message */}
            {rooms.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '5rem',
                    background: 'var(--bg-card)',
                    border: '6px dashed var(--border-color)',
                    borderRadius: '32px'
                }}>
                    <div style={{ fontSize: '6rem', marginBottom: '1rem', animation: 'float 3s ease-in-out infinite' }}>
                        🎮
                    </div>
                    <h3 style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>
                        No rooms yet!
                    </h3>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                        Be the first to create one! 🚀
                    </p>
                </div>
            )}
        </div>
    );
};

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes headerBounce {
    0%, 100% { transform: rotate(-2deg) translateY(0); }
    50% { transform: rotate(-2deg) translateY(-10px); }
  }
  @keyframes textWobble {
    0%, 100% { transform: rotate(2deg); }
    50% { transform: rotate(-2deg); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default MultiplayerLobby;
