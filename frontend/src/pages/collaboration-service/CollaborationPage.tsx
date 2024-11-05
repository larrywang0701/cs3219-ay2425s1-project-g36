import { Link } from "react-router-dom";
import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import TextEditor from "@/components/collaboration-service/TextEditor";
import { useNavigate } from "react-router-dom"
import { getUserById } from "@/api/user-service/UserService";
import { User } from "@/api/user-service/User";
import { Question } from "@/api/question-service/Question";
import { fetchQuestion } from "@/api/question-service/QuestionService";
import { useAuth } from "@/contexts/AuthContext";
import { removeUserFromCollabStore, isUserInCollabStore, getCollabInfo } from "@/api/collaboration-service/CollaborationService";

export default function CollaborationPage() {
  const [roomId, setRoomId] = useState<string | null>(null)
  const [matchedUserId, setMatchedUserId] = useState<string | null>(null)
  const [questionId, setQuestionId] = useState<string | null>(null)

  const { auth } = useAuth()
  const navigate = useNavigate();
  const [isUserLoading, setIsUserLoading] = useState(true)
  const [isQuestionLoading, setIsQuestionLoading] = useState(true)

  const [matchedUser, setMatchedUser] = useState<User | null>(null)
  const [question, setQuestion] = useState<Question | null>(null)
  
  // When user enters this page, check if his ID is in collabStore. If isn't, block the user from entering this page
  useEffect(() => {
    const checkIfUserInStore = async () => {
      if (auth.id === null) return

      try {
        const response1 = await isUserInCollabStore(auth.id)
        if (response1.status === 200) {
          // Using the user's ID, retrieve collaboration details
          const response2 = await getCollabInfo(auth.id)
          const data = response2.data
  
          setRoomId(data.roomId)
          setMatchedUserId(data.matchedUserId)
          setQuestionId(data.questionId)

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
      } finally {
        setIsUserLoading(false)
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
      } finally {
        setIsQuestionLoading(false)
      }
    }

    fetchQues()
  }, [questionId])

  if (isUserLoading || isQuestionLoading) return null

  if (roomId == null || matchedUser == null || question == null) {
    console.log('if you see this message, means either roomId, matchedUser, or question is null, hence CollabPage cannot load')
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

  return (
    <>
      <PageHeader />
      <MainContainer>
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          <h1 className="text-2xl font-bold">Practice with {matchedUser.username}</h1>
          <h2 className="text-xl font-semibold">
            #{questionId}: - <span>{question.title}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section>
              <button className="mb-4 inline-flex items-center justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
                Python3
                <ChevronDown className="ml-2 h-5 w-5" aria-hidden="true" />
              </button>
              <TextEditor roomId={roomId} />
            </section>

            <section className="space-y-4">
              <div className="p-4 rounded-md border border-gray-300">
                <h3 className="font-semibold mb-2">{question.title}</h3>
                <p className="text-sm">
                  {question.description}
                </p>
              </div>

              <Button variant="destructive" className="ml-auto" onClick={endSession}>End session</Button>
            </section>
          </div>

        </div>
      </MainContainer>
    </>
  )
}