import express from "express";
import cors from "cors";
import { FRONTEND_ADDRESS, PORT } from "./config";
import MatchingRoute from "./routes/routes";
import { startMatching } from "./controllers/matchingController";

const app = express();

app.use(express.json());

const corsOptions = {
    origin: FRONTEND_ADDRESS
}
app.use(cors(corsOptions));

app.use("/matching", MatchingRoute);

// Start the consumer to listen to the Kafka topic
startMatching();

app.listen(PORT, () => {
    console.log(`Server started. Port = ${PORT}`);
})

