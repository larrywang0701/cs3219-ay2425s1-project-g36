import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import EditQuestionForm from "@/components/question-service/edit-question-page/EditQuestionForm";
import { useParams } from "react-router-dom"

export default function EditQuestionPage() {
  const params = useParams();

  const id = params.id;

  return (
    <>
      <PageHeader />
      <MainContainer>
        <EditQuestionForm id={ id } />
      </MainContainer>
    </>
  )
}