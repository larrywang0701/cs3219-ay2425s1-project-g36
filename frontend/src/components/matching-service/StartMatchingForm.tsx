import { useState } from "react";
import PageTitle from "../common/PageTitle";
import QuestionTopicsField from "../question-service/edit-question-page/QuestionTopicsField";
import DifficultySelectionBox, { DEFAULT_SELECTED_DIFFICULTY_DATA, SelectedDifficultyData } from "./DifficultySelectionBox";
import { Button } from "../ui/button";

export default function StartMatchingForm() {

  const [questionTopics, setQuestionTopics] = useState<string[]>([]);
  const [selectedDifficultyData, setSelectedDifficultyData] = useState<SelectedDifficultyData>(DEFAULT_SELECTED_DIFFICULTY_DATA);

  const dev = () => {
    console.log(selectedDifficultyData);
  }

  return(
  <>
    <form onSubmit={evt=>evt.preventDefault() /* todo */} className="h-full">
      <PageTitle>Practice an Interview</PageTitle>
      <p>What question would you like to practice today?</p>
      <div className="flex flex-row mt-5">
        <DifficultySelectionBox onChange={setSelectedDifficultyData}/>
        <div className="ml-5 mr-5"/>
        <QuestionTopicsField value={questionTopics} setValue={setQuestionTopics}></QuestionTopicsField>
      </div>
      <div className="flex justify-center mt-20">
        <Button className="btnblack" onClick={dev}>Find a match</Button>
      </div>
    </form>
  </>
  )
}