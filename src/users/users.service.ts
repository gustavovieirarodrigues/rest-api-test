import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users } from './users.interface';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<Users> ,
        private readonly amqpConnection: AmqpConnection,
    ){}

    async create(){
        const user = new this.userModel();
        await user.save();
        //Send email and rabbitmq event
        this.amqpConnection.publish('user', 'create', user);
    }

    async getUser(userId: string){
        const response = await axios.get(`https://reqres.in/api/users/${userId}`);
        return response.data;
    }

    async getAvatar(userId: string){
        const user = await this.userModel.findOne({userId});
        if(user && user.avatarHash){
            const filePath = path.join(__dirname, '..', '..', 'uploads', user.avatarHash);
            const fileBuffer = fs.readFileSync(filePath);
            return fileBuffer.toString('base64');
        } else {
            const response = await axios.get(`https://reqres.in/api/users/${userId}`);
            const avatarUrl = response.data.data.avatar;
            const avatarResponse = await axios.get(avatarUrl, {responseType: 'arraybuffer'});
            const avatarBuffer = Buffer.from(avatarResponse.data, 'binary');
            const hash = crypto.createHash('md5').update(avatarBuffer).digest('hex');
            const filePath = path.join(__dirname, '..', '..', 'uploads', hash);
            fs.writeFileSync(filePath, avatarBuffer);

            if(user){
                user.avatarHash = hash;
                await user.save();
            } else {
                const newUser = new this.userModel({userId, avatarHash: hash});
                await newUser.save();
            }
            return avatarBuffer.toString('base64');

        }

    }

    async deleteAvatar(userId: string){
        const user = await this.userModel.findOne({userId});
        if(user && user.avatarHash){
            const filePath = path.join(__dirname, '..', '..', 'uploads', user.avatarHash);
            fs.unlinkSync(filePath);
            user.avatarHash = null;
            await user.save();
        }

    }
}


