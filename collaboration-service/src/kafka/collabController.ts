import { Kafka } from "kafkajs"
import userStore from '../utils/userStore'

const kafka = new Kafka({
    clientId: 'collaboration-service',
    brokers: ['kafka:9092'], 
    retry: {
        retries: 10,           
        initialRetryTime: 300,  
        factor: 2,             
    },
});

const consumer = kafka.consumer({ groupId: "collaboration-service-group" });

// This function is called in server.ts whenever collaboration-service runs
// Listens to a '2 users have matched' event. Update userStore
export const listenToMatchingService = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: "collaboration", fromBeginning: true });
    console.log('collab-service has subscribed to collaboration topic')

    await consumer.run({
        eachMessage: async ({ message } : { message : any }) => {
            const _ = message.key.toString() // key is not really needed
            const body = JSON.parse(message.value.toString())

            const user1_id = body.user1_id
            const user2_id = body.user2_id
            const roomId = body.roomId

            // TODO: based on the topics and difficulties, query database and retrieve a question
            const question_topics = body.question_topics
            const question_difficulties = body.question_difficulties
            
            // TODO: put in the selected question id
            const selectedQuestionId = 49 // dummy value, to be changed

            // at this point, update the user store, which is a local data structure
            userStore.addUser(user1_id, {
                userId : user1_id,
                matchedUserId: user2_id,
                roomId: roomId,
                questionId: selectedQuestionId
            })
            userStore.addUser(user2_id, {
                userId : user2_id,
                matchedUserId: user1_id,
                roomId: roomId,
                questionId: selectedQuestionId
            })
            
            // nice way to view the contents of user store
            console.log("printing contents of user store")
            userStore.printContents()
        }
    })
}