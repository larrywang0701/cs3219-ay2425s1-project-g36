import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import StartMatchingForm from "@/components/matching-service/StartMatchingForm";

export default function StartMatchingPage() {
  return (
  <>
    <PageHeader />
    <MainContainer>
      <StartMatchingForm />
    </MainContainer>
  </>
  )
}