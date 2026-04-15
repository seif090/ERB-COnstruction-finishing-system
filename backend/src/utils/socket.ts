import { Server as SocketIOServer } from 'socket.io';

export const emitNotification = (
  io: SocketIOServer,
  userId: string,
  event: string,
  data: any
) => {
  io.to(`user_${userId}`).emit(event, data);
};

export const emitBroadcast = (
  io: SocketIOServer,
  event: string,
  data: any
) => {
  io.emit(event, data);
};
