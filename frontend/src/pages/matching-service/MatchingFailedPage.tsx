import { retryPreviousMatching } from "@/api/matching-service/MatchingService";
import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import PageTitle from "@/components/common/PageTitle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function MatchingFailedPage() {
  const [parameters] = useSearchParams();
  const navigate = useNavigate();
  const { auth } = useAuth();

  const message = parameters.get("message");
  const difficultiesStr = parameters.get("difficulties");
  const topicsStr = parameters.get("topics");


  const retryButtonOnClick = () => {
    retryPreviousMatching(auth.userID).then(
      response => {
        const isSuccess = response.status === 200;
        if(isSuccess) {
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

  const refineSelectionButtonOnClick = () => {
    navigate("../matching/start")
  }

  document.title = "Matching Failed | PeerPrep";

  return (
  <>
    <PageHeader />
    <MainContainer>
      <div className="flex flex-col space-y-5 justify-center items-center">
        <PageTitle>Matching Failed</PageTitle>
        <div>{message}</div>
          <Button className="btngreen" onClick={retryButtonOnClick}>Try again</Button>
          <Button className="btnblack" onClick={refineSelectionButtonOnClick}>Refine selection</Button>
      </div>
    </MainContainer>
  </>
  )
}
