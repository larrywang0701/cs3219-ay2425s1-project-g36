import { Request, Response } from "express";
import { User, hasCommonDifficulties } from "../model/User";
import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: 'matching-service',
    brokers: ['localhost:9092'], // TODO: add to env variables
});

// Consumer related functions
const consumer = kafka.consumer({ groupId: "matching-service-group" });

let waitingUsers: User[] = []; //TODO: use queue model

/**
 * Searches queue for a matching user
 * @param user topics, difficulties, and user token
 */
const findMatchingUser = (newUser: User): User | null => {
    for (let i = 0; i < waitingUsers.length; i++) {
        const user = waitingUsers[i];

        if (!hasCommonDifficulties(newUser, user)) {
            continue; 
        }

        if (newUser.topics.some(topic => waitingUsers[i].topics.includes(topic))) {
            return waitingUsers.splice(i, 1)[0]; //remove waiting user from waiting list
        }
    }
    return null;
}

/**
 * Listens to the queue for matching users
 */
export const startMatching = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: "matching-topic", fromBeginning: true });

    let isUserMatched = false;

    await consumer.run({
        eachMessage: async ({ message }) => {
            const newUser: User = JSON.parse(message.value!.toString());

            if (isUserMatched) {
                console.log(`User ${newUser.userToken} is already matched`);
                await consumer.disconnect();
                return;
            }
            
            const matchedUser = findMatchingUser(newUser);

            if (matchedUser) {
                console.log(`Matched user ${newUser.userToken} with ${matchedUser.userToken}`);
                isUserMatched = true;

                //TODO: notify matched users

                // remove matched user from waiting list
                waitingUsers = waitingUsers.filter(user => user.userToken !== matchedUser.userToken);
                await consumer.disconnect();
            } else {
                waitingUsers.push(newUser);
                console.log(`User ${newUser.userToken} added to waiting list`);
            }
        }
    });
}




// Producer related functions

/**
 * Send a user selection message to the user-selection topic
 * @param user Topics, difficulties, and user token
 */
export const startQueueing = async (user: User) => {
    const producer = kafka.producer();
    await producer.connect();
    await producer.send({
        topic: 'user-selection',
        messages: [
            { key: user.userToken, value: JSON.stringify(user) },
        ],
    });
    await producer.disconnect();
}

export const searchForMatch = async (req : Request, res : Response) => {
}