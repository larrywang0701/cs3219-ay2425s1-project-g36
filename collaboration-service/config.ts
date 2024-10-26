import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

if (!process.env.COLLABORATION_SERVICE_MONGODB_URI) {
    throw new Error(
        "COLLABORATION_SERVICE_MONGODB_URI is not defined in the environment variables"
    );
}

export const COLLABORATION_SERVICE_PORT = 3001;
export const COLLABORATION_SERVICE_MONGODB_URI = process.env.COLLABORATION_SERVICE_MONGODB_URI;
