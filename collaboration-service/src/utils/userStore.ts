import { User } from "../models/user";

// UserStore is a singleton class. Users will be added to this UserStore ONLY when they are collaborating
// TODO: when users 'end session', remove them from this UserStore
class UserStore {
    private userStore: Map<string, User>;

    constructor() {
        this.userStore = new Map<string, User>();
    }

    addUser(userId: string, userObject: User) {
        this.userStore.set(userId, userObject);
    }

    getUser(userId: string) {
        return this.userStore.get(userId);
    }

    removeUser(userId: string) {
        this.userStore.delete(userId);
    }

    hasUser(userId: string) {
        return this.userStore.has(userId);
    }

    printContents() {
        const contents = Array.from(this.userStore.entries()).map(([key, value]) => ({
            userId: key,
            matchedUserId: value.matchedUserId,
            roomId: value.roomId,
            questionId: value.questionId,
        }));
        
        console.table(contents);
    }

}

const userStore = new UserStore();
export default userStore;