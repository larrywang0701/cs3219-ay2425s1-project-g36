/*
TODO:
Here I only implemented a simple matching logic based on a single queue.
For now any two users could be matched together (ignoring their requirements on difficulties and topics)

TODO: matching based on user's requirements.
*/

import { assert } from "console";
import { MatchingQueue, User } from "./MatchingQueue";



class MatchingManager {
    private readonly queue : MatchingQueue;
    private readonly allUsers : User[];

    constructor() {
        this.queue = new MatchingQueue();
        this.allUsers = [];
    }

    /**
     * Set two users as "matched together" and waiting for both of them to get ready.
     * @param user1 The first user
     * @param user2 The second user
     */
    private matchTwoUsersTogether(user1 : User, user2 : User) : void {
        console.log(`Matching userID = ${user1.userID} and userID = ${user2.userID} together`);
        assert(user1.matchedUser === null, `[matchTwoUsersTogether] user1.matchedUser should be null, but got ${user1.matchedUser}`);
        assert(user2.matchedUser === null, `[matchTwoUsersTogether] user2.matchedUser should be null, but got ${user2.matchedUser}`);
        user1.matchedUser = user2;
        user2.matchedUser = user1;
    }

    /**
     * Dismiss two matched users when at least one user failed to get ready in time.
     * @param user1 The first user
     * @param user2 The second user
     */
    private dismissMatchedUsersAfterNotGettingReady(user1 : User, user2 : User) : void {
        assert(user1.matchedUser === user2, "[dismissMatchedUsersAfterNotGettingReady] user1.matchedUser should be user2, but got " + user1.matchedUser);
        assert(user2.matchedUser === user1, "[dismissMatchedUsersAfterNotGettingReady] user2.matchedUser should be user1, but got " + user2.matchedUser);
        user1.matchedUser = null;
        user2.matchedUser = null;
    }

    /**
     * Check whether a user is already matched with another user or not
     * @param userID The user ID
     * @returns `true` if the user with the given user ID is already matched to another user, `false` otherwise
     */
    isUserMatched(userID : number) : boolean {
        return this.getUser(userID).matchedUser !== null;
    }

    /**
     * Try matching another user for a given user.
     * @param userID The user ID of the given user for matching another user. The user ID must correspond to a user **currently in the matching service**.
     * @returns `true` if successfully matched another user, `false` otherwise.
     */
    tryMatchWith(userID : number) : boolean {
        if(this.queue.isEmpty()) {
            return false;
        }
        const user = this.getUser(userID);
        // TODO: implement "matching based on user requirements" here
        const theOtherUser = this.queue.peek();
        if(theOtherUser.userID === userID) {
            return false
        }
        this.queue.pop();
        this.queue.removeUser(this.getUser(userID));
        this.matchTwoUsersTogether(user, theOtherUser);
        return true;
    }

    /**
     * Check whether a user is in matching service based on userID.
     * @param userID The user ID
     * @returns `true` if a user with this userID is in matching service, `false` otherwise.
     */
    isUserInMatchingService(userID : number) : boolean {
        return this.allUsers.filter(u => u.userID === userID).length > 0;
    }

    /**
     * Push a new user into the matching queue
     * @param user The user
     */
    push(user : User) {
        if(this.isUserInMatchingService(user.userID)) {
            this.removeUser(user.userID);
        }
        this.allUsers[user.userID] = user;
        this.queue.push(user);
    }

    /**
     * Cancel matching for a user
     * @param userID The user
     **/
    cancelMatching(userID : number) : void {
        if(!this.isUserInMatchingService(userID)) {
            return;
        }
        this.queue.removeUser(this.getUser(userID));
        delete this.allUsers[userID];
    }

    /**
     * Remove a user from the matching service
     * @param userID The userID of the user
     */
    removeUser(userID : number) : void {
        if(!this.isUserInMatchingService(userID)){
            throw new Error("User does not exist in matching service");
        }
        if(this.queue.isUserInQueue(userID)){
            this.queue.removeUser(this.getUser(userID));
        }
        delete this.allUsers[userID];
    }

    private getUser(userID : number) : User {
        if(this.allUsers[userID] === undefined) {
            throw new Error("User does not exist");
        }
        return this.allUsers[userID];
    }
}

const matchingManagerInstance = new MatchingManager();

export default matchingManagerInstance;

