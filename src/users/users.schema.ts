import { Module } from '@nestjs/common';
import * as mongoose from 'mongoose';

export const UsersSchema = new mongoose.Schema({
    userId: String,
    avatarHash: String,
});