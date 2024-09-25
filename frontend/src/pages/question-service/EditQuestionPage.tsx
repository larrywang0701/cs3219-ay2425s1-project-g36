import { useParams } from "react-router-dom"

export default function EditQuestionPage() {
  const params = useParams();

  const id = params.id;

  return (
    <>Edit question page with ID {id}</>
  )
}