import { Request, Response } from "express";
import { User } from "../model/User";
import { sendUserSelection } from "../queues/kafkaProducer";

/**
 * Start matching for a user
 * @param req The request
 * @param rsp The response
 */
export const startMatching = async (req : Request, res : Response) => {
    const data = req.body;
    const user : User = {
        ...data,
        isReady: false,
        matchedUser: null
    }
    try {
        await sendUserSelection(user);

        res.status(200).send({message: "User added to queue for matching"});
    }
    catch(error) {
        res.status(500).send({message: "Failed to add user to queue for matching"});
    }
}