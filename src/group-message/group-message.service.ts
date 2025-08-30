import { Injectable } from '@nestjs/common';
import { CreateGroupMessageDto } from './dto/create-group-message.dto';
import { UpdateGroupMessageDto } from './dto/update-group-message.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class GroupMessageService {
  constructor(private readonly databaseService : DatabaseService) {}
  async create(createGroupMessageDto: CreateGroupMessageDto) {
    return await this.databaseService.groupMember.create({
      data : createGroupMessageDto
    });
  }

  async findAll() {
    return await this.databaseService.groupMember.findMany();
  }

  async findOne(id: string) {
    return await this.databaseService.groupMember.findFirst({
      where : { id }
    });
  }

  async update(id: string, updateGroupMessageDto: UpdateGroupMessageDto) {
    return await this.databaseService.groupMember.update({
      where : { id },
      data : updateGroupMessageDto
    });
  }

  async remove(id: string) {
    return await this.databaseService.groupMember.delete({
      where : { id }
    });
  }
}
