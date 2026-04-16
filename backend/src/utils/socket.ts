import { Server as SocketIOServer } from 'socket.io';

export const emitNotification = (
  io: SocketIOServer | any,
  userId: string,
  event: string,
  data: any
) => {
  if (io && typeof io.to === 'function') {
    io.to(`user_${userId}`).emit(event, data);
  }
};

export const emitBroadcast = (
  io: SocketIOServer | any,
  event: string,
  data: any
) => {
  if (io && typeof io.emit === 'function') {
    io.emit(event, data);
  }
};
