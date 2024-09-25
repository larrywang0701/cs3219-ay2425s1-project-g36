import { useParams } from "react-router-dom"

export default function ViewQuestionPage() {
  const params = useParams();

  const id = params.id;

  return (
    <>View question page with ID {id}</>
  )
}