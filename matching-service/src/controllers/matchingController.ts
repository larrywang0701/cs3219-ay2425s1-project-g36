import { User, hasCommonDifficulties } from "../model/user";
import { Kafka } from "kafkajs";
import queueManagerInstance from "../model/queueManager";
import { Queue } from "../model/queue";

const kafka = new Kafka({
    clientId: 'matching-service',
    brokers: ['localhost:9092'], // TODO: add to env variables
});


// Consumer related functions
const consumer = kafka.consumer({ groupId: "matching-service-group" });

const TIMEOUT_DURATION = 60000; // Timeout set for 1 minute
const CONFIRMATION_DURATION = 5000; // Confirmation timeout set for 10 seconds

/**
 * Checks if two users have common difficulties and topics
 * @param newUser The new user
 * @param user The user in the queue
 * @returns The user if they have common difficulties and topics, else null
 */
const findMatchingUser = (newUser: User, waitingQueue: Queue): User | null => {
    // Start from the back
    for (let i = 0; i < waitingQueue.count(); i++) {
        const user = waitingQueue.peek(i);

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
 * Listens to the queue for new users. When a match is found, both users are notified.
 * Else, adds the new user to the waiting queue.
 * @param newUser Topics, difficulties, and user token
 * @param onResult Callback function to handle the result of the matching process
 */
export const startMatching = async () => {

    await consumer.connect();
    await consumer.subscribe({ topic: "user-selection", fromBeginning: true });
    const waitingQueue = new Queue();

    await consumer.run({
        eachMessage: async ({ message }) => {
            const newUser: User = JSON.parse(message.value!.toString());

            const timeout = setTimeout(() => {
                if (newUser.matchedUser === null) {
                    console.log(`User ${newUser.userToken} has timed out and will be removed from the queue.`);
                    waitingQueue.removeUser(newUser); // Remove user from the queue

                    // Send message to notify user that no match was found
                    sendMatchResult(newUser.userToken, 'timeout');
                }
            }, TIMEOUT_DURATION);

            newUser.timeout = timeout;

            // Search for a matching user in the queue, starting from the oldest user
            const matchedUser = findMatchingUser(newUser, waitingQueue); 


            if (matchedUser) {
                console.log(`Matched user ${matchedUser.userToken} with ${newUser.userToken}`);

                // Clear timeout for both users
                clearTimeout(newUser.timeout);
                if (matchedUser.timeout) {
                    clearTimeout(matchedUser.timeout);
                }

                // Notify both users that a match has been found
                sendMatchResult(newUser.userToken, 'matched');
                sendMatchResult(matchedUser.userToken, 'matched');
            } else { 
                waitingQueue.push(newUser);
                console.log(`User ${newUser.userToken} added to waiting list`);
            }
        }
    });
    
}


/**
 * Listens to the match-result topic for match outcomes and handles matched and timeout results
 * @param userToken The token of the user
 * @param onResult Callback function to handle the result of the matching process
 */
export const listenForMatchOutcome = async (
    userToken: string, 
    onResult: (result: 'matched' | 'timeout') 
=> void) => {
    
    await consumer.connect();
    await consumer.subscribe({ topic: 'match-result', fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const receivedKey = message.key?.toString();
            const receivedValue = message.value?.toString();

            if (receivedKey === userToken) {
                const result = receivedValue;

                if (result === 'matched') {
                    onResult('matched');
                } else {
                    onResult('timeout');
                }
            }
        }
    });
}


/**
 * Listens to the user-confirmation topic for user confirmations and handles confirmed matches
 * @param userToken1 The token of the first user
 * @param userToken2 The token of the second user
 * @param onResult Callback function to handle the result of the confirmation process
 */
export const startListeningForConfirmation = async (
    userToken1: string, 
    userToken2: string,
    onResult: (result: 'confirmed' | 'declined') => void
) => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'user-confirmation', fromBeginning: false });

    const timeout = setTimeout(() => {
        if (!queueManagerInstance.isReady(userToken1) || !queueManagerInstance.isReady(userToken2)) {
            console.log("Match declined due to timeout.");
            // Notify that the confirmation has timed out
            onResult('declined');
        }
    }, CONFIRMATION_DURATION);

    await consumer.run({
        eachMessage: async ({ message }) => {
            const { userToken, action } = JSON.parse(message.value!.toString());

            // need to check is the user token is from the matched user

            if (action === 'confirm') {
                // Set the user as ready
                queueManagerInstance.setReady(userToken);
                console.log(`User ${userToken} has confirmed the match.`);

                // how to wait for the other user to confirm

                if (queueManagerInstance.isReady(userToken1) && queueManagerInstance.isReady(userToken2)) {
                    clearTimeout(timeout);
                    console.log("Both users have confirmed the match.");

                    // Notify that the match has been confirmed
                    onResult('confirmed');

                    // Remove users from the confirmation queue
                    queueManagerInstance.removeUserFromConfirmation(userToken1);
                    queueManagerInstance.removeUserFromConfirmation(userToken2);
                }
            } else {
                console.log(`User ${userToken} declined the match.`);
                clearTimeout(timeout);
                // Notify that the match has been declined
                onResult('declined');
            }
        }
    });
}




// Producer related functions
const producer = kafka.producer();

/**
 * Send a user selection message to the user-selection topic
 * @param user Topics, difficulties, and user token
 */
export const sendQueueingMessage = async (user: User) => {
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
 * Send a match outcome to the match-result topic
 * @param userToken The token of the user
 * @param result The result of the match
 */
const sendMatchResult = async (userToken: string, result: string) => {
    await producer.connect();
    await producer.send({
        topic: 'match-result',
        messages: [
            { key: userToken, value: result },
        ],
    });
    await producer.disconnect();
}


/**
 * Send a user confirmation message to the user-confirmation topic
 * @param userToken1 The token of the first user
 * @param userToken2 The token of the second user
 */
export const sendConfirmationMessage = async (userToken: string) => {
    await producer.connect();
    await producer.send({
        topic: 'user-confirmation',
        messages: [
            { key: userToken, value: "confirm" },
        ],
    });
    await producer.disconnect();
}

/**
 * Send final match result to both users
 * @param userToken1 
 * @param userToken2 
 * @param result 
 */
export const sendConfirmationResult = async (userToken1: string, userToken2: string, result: string) => {
    await producer.connect();
    await producer.send({
        topic: 'match-result',
        messages: [
            { key: userToken1, value: result },
            { key: userToken2, value: result },
        ],
    });
    await producer.disconnect();
}