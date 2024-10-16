import { SelectedDifficultyData } from "./SelectedTopics";

type User = {
    userToken : string,
    difficulties : SelectedDifficultyData,
    topics : string[]
    isReady : boolean,
    matchedUser : User | null
}

export { User };