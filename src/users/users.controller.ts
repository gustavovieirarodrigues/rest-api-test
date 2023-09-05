import { Controller, Post, Get, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
    constructor(private readonly usersService: UsersService){} 

    @Post()
    async create(){
        await this.usersService.create();
    }
    
    @Get(':userId')
    async getUser(@Param('userId') userId: string){
        return await this.usersService.getUser(userId);
    }

    @Get(':userId/avatar')
    async getAvatar(@Param('userId') userId: string){
        return await this.usersService.getAvatar(userId);
    }

    @Delete(':userId/avatar')
    async deleteAvatar(@Param('userId') userId: string){
        await this.usersService.deleteAvatar(userId);
    }
}
