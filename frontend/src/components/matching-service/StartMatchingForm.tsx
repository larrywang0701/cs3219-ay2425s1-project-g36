import { useState } from "react";
import PageTitle from "../common/PageTitle";
import QuestionTopicsField from "../question-service/edit-question-page/QuestionTopicsField";
import DifficultySelectionBox, { DEFAULT_SELECTED_DIFFICULTY_DATA, SelectedDifficultyData } from "./DifficultySelectionBox";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { sendStartMatchingRequest } from "@/api/matching-service/MatchingService";
import { useNavigate } from "react-router-dom";

export default function StartMatchingForm() {

  const { auth } = useAuth();
  const navigate = useNavigate();

  const [questionTopics, setQuestionTopics] = useState<string[]>([]);
  const [selectedDifficultyData, setSelectedDifficultyData] = useState<SelectedDifficultyData>(DEFAULT_SELECTED_DIFFICULTY_DATA);

  const startMatching = () : void => {
    if(!selectedDifficultyData.easy && !selectedDifficultyData.medium && !selectedDifficultyData.hard) {
      displayNotification("You must select at least one difficulty.");
      return;
    }
    if(questionTopics.length === 0) {
      displayNotification("You must select at least one topic.");
      return;
    }
    sendStartMatchingRequest(auth.token, selectedDifficultyData, questionTopics).then(
      response => {
        const isSuccess = response.status === 200;
        if(isSuccess) {
          const difficultiesStr = Object.entries(selectedDifficultyData).filter(val => val[1]).map(val => val[0]).join(", ");
          const topicsStr = questionTopics.join(", ");
          navigate(`../matching/wait?difficulties=${difficultiesStr}&topics=${topicsStr}`);
        }
        else {
          displayNotification("An error has occured: \n" + response.message);
        }
      }
    )
  }

  const displayNotification = (message : string) : void => {
    alert(message + "\n\n( This message box will be replaced to a `DisplayedMessage` component after my pull request about user service frontend is merged into the main repo. )");
  }

  return(
  <>
    <form onSubmit={evt => {evt.preventDefault();} } className="h-full">
      <PageTitle>Practice an Interview</PageTitle>
      <p>What question would you like to practice today?</p>
      <div className="flex flex-row mt-5">
        <DifficultySelectionBox onChange={setSelectedDifficultyData}/>
        <div className="ml-5 mr-5"/>
        <QuestionTopicsField value={questionTopics} setValue={setQuestionTopics}></QuestionTopicsField>
      </div>
      <div className="flex justify-center mt-20">
        <Button className="btnblack" onClick={startMatching}>Find a match</Button>
      </div>
    </form>
  </>
  )
}