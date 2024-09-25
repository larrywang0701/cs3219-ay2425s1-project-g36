import dotenv from 'dotenv';

dotenv.config({ path:'./.env' });

if (!process.env.MONGO_URI) {
    throw new Error('USER_SERVICE_MONGODB_URL is not defined in the environment variables');
}

export const PORT: string | number = process.env.PORT || 4000;
export const USER_SERVICE_MONGO_URI = process.env.MONGO_URI;