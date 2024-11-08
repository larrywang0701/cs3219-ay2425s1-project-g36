import mongoose, { Document } from "mongoose"

interface IHistory extends Document {
    timeSubmitted: Date
    questionTitle: string
    questionId: number
    language: string
    code: string
    runtime: string
    status: string
    // Add more fields as needed
}

const historySchema = new mongoose.Schema(
    {
        timeSubmitted: {
            type: Date,
            default: Date.now, // Setting default to the current date/time
            required: true,
        },
        questionTitle: {
            type: String,
            required: true,
        },
        questionId: {
            type: Number,
            required: true,
        },
        language: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            required: true,
        },
        runtime: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)
const History = mongoose.model<IHistory>('History', historySchema)
export { historySchema };
export default History;