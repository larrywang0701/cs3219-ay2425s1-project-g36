import LayoutManager from "@/components/collaboration-service/LayoutManager";
import CodeEditingArea from "@/components/collaboration-service/CodeEditingArea";
import QuestionArea from "@/components/collaboration-service/QuestionArea";
import PageTitle from "@/components/common/PageTitle";
import { useEffect, useState } from "react";
import { Question } from "@/api/question-service/Question";
import { fetchQuestion } from "@/api/question-service/QuestionService";
import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { getUserById } from "@/api/user-service/UserService";
import { getCollabInfo, isUserInCollabStore, removeUserFromCollabStore } from "@/api/collaboration-service/CollaborationService";
import { User } from "@/api/user-service/User";
import { useCollaborationContext } from "@/contexts/CollaborationContext";
import { executeCodeInSandboxEnvironment, getCreditsSpent } from "@/api/collaboration-service/CollaborationService";

export default function CollaborationPage() {
  const [roomId, setRoomId] = useState<string | null>(null)
  const [matchedUserId, setMatchedUserId] = useState<string | null>(null)
  const [questionId, setQuestionId] = useState<string | null>(null)

  const { auth } = useAuth()
  const navigate = useNavigate();

  const [matchedUser, setMatchedUser] = useState<User | null>(null)
  const [question, setQuestion] = useState<Question | null>(null)

  const { codeEditingAreaState } = useCollaborationContext();
  const { rawCode, setRunCodeResult, currentlySelectedLanguage } = codeEditingAreaState;
  
  // When user enters this page, check if his ID is in collabStore. If isn't, block the user from entering this page
  useEffect(() => {
    const checkIfUserInStore = async () => {
      if (auth.id === null) return

      try {
        const response1 = await isUserInCollabStore(auth.id)
        if (response1.status === 200) {
          // Using the user's ID, retrieve collaboration details
          console.log('getting collab info..')
          const response2 = await getCollabInfo(auth.id)
          const data = response2.data
  
          setRoomId(data.roomId)
          setMatchedUserId(data.matchedUserId)
          setQuestionId(data.questionId)

          console.log('variables information are below')
          console.log('user id is', auth.id)
          console.log('roomId is: ', data.roomId)
          console.log('matchedUserId is: ', data.matchedUserId)
          console.log('questionId is: ', data.questionId)
        } else {
          // Means that user is not in user store, so he cannot access the collab-page
          navigate("/matching/start")
        }
      } catch (error) {
        console.error(error)
      }
    }

    checkIfUserInStore()
  }, [])

  // Use matchedUserId to retrieve matched user's details 
  useEffect(() => {
    const fetchMatchedUser = async () => {
      if (matchedUserId === null) return
      
      try {
        const response = await getUserById(matchedUserId)
        setMatchedUser(response.data)
      } catch (error) {
        console.error(error)
      }
    }
    
    fetchMatchedUser()
  }, [matchedUserId])

  // Use questionId to retrieve question details 
  useEffect(() => {
    const fetchQues = async () => {
      if (questionId === null) return

      try {
        const q = await fetchQuestion(questionId)
        setQuestion(q)
      } catch (error) {
        console.error(error)
      }
    }

    fetchQues()
  }, [questionId])

  if (roomId == null || matchedUser == null || question == null) {
    console.log('one of the below is null')
    console.log(`roomId: ${roomId}`)
    console.log(`matchedUser: ${matchedUser}`)
    console.log(`question: ${question}`)

    return (
      <MainContainer className="px-4 text-center gap-3 flex flex-col">
        <h2 className="text-2xl">
          There is some error when entering the collaboration page
        </h2>
        <div className="flex justify-center">
          <Button className="btnblack">
            <Link to="/questions">
              Go back to question list
            </Link>
          </Button>
        </div>
      </MainContainer>
    )
  }

  // When user ends session, remove user from collabStore
  const endSession = async () => {
    try {
      await removeUserFromCollabStore(auth.id)
      navigate("/matching/start")
    } catch (error) {
      console.error(error)
    }
  }

  if (roomId == null) {
    return (
      <MainContainer className="px-4 text-center gap-3 flex flex-col">
        <h2 className="text-2xl">
          You are at an invalid document ID for collaborating
        </h2>
        <div className="flex justify-center">
          <Button className="btnblack">
            <Link to="/questions">
              Go back to question list
            </Link>
          </Button>
        </div>
      </MainContainer>
    )
  }

  const handleRunCode = async () => {
    try {
      const run_code_response = await executeCodeInSandboxEnvironment(
        rawCode, // script
        "", // stdin
        currentlySelectedLanguage.JDoodleName, // language: I have tested code for python, JS, java -> works
        "0", // versionIndex: I (wishfully) assume all the languages we are supporting have a version of index 0
      )

      console.log('the result of executing code is: ', run_code_response.output)
      setRunCodeResult(run_code_response.output.output);

      const credits_spent_response = await getCreditsSpent()
      console.log('credits spent today is: ', credits_spent_response.data.used)
      console.log(`you have: ${20 - credits_spent_response.data.used} credits left for today`)

    } catch (error: any) {
      setRunCodeResult(`Error: ${error.response ? error.response.data.error : error.message}`);
    }
};

  return (
    <>
      <PageHeader />
      <MainContainer>
        <PageTitle>You are now collaborating with {matchedUser.username}.</PageTitle>
        <LayoutManager
          codeEditingArea={<CodeEditingArea roomId={roomId}/>}
          questionArea={<QuestionArea questionId={questionId || "72"}/>}
        />
        <Button variant="default" className="ml-auto" onClick={endSession}>End session</Button>
        <Button variant="default" className="ml-auto" onClick={handleRunCode}>Run code</Button>
      </MainContainer>
    </>
  )
}