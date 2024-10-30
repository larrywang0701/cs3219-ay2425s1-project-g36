import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

if (!process.env.COLLABORATION_SERVICE_MONGODB_URI) {
    throw new Error(
        "COLLABORATION_SERVICE_MONGODB_URI is not defined in the environment variables"
    );
}

export const WEBSOCKET_PORT = 3001;
export const COLLABORATION_SERVICE_PORT = 3002
export const FRONTEND_PORT = 5173;
export const COLLABORATION_SERVICE_MONGODB_URI = process.env.COLLABORATION_SERVICE_MONGODB_URI;
