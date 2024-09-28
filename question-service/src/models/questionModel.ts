import mongoose, { Document } from "mongoose"
const AutoIncrement = require('mongoose-sequence')(mongoose);

interface IQuestion extends Document {
    title: string
    difficulty: 'easy' | 'medium' | 'hard'
    topics?: string[]
    description: string
}

const questionSchema = new mongoose.Schema(
    {
        _id: {
            type: Number,
        },
        title: {
            type: String,
            required: true,
        },
        difficulty: {
            type: String,
            required: true,
            enum: ['easy', 'medium', 'hard']
        },
        topics: {
            type: [String],
            required: false,
        },
        description: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        id_: false,
    }
)

questionSchema.plugin(AutoIncrement);
export const Question = mongoose.model<IQuestion>('Question', questionSchema)