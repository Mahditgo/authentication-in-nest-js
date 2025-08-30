import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class GroupService {
  constructor(private readonly databaseService : DatabaseService) {}
  async create(createGroupDto: CreateGroupDto) {
    return await this.databaseService.group.create({
      data : createGroupDto
    });
  }

  async findAll() {
    return await this.databaseService.group.findMany();
  }

  async findOne(id: string) {
    return await this.databaseService.group.findUnique({
      where : { id }
    });
  }

  async update(id: string, updateGroupDto: UpdateGroupDto) {
    return await this.databaseService.group.update({
      where : { id },
      data : updateGroupDto
    });
  }

  async remove(id: string) {
    return await this.databaseService.group.delete({
      where : { id }
    });
  }
}
