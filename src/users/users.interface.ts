import { Document } from "mongoose";


export interface Users extends Document {
    userId: string;
    avatarHash: string;
}
