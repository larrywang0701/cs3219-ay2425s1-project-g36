import { User, hasCommonDifficulties } from "../model/user";
import { Kafka } from "kafkajs";
import { notifyUsers } from "../websocket/websocketServer";
import queueManagerInstance from "../model/queueManager";

const kafka = new Kafka({
    clientId: 'matching-service',
    brokers: ['localhost:9092'], // TODO: add to env variables
});


// Consumer related functions
const consumer = kafka.consumer({ groupId: "matching-service-group" });

const waitingQueue = queueManagerInstance;
const TIMEOUT_DURATION = 60000; // Timeout set for 1 minute
const CONFIRMATION_DURATION = 5000; // Confirmation timeout set for 10 seconds

/**
 * Searches current waiting queue for a matching user
 * @param user topics, difficulties, and user token
 * @returns the matched user if found, otherwise null
 */
const findMatchingUser = (newUser: User): User | null => {
    for (let i = 0; i < waitingQueue.length(); i++) {
        const user = waitingQueue.getIndex(i);

        // Avoid matching with itself
        if (newUser.userToken === user.userToken) {
            continue;
        }

        if (!hasCommonDifficulties(newUser, user)) {
            continue; 
        }

        if (newUser.topics.some(topic => user.topics.includes(topic))) {
            return user; 
        }
    }
    return null;
}

/**
 * Checks if a user in the waiting list has timed out. 
 * Removes user from the waiting queue if they have timed out.
 */
const checkTimeout = () => {
    const currentTime = Date.now();
    const timedOutUsers: User[] = [];

    for (let i = 0; i < waitingQueue.length(); i++) {
        const user = waitingQueue.getIndex(i);
        if (currentTime - user.timestamp >= TIMEOUT_DURATION) {
            timedOutUsers.push(user);
            waitingQueue.removeUser(user.userToken); // Remove them from the queue
        }
    }

    // Notify users who have timed out
    for (const user of timedOutUsers) {
        console.log(`User ${user.userToken} has timed out and will be removed from the waiting list.`);
        // TODO: Implement notification logic for timed out users
    }
}

/**
 * Listens to the queue for new users. When a match is found, both users are notified.
 * Else, adds the new user to the waiting queue.
 */
export const startMatching = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: "user-selection", fromBeginning: true });

    let isUserMatched = false;

    await consumer.run({
        eachMessage: async ({ message }) => {
            const newUser: User = JSON.parse(message.value!.toString());

            checkTimeout();

            const matchedUser = findMatchingUser(newUser);

            if (matchedUser) {
                console.log(`Matched user ${newUser.userToken} with ${matchedUser.userToken}`);
                isUserMatched = true;

                //TODO: notify both matched users by sending a message to the user-confirmation topic
                notifyUsers(newUser.userToken, matchedUser.userToken);

                // Remove matched user from waiting list
                waitingQueue.removeUser(matchedUser.userToken);
                // await consumer.disconnect();
            } else { 
                newUser.timestamp = Date.now();
                waitingQueue.push(newUser);
                console.log(`User ${newUser.userToken} added to waiting list`);
            }
            // }
        }
    });
}





// Producer related functions
const producer = kafka.producer();

/**
 * Send a user selection message to the user-selection topic
 * @param user Topics, difficulties, and user token
 */
export const startQueueing = async (user: User) => {
    await producer.connect();
    await producer.send({
        topic: 'user-selection',
        messages: [
            { key: user.userToken, value: JSON.stringify(user) },
        ],
    });
    await producer.disconnect();
}

/**
 * Send a user confirmation message to the user-confirmation topic
 * @param userToken1 The token of the first user
 * @param userToken2 The token of the second user
 */
const confirmMatch = async (userToken1: string, userToken2: string) => {
    await producer.connect();
    await producer.send({
        topic: 'user-confirmation',
        messages: [
            { key: userToken1, value: "confirm" },
            { key: userToken2, value: "confirm" },
        ],
    });
    await producer.disconnect();
}