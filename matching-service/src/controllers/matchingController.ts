import { User, hasCommonDifficulties } from "../model/user";
import { Kafka } from "kafkajs";
import queueManagerInstance from "../model/queueManager";
import { on } from "events";

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
const findMatchingUser = (newUser: User): User | null => {
    // Start from the back
    for (let i = queueManagerInstance.length() - 1; i >= 0; i--) {
        const user = queueManagerInstance.getIndex(i);

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
export const startMatching = async (
    user: User, 
    onResult: (result: 'match_found' | 'timeout') => void
) => {

    await consumer.connect();
    await consumer.subscribe({ topic: "user-selection", fromBeginning: true });

    // Set a timeout to handle cases where no match is found within the time limit
    const timeout = setTimeout(() => {
        if (queueManagerInstance.isUserMatched(user.userToken)) {
            console.log(`No match found for user ${user.userToken} due to timeout.`);
            queueManagerInstance.removeUserFromMatching(user.userToken);
            onResult('timeout');
        }
    }, TIMEOUT_DURATION);

    // Check if user is already matched
    if (queueManagerInstance.isUserMatched(user.userToken)) {
        onResult('match_found');
    }

    await consumer.run({
        eachMessage: async ({ message }) => {
            const newUser: User = JSON.parse(message.value!.toString());

            // Everytime a new message is received, add the user to the queue
            newUser.timestamp = Date.now();
            queueManagerInstance.push(newUser);

            // Avoid matching the user with themselves
            if (user.userToken === newUser.userToken) {
                return;
            }

            // Check if user is already matched
            // CHECK: is this necessary? my thoughts: user sends message before listening: 
            // there may be a case where the user is matched before listening, but then this would mean that there would be a bug
            // where there are 2 users in the matching queue but confirmation is only sent to one user as
            // this if statement is only triggered when the next user sends a matching message
            // So do i place this before running the consumer ?
            if (queueManagerInstance.isUserMatched(user.userToken)) {
                onResult('match_found');
            }

            // Search for a matching user in the queue
            const matchedUser = findMatchingUser(user);

            if (matchedUser) {
                console.log(`Matched user ${matchedUser.userToken} with ${user.userToken}`);

                // Move users from confirmation queue to matched queue to prevent further matching
                queueManagerInstance.matchTwoUsersTogether(newUser, user);

                clearTimeout(timeout);
                // Notify that a match has been found
                onResult('match_found');
            } else { 
                // User is already added when the message is first received
                console.log(`User ${newUser.userToken} added to waiting list`);
            }
            // }
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
    onResult: (result: 'confirmed' | 'declined' | 'timeout') => void
) => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'user-confirmation', fromBeginning: false });

    const timeout = setTimeout(() => {
        if (!queueManagerInstance.isReady(userToken1) || !queueManagerInstance.isReady(userToken2)) {
            console.log("Match declined due to timeout.");
            // Notify that the confirmation has timed out
            onResult('timeout');
        }
    }, CONFIRMATION_DURATION);

    await consumer.run({
        eachMessage: async ({ message }) => {
            const { userToken, action } = JSON.parse(message.value!.toString());

            if (action === 'confirm') {
                // Set the user as ready
                queueManagerInstance.setReady(userToken);
                console.log(`User ${userToken} has confirmed the match.`);

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
export const sendMatchResult = async (userToken1: string, userToken2: string, result: string) => {
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