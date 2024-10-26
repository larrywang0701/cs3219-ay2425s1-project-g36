import { Server } from "socket.io";
import mongoose from "mongoose";
import { DocumentModel, DocumentType } from './src/models/document'
import { COLLABORATION_SERVICE_PORT, COLLABORATION_SERVICE_MONGODB_URI } from './config'

const FRONTEND_PORT = 5173

mongoose
    .connect(COLLABORATION_SERVICE_MONGODB_URI)
    .then(() => {
        console.log('successfully connected to Collaboration-service mongodb')
    }).catch((error: unknown) => {
        console.error(error);
    })

const io = new Server(COLLABORATION_SERVICE_PORT, {
    cors: {
        origin: `http://localhost:${FRONTEND_PORT}`,
        methods: ["GET", "POST"],
    },
})

// runs when the collaboration page is loaded
io.on("connection", socket => {
    socket.on('get-document', async (documentId: string) => {
        const document = await findOrCreateDocument(documentId)
        if (document) {
            socket.join(documentId)
            socket.emit('load-document', document.data)

            socket.on('send-changes', (delta: object) => {
                // when server receives changes from client, server will emit changes to the document
                socket.broadcast.to(documentId).emit("receive-changes", delta)
            })

            socket.on('save-document', async data => {
                // after emitting changes, also need to update database
                await DocumentModel.findByIdAndUpdate(documentId, { data })
            })
        }
    })
})

console.log('Collaboration-service is up - Starting service')

async function findOrCreateDocument(id: string): Promise<DocumentType | null> {
    if (id == null) return null

    const document = await DocumentModel.findById(id)
    if (document) return document
    return await DocumentModel.create({
        _id: id,
        data: ""
    })
}