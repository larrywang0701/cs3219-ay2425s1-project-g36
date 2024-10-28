import mongoose, { Document, Schema } from "mongoose";

export interface DocumentType extends mongoose.Document {
    _id: string;
    data: object;
}

const documentSchema: Schema<DocumentType> = new Schema({
    _id: { 
        type: String,
        required: true
    },
    data: { 
        type: Object,
        required: true 
    }
});

export const DocumentModel = mongoose.model<DocumentType>("Document", documentSchema)