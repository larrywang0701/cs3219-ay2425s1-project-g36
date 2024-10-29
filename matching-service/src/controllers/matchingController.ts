import { User, hasCommonDifficulties } from "../model/user";
import { Kafka } from "kafkajs";
import { Queue } from "../model/queue";
import userStore from "../utils/userStore";
import { v4 as uuidv4 } from 'uuid'
import { findCommonDifficulties, findCommonTopics } from "../model/user";

const kafka = new Kafka({
    clientId: 'matching-service',
    brokers: ['kafka:9092'], // TODO: add to env variables
    retry: {
        retries: 10,           // Increase the number of retries
        initialRetryTime: 300,  // Increase initial retry time
        factor: 2,             // Exponential backoff
    },
});


// Consumer related functions
const consumer = kafka.consumer({ groupId: "matching-service-group" });

const TIMEOUT_DURATION = 60000; // Timeout set for 1 minute
const CONFIRMATION_DURATION = 10000; // Confirmation timeout set for 10 seconds

/**
 * Find a matching user (among previous users) for a new user based on their topics and difficulties
 * 
 * @param newUser The new user
 * @param waitingQueue The queue of waiting users
 * @returns The matching user or null if no match is found
 */
const findMatchingUser = (newUser: User, waitingQueue: Queue): User | null => {
    // Start from the back
    for (let i = 0; i < waitingQueue.count(); i++) {
        const user = waitingQueue.peek(i);

        // Avoid matching with itself
        if (newUser.id === user.id) {
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
 * Else, adds the new user to the waiting queue. User waits for a match until the timeout 
 * and is notified if no match is found.
 */
export const startMatching = async () => {

    await consumer.connect();
    await consumer.subscribe({ topic: "user-matching", fromBeginning: true });
    const waitingQueue = new Queue();
    console.log("Queue status: ", waitingQueue.getUserEmails());

    await consumer.run({
        eachMessage: async ({ message } : { message : any }) => {
            const key = message.key!.toString();
            const value = message.value!.toString();

            console.log(`Received message from User: ${key}`);

            // Check if it is a tombstone message
            if (value === 'cancel') {
                //Remove user from waiting queue if inside
                if (waitingQueue.isUserInQueue(key)) {
                    const user = userStore.getUser(key)!;
                    clearTimeout(user.timeout!);
                    waitingQueue.removeUser(user);
                    userStore.removeUser(key);
                    // User email cannot be logged here as the user object is removed from the store
                    console.log(`User ${user.email} has been removed from the queue.`);
                    console.log("Queue status: ", waitingQueue.getUserEmails());
                }
                return;
            }

            // Get user object from the store
            const newUser = userStore.getUser(key);
            if (!newUser) {
                console.log(`User ${key} not found in the user store.`);
                // sendMatchResult(value, 'declined');
                return;
            }
            console.log('User ID: ', newUser.id, '. User Email: ', newUser.email);
            console.log(`User ${newUser.email} is ready to be matched.`);

            const timeout = setTimeout(() => {
                if (newUser.matchedUser === null) {
                    console.log(`User ${newUser.email} has timed out and will be removed from the queue.`);
                    waitingQueue.removeUser(newUser); // Remove user from the queue
                    userStore.removeUser(newUser.id); // Remove user from the store
                    console.log("Queue status: ", waitingQueue.getUserEmails());

                }
            }, TIMEOUT_DURATION);

            // Set timeout for the user to be able to clear it later
            newUser.timeout = timeout;

            // Search for a matching user in the queue, starting from the oldest user
            // TODO: specify type of queue used
            const matchedUser = findMatchingUser(newUser, waitingQueue); 

            if (matchedUser) {
                console.log(`Matched user ${matchedUser.email} with ${newUser.email}`);

                // Update matched user fields
                matchedUser.matchedUser = newUser;
                newUser.matchedUser = matchedUser;

                const roomId = uuidv4() // give both users a room Id to collaborate 
                const question_topics = findCommonTopics(newUser, matchedUser)
                const question_difficulties = findCommonDifficulties(newUser, matchedUser)

                // matching-service sends information to collab-service using kafka 
                await sendCollaborationMessage(newUser.id, matchedUser.id, roomId, question_topics, question_difficulties)

                // Clear timeout for both users
                clearTimeout(newUser.timeout);
                if (matchedUser.timeout) {
                    clearTimeout(matchedUser.timeout);
                }

                /*
                // Add new timeout for confirmation
                const confirmationTimeout = setTimeout(() => {
                    if (!newUser.isPeerReady || !matchedUser.isPeerReady) {
                        console.log("Match declined due to timeout.");
                        
                        // // Notify that the confirmation has timed out
                        // sendConfirmationResult(newUser.userToken, 'timeout');
                        // sendConfirmationResult(matchedUser.userToken, 'timeout');

                        // Remove matched user field from both users
                        newUser.matchedUser = null;
                        matchedUser.matchedUser = null;
                    }
                }, CONFIRMATION_DURATION);

                // Update timeout for both users
                newUser.timeout = confirmationTimeout;
                matchedUser.timeout = confirmationTimeout;
                */

                // Remove matched user from the queue
                waitingQueue.removeUser(matchedUser); 
                console.log("Remove matched user from queue: User ", matchedUser.email);
                console.log("Queue status: ", waitingQueue.getUserEmails());


                // Notify both users that a match has been found
                // sendMatchResult(newUser.userToken, 'matched');
                // sendMatchResult(matchedUser.userToken, 'matched');
            } else { 
                // Add user to the waiting queue
                waitingQueue.push(newUser);
                console.log(`User ${newUser.email} added to waiting list`);
                console.log("Queue status: ", waitingQueue.getUserEmails());
            }
        }
    });
    
}


// /**
//  * Listens to the match-result topic for match outcomes and notifies the user
//  * 
//  * @param userToken The token of the user
//  * @param onResult Callback function to handle the result of the matching process
//  */
// export const listenForMatchResult = async (
//     userToken: string, 
//     onResult: (result: 'matched' | 'timeout') 
// => void) => {
//     const kafka = new Kafka({ brokers: ['kafka:9092'] });
//     const consumer = kafka.consumer({ groupId: userToken });

//     await consumer.connect();
//     await consumer.subscribe({ topic: 'match-result', fromBeginning: false });

//     await consumer.run({
//         eachMessage: async ({ message }) => {
//             const receivedKey = message.key?.toString();
//             const receivedValue = message.value?.toString();

//             if (receivedKey === userToken) {
//                 const result = receivedValue;

//                 if (result === 'matched') {
//                     onResult('matched');
//                 } else {
//                     onResult('timeout');
//                 }
//             }
//         }
//     });
// }

// /**
//  * Listens to the user-confirmation topic for user confirmations and handles confirmed matches.
//  * If the users are not supposed to be matched, the match is declined.
//  * If the users are matched, they are notified that the match has been confirmed.
//  * If the users are not ready in time, the match is timed out.
//  * If the other user is not ready, the user waits for the other user to confirm.
//  */
// export const startConfirmation = async () => {
//     await consumer.connect();
//     await consumer.subscribe({ topic: 'user-confirmation', fromBeginning: true });

//     await consumer.run({
//         eachMessage: async ({ message }) => {

//             const key = message.key!.toString();
//             const value = message.value!.toString();

//             const user = userStore.getUser(key);
//             const matchedUser = userStore.getUser(value);
//             if (!user || !matchedUser) {
//                 console.log(`User ${key} or matched user ${value} not found in the user store.`);
//                 sendConfirmationResult(key, 'declined');
//                 return;
//             }

//             // Check if they are each other's matched user
//             if (user.matchedUser === matchedUser && matchedUser.matchedUser === user) {

//                 // Since user is ready
//                 matchedUser.isPeerReady = true;

//                 // Check if matched user has confirmed
//                 if (user.isPeerReady) {
//                     console.log(`Both users have confirmed the match.`);

//                     // Clear the timeout for both users
//                     clearTimeout(user.timeout!);
//                     clearTimeout(matchedUser.timeout!);

//                     // Notify both users that the match has been confirmed
//                     sendConfirmationResult(user.userToken, 'confirmed');
//                     sendConfirmationResult(matchedUser.userToken, 'confirmed');
//                 } else {
//                     // Keep waiting
//                     console.log(`User ${user.userToken} has confirmed the match.`);
//                 }

//             } else {
//                 // Decline the match if the users are not supposed to be matched
//                 sendConfirmationResult(user.userToken, 'declined');
//                 sendConfirmationResult(matchedUser.userToken, 'declined');
//             }

//         }
//     });

// }


// /**
//  * Listens to the user-confirmation topic for user confirmations and notifies the user
//  * 
//  * @param userToken The token of the user
//  * @param onResult Callback function to handle the result of the confirmation process
//  */
// export const listenForConfirmationResult = async (
//     userToken: string, 
//     onResult: (result: 'confirmed' | 'declined' | 'timeout') => void
// ) => {
//     await consumer.connect();
//     await consumer.subscribe({ topic: 'confirmation-result', fromBeginning: false });

//     await consumer.run({
//         eachMessage: async ({ message }) => {
//             const receivedKey = message.key?.toString();
//             const receivedValue = message.value?.toString();

//             if (receivedKey === userToken) {
//                 const result = receivedValue;

//                 if (result === 'confirmed') {
//                     onResult('confirmed');
//                 } else if (result === 'declined') {
//                     onResult('declined');
//                 } else {
//                     onResult('timeout');
//                 }
//             }
//         }
//     });
// }




// Producer related functions
const producer = kafka.producer();

/**
 * Send a user selection message to the user-selection topic
 * 
 * @param user Topics, difficulties, and user token
 * @param isCancel Whether the user wants to stop matching, set to false by default
 */
export const sendQueueingMessage = async (id: string, isCancel: boolean = false) => {
    await producer.connect();
    if (isCancel) {
        console.log(`Sending User ${id} to the queue to cancel.`);
    } else {
        console.log(`Sending User ${id} to the queue.`);
    }
    await producer.send({
        topic: 'user-matching',
        messages: [
            { key: id, value: isCancel ? "cancel": "match" },
        ],
    });
    await producer.disconnect();
}

// send collaboration information to collab-service
export const sendCollaborationMessage = async (user1_id: string, user2_id: string, roomId: string, question_topics: string[], question_difficulties: string[]) => {
    if (user1_id === null || user2_id === null || roomId === null || question_topics.length === 0 || question_difficulties.length === 0) return
    
    await producer.connect()
    
    const message = JSON.stringify({
        user1_id,
        user2_id,
        roomId,
        question_topics,
        question_difficulties
    })

    await producer.send({
        topic: 'collaboration',
        messages: [
            { key: roomId, value: message },
        ],
    });

    await producer.disconnect();
}

// /**
//  * Send a match outcome to the match-result topic
//  * 
//  * @param userToken The token of the user
//  * @param result The result of the match
//  */
// const sendMatchResult = async (userToken: string, result: string) => {
//     await producer.connect();
//     await producer.send({
//         topic: 'match-result',
//         messages: [
//             { key: userToken, value: result },
//         ],
//     });
//     await producer.disconnect();
// }


// /**
//  * Send a user confirmation message to the user-confirmation topic
//  * 
//  * @param user The user
//  * @param matchedUser The matched user
//  */
// export const sendConfirmationMessage = async (userToken: string, matchedUserToken: string) => {
//     await producer.connect();
//     await producer.send({
//         topic: 'user-confirmation',
//         messages: [
//             { key: userToken, value: matchedUserToken },
//         ],
//     });
//     await producer.disconnect();
// }

// /**
//  * Send final match result to both users in the confirmation-result topic
//  * 
//  * @param userToken The token of the user
//  * @param result The result of the confirmation
//  */
// export const sendConfirmationResult = async (userToken: string, result: string) => {
//     await producer.connect();
//     await producer.send({
//         topic: 'confirmation-result',
//         messages: [
//             { key: userToken, value: result },
//         ],
//     });
//     await producer.disconnect(); 
// }