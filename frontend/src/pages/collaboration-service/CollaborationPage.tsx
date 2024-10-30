import { Link, Navigate } from "react-router-dom";
import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import TextEditor from "@/components/collaboration-service/TextEditor";
import { useSearchParams, useNavigate } from "react-router-dom"
import { getUserById } from "@/api/user-service/UserService";
import { User } from "@/api/user-service/User";
import { Question } from "@/api/question-service/Question";
import { fetchQuestion } from "@/api/question-service/QuestionService";
import { useAuth } from "@/contexts/AuthContext";
import { removeUserFromUserStore } from "@/api/collaboration-service/CollaborationService";

export default function CollaborationPage() {
  const [parameters] = useSearchParams()
  const roomId = parameters.get("roomId")
  const matchedUserId = parameters.get("matchedUserId") 
  const questionId = parameters.get("questionId")
  const { auth } = useAuth()
  const navigate = useNavigate();

  const [matchedUser, setMatchedUser] = useState<User | null>(null)
  const [question, setQuestion] = useState<Question | null>(null)
  
  // use matchedUserId to retrive matched user's details 
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
  }, [])

  // use questionId to retrive question details 
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
  }, [])

  if (roomId == null || matchedUser == null || question == null) {
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

  // when user ends session, remove user from userStore
  const endSession = async () => {
    try {
      await removeUserFromUserStore(auth.id)
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

              <div className="border border-gray-300 rounded-md p-4">
                <h3 className="font-semibold mb-2">Test cases</h3>
                <ul className="list-disc list-inside text-sm">
                  <li className="text-red-600">Test case 1 failed</li>
                  <li className="text-green-600">Test case 2 passed</li>
                </ul>
              </div>

              <Button variant="default" className="ml-auto">Run code</Button>
              <Button variant="destructive" className="ml-auto" onClick={endSession}>End session</Button>
            </section>
          </div>

        </div>
      </MainContainer>
    </>
  )
}