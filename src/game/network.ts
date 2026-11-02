import { io, Socket } from 'socket.io-client';
import { PlayerRole } from '../types/game';

class NetworkManager {
  private socket: Socket | null = null;
  private currentRoom: string | null = null;
  private currentRole: PlayerRole | null = null;

  public init(): Socket {
    if (!this.socket) {
      // Connect to the same origin server on port 3000
      this.socket = io({
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('[Socket] Conectado al servidor con ID:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('[Socket] Desconectado del servidor.');
      });
    }
    return this.socket;
  }

  public getSocket(): Socket | null {
    if (!this.socket) {
      return this.init();
    }
    return this.socket;
  }

  public createRoom() {
    const s = this.getSocket();
    s?.emit('createRoom');
  }

  public joinRoom(roomCode: string) {
    const s = this.getSocket();
    s?.emit('joinRoom', { roomCode: roomCode.trim().toUpperCase() });
  }

  public leaveRoom() {
    const s = this.getSocket();
    s?.emit('leaveRoom');
    this.currentRoom = null;
    this.currentRole = null;
  }

  public setRoomInfo(room: string, role: PlayerRole) {
    this.currentRoom = room;
    this.currentRole = role;
  }

  public getRoomCode(): string | null {
    return this.currentRoom;
  }

  public getRole(): PlayerRole | null {
    return this.currentRole;
  }

  // Emitters
  public emitMove(data: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    facing: 'left' | 'right';
    isGrounded: boolean;
    animFrame: number;
  }) {
    this.socket?.emit('playerMove', data);
  }

  public emitGemCollect(gemId: string, element: 'fire' | 'water') {
    this.socket?.emit('gemCollect', { gemId, element });
  }

  public emitLeverToggle(leverId: string, isOn: boolean) {
    this.socket?.emit('leverToggle', { leverId, isOn });
  }

  public emitPlateState(plateId: string, isPressed: boolean) {
    this.socket?.emit('plateState', { plateId, isPressed });
  }

  public emitBoxMove(boxId: string, x: number, y: number, vx: number, vy: number) {
    this.socket?.emit('boxMove', { boxId, x, y, vx, vy });
  }

  public emitRuneProgress(runeId: string, progress: number, activated: boolean) {
    this.socket?.emit('runeProgress', { runeId, progress, activated });
  }

  public emitDeath(reason: string) {
    this.socket?.emit('playerDeath', { reason });
  }

  public emitRestart() {
    this.socket?.emit('levelRestart');
  }

  public emitLevelChange(levelId: number) {
    this.socket?.emit('levelChange', { levelId });
  }

  public emitVictory(timeSeconds: number, gemsCollected: number, totalGems: number) {
    this.socket?.emit('levelVictory', { timeSeconds, gemsCollected, totalGems });
  }
}

export const network = new NetworkManager();
