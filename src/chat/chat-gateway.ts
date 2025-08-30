import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { DatabaseService } from 'src/database/database.service';

@WebSocketGateway(3002, { cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private prisma: DatabaseService) {}

 
  async handleConnection(client: Socket) {
    try {
      
      
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZmZhZjY1My05NDJjLTQ2ZDQtYjI3Yi1lYjFjYzcyOWNjODEiLCJlbWFpbCI6Im1haGRpQGdtYWlsLmNvbSIsImlhdCI6MTc1NjU4MDAzNiwiZXhwIjoxNzU2NTgzNjM2fQ.fYZjIyVKOwjphJ9Sswd5GuNmxpbuuZhW9RNwDH0dxSY"
        // client.handshake.auth?.token ||
        // client.handshake.headers['authorization']?.split(' ')[1];

        // console.log(token);
      if (!token) {
        client.disconnect();
        return;
      }

      const payload: any = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY');
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      
      if (!user) {
        client.disconnect();
        return;
      }

      client.data.user = user;

      
      client.join(`user_${user.id}`);
      console.log(`✅ User connected: ${user.email}`);
    } catch (e) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    console.log(`❌ User disconnected: ${client.data?.user?.email}`);
  }


  @SubscribeMessage('sendGroupMessage')
  async handleGroupMessage(
    @MessageBody() { groupId, text }: { groupId: string; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    const sender = client.data.user;
    if (!sender) return;

   
    const member = await this.prisma.groupMember.findFirst({
      where: { userId: sender.id, groupId },
    });
    if (!member) {
      client.emit('error', { message: 'شما عضو این گروه نیستید' });
      return;
    }

   
    const message = await this.prisma.message.create({
      data: { text, senderId: sender.id, groupId },
    });

   
    this.server.to(`group_${groupId}`).emit('newGroupMessage', {
      id: message.id,
      text: message.text,
      sender: { id: sender.id, email: sender.email },
      groupId,
      createdAt: message.createdAt,
    });
  }


 
  @SubscribeMessage('joinGroup')
async handleJoinGroup(
  @MessageBody() { groupId }: { groupId: string },
  @ConnectedSocket() client: Socket,
) {
  
  
  
  const user = client.data.user;
  if (!user) return;
  
  const member = await this.prisma.groupMember.findFirst({
    where: { userId: user.id, groupId },
  });
  console.log(member);
  
  
  if (!member) {
    client.emit('error', { message: 'شما عضو این گروه نیستید' });
    return;
  }
  console.log('📌 groupId:', groupId);

  client.join(`group_${groupId}`);
  client.emit('joinedGroup', { groupId });
  console.log(`👥 ${user.email} joined group ${groupId}`);
}


  
  @SubscribeMessage('sendPrivateMessage')
  async handlePrivateMessage(
    @MessageBody() { receiverId, text }: { receiverId: string; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    const sender = client.data.user;
    if (!sender) return;

   
    const message = await this.prisma.message.create({
      data: { text, senderId: sender.id, receiverId },
    });

   
    this.server.to(`user_${receiverId}`).emit('newPrivateMessage', {
      id: message.id,
      text: message.text,
      sender: { id: sender.id, email: sender.email },
      receiverId,
      createdAt: message.createdAt,
    });

    
    client.emit('newPrivateMessage', {
      id: message.id,
      text: message.text,
      sender: { id: sender.id, email: sender.email },
      receiverId,
      createdAt: message.createdAt,
    });
  }
}
