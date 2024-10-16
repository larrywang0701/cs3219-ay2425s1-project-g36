import {Kafka} from 'kafkajs';
import { User } from '../model/User';

const kafka = new Kafka({
    clientId: 'matching-service',
    brokers: ['localhost:9092'], // TODO: add to env variables
  });

const producer = kafka.producer();

// question: rename user as userselection? will need to remove user id

/**
 * Send a user selection message to the user-selection topic
 * @param user Topics, difficulties, and user token
 */
const sendUserSelection = async (user: User) => {
    await producer.connect();
    await producer.send({
        topic: 'user-selection',
        messages: [
            { key: user.userToken, value: JSON.stringify(user) },
        ],
    });
    await producer.disconnect();
}

export { sendUserSelection };

  