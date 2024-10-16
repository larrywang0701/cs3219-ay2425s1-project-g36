import { Kafka } from "kafkajs";
import { User, hasCommonDifficulties } from "../model/users";

const kafka = new Kafka({
  clientId: "matching-service",
  brokers: ["localhost:9092"], // TODO: add to env variables
});

const consumer = kafka.consumer({ groupId: "matching-service-group" });

let waitingUsers: User[] = []; //TODO: use queue model



