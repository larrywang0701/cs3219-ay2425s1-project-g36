import { Router, Request, Response } from "express";
import matchingManagerInstance from "../model/queueManager";
import { startMatching, startQueueing } from "../controllers/matchingController";


const router = Router();

/**
 * When user starts matching, add user to the queue and search for a match
 */
router.post("/start_matching", async (req : Request, res : Response) => {
    const data = req.body;
    const user = {
        ...data,
        isReady: false,
        matchedUser: null
    }
    
    try {
        // Send the new user to the Kafka topic
        await startQueueing(user);

        return res.status(200).send({message: "User added to queue for matching"});
    }
    catch(error) {
        console.error("Error when trying to match:" + error);
        return res.status(500).send({message: "Failed to add user to queue for matching"});
    }
});

/**
 * Confirm the match between both users
 */
router.post("/confirm_match", async (req : Request, res : Response) => {
});

/**
 * Check the state of the user
 */
router.post("/check_state", async (req : Request, rsp : Response) => {
    try {
        const { userToken } = req.body;
        if(!matchingManagerInstance.isUserInMatchingService(userToken)) {
            return rsp.status(400).send({message: "This user does not exist in the matching service."});
        }
        let isUserMatched = matchingManagerInstance.isUserMatched(userToken);
        if(!isUserMatched) {
            isUserMatched = matchingManagerInstance.tryMatchWith(userToken);
        }
        if(isUserMatched) {
            return rsp.status(200).send({message: "match found"});
        }
        return rsp.status(200).send({message: "matching"});
    }
    catch(error : any) {
        return rsp.status(500).send({message : error.message});
    }
});

// TODO: follow the current implementation using kafka
router.post("/cancel", async (req : Request, rsp : Response) => {
    try {
        const { userToken } = req.body;
        matchingManagerInstance.removeUser(userToken);
        return rsp.status(200).send({message: "success"});
    }
    catch(error : any) {
        return rsp.status(500).send({message : error.message});
    }
});

export default router;