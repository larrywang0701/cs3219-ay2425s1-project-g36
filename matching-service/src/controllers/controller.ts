import { MatchingQueue } from "../model/queue";
import { User, hasCommonDifficulties } from "../model/users";
import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: 'matching-service',
    brokers: ['localhost:9092'], // TODO: add to env variables
});

// Consumer related functions
const consumer = kafka.consumer({ groupId: "matching-service-group" });

let waitingUsers: User[] = []; //TODO: use queue model
const waitingQueue = new MatchingQueue();
const TIMEOUT_DURATION = 60000; // Timeout set for 1 minute

/**
 * Searches queue for a matching user
 * @param user topics, difficulties, and user token
 */
const findMatchingUser = (newUser: User): User | null => {
    for (let i = 0; i < waitingQueue.count(); i++) {
        const user = waitingQueue.peek(i);

        // Avoid matching with itself
        if (newUser.userToken === user.userToken) {
            continue;
        }

        if (!hasCommonDifficulties(newUser, user)) {
            continue; 
        }

        if (newUser.topics.some(topic => waitingUsers[i].topics.includes(topic))) {
            return user; 
        }
    }
    return null;
}

/**
 * Checks if a user in the waiting list has timed out
 */
const checkTimeout = () => {
    const currentTime = Date.now();
    const timedOutUsers: User[] = [];

    for (let i = 0; i < waitingQueue.count(); i++) {
        const user = waitingQueue.peek(i);
        if (currentTime - user.timestamp >= TIMEOUT_DURATION) {
            timedOutUsers.push(user);
            waitingQueue.removeUser(user); // Remove them from the queue
        }
    }

    // Notify users who have timed out
    for (const user of timedOutUsers) {
        console.log(`User ${user.userToken} has timed out and will be removed from the waiting list.`);
        // TODO: Implement notification logic for timed out users
    }
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

            checkTimeout();

            if (isUserMatched) {
                console.log(`User ${newUser.userToken} is already matched`);
                await consumer.disconnect();
                return;
            }

            if (waitingQueue.isEmpty()) {
                waitingQueue.push(newUser);
                console.log(`User ${newUser.userToken} added to waiting list`);
            } else {
                const matchedUser = findMatchingUser(newUser);

                if (matchedUser) {
                    console.log(`Matched user ${newUser.userToken} with ${matchedUser.userToken}`);
                    isUserMatched = true;

                    //TODO: notify both matched users

                    // Remove matched user from waiting list
                    waitingQueue.removeUser(matchedUser);
                    await consumer.disconnect();
                } else {
                    newUser.timestamp = Date.now();
                    waitingUsers.push(newUser);
                    console.log(`User ${newUser.userToken} added to waiting list`);
                }
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
