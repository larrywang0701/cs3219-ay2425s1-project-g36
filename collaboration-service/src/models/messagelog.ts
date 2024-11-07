// import mongoose, { Document, Schema } from "mongoose";

export type ChatMessage = {
    userToken: string,
    message: string,
}

// interface MessageType {
//     user: string;
//     role: "system" | "user" | "assistant";
//     content: string;
// }

// const messageSchema = new mongoose.Schema({
//     user: { type: String, required: true },
//     role: { type: String, enum: ["system", "user", "assistant"], required: true },
//     content: { type: String, required: true }
// });

// export interface MessageLogType extends mongoose.Document {
//     _id: string;
//     user1: string;
//     user2: string;
//     data: MessageType[];
// }

// const messageLogSchema = new Schema({
//     _id: { 
//         type: String,
//         required: true
//     },
//     user1: {
//         type: String,
//         required: true
//     },
//     user2: {
//         type: String,
//         required: true
//     },
//     data: { 
//         type: [messageSchema],
//         required: true 
//     }
// });

// export const MessageLogModel = mongoose.model<DocumentType>("MessageLog", messageLogSchema)