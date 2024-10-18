import { Router, Request, Response } from "express";
import matchingManagerInstance from "../model/queueManager";
import { startListeningForConfirmation, startMatching, sendQueueingMessage, sendConfirmationMessage, listenForMatchOutcome} from "../controllers/matchingController";


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
        await sendQueueingMessage(user);

        // Listen to matching outcome
        await listenForMatchOutcome(user.userToken, (result) => {
            if (result === 'matched') {
                return res.status(200).send({message: "Match found"});

            } else if (result === 'timeout') {
                return res.status(200).send({message: "No match found due to timeout"});
            }
        });

        // By default, no match is found
        return res.status(200).send({message: "No match found"});
    }
    catch(error) {
        console.error("Error when trying to match:" + error);
        return res.status(500).send({message: "Failed to match user."});
    }
});

/**
 * Confirm the match between both users
 */
router.post("/confirm_match", async (req : Request, res : Response) => {
    const { userToken, action } = req.body;

    try {
        if (action === "confirm") {
            // Send the confirmation to the Kafka topic
            await sendConfirmationMessage(userToken);

            const matchedUser = matchingManagerInstance.getMatchedUser(userToken);
            if (matchedUser) {
                const matchedUserToken = matchedUser.userToken;
                await startListeningForConfirmation(userToken, matchedUserToken, (result) => {

                    // if (result === 'confirmed') {
                    //     sendMatchResult(userToken, matchedUserToken, 'confirmed');
                    //     return res.status(200).send({message: "Match confirmed"});

                    // } else if (result === 'declined') {
                    //     sendMatchResult(userToken, matchedUserToken, 'declined');
                    //     return res.status(200).send({message: "Match declined"});

                    // } else if (result === 'timeout') {
                    //     sendMatchResult(userToken, matchedUserToken, 'timeout');
                    //     return res.status(200).send({message: "Confirmation timed out"});
                    // }
                });
            }
            // Decline match by default
            return res.status(200).send({message: "Match declined"});

            
        } else {
            // If either user declines the match
            matchingManagerInstance.removeUserFromMatching(userToken);
            return res.status(200).send({message: "Match declined"});
        }
    } catch (error) {
        console.error("Error confirming match:", error);
        return res.status(500).send({ message: "Error confirming match." });
    }

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


router.post("/cancel", async (req : Request, rsp : Response) => {
    try {
        const { userToken } = req.body;
        matchingManagerInstance.removeUserFromMatching(userToken);
        return rsp.status(200).send({message: "User is removed from queue"});
    }
    catch(error : any) {
        return rsp.status(500).send({message : error.message});
    }
});

export default router;