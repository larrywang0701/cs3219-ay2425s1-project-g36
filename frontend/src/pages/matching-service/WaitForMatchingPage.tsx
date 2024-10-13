import { sendCancelMatchingRequest, sendCheckMatchingStateRequest } from "@/api/matching-service/MatchingService";
import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import PageTitle from "@/components/common/PageTitle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const CHECK_MATCHING_STATE_INTERVAL = 1000; // in milliseconds

enum MatchingState {
  Waiting,  // Waiting for matching
  Matched,  // Matched, waiting for getting ready
  ConfirmedReady,  // Confirmed ready, waiting for the other to get ready
  Failed_NoMatch,  // Failed due to not matching anyone after a timeout
  Failed_NotGettingReady  // Failed due to not getting ready in time after matched someone
}

export default function WaitForMatchingPage() {
  const [parameters] = useSearchParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const intervalID = useRef<number | null>(null);
  const pathname = location.pathname;

  const difficultiesStr = parameters.get("difficulties");
  const topicsStr = parameters.get("topics");

  const checkMatchingState = () => {
    console.log("checking matching state");
    if(location.pathname !== pathname) {
      cancelMatching();
      console.log("matching cancelled due to leaving page");
      return;
    }
    sendCheckMatchingStateRequest(auth.userID);
  }

  const cancelMatching = () => {
    console.log("cancel matching");
    if(intervalID.current !== null) {
      window.clearInterval(intervalID.current);
    }
    sendCancelMatchingRequest(auth.userID);
    navigate("../matching/start");
  }

  useEffect(() => {
    if(intervalID.current === null) {
      intervalID.current = window.setInterval(checkMatchingState, CHECK_MATCHING_STATE_INTERVAL);
    }
  }, []);

  return (
  <>
    <PageHeader />
    <MainContainer>
      <div className="flex flex-col space-y-5 justify-center items-center">
        <PageTitle>Please wait for a moment...</PageTitle>
        <div>Searching for students who also want to do <b>{difficultiesStr}</b> questions with topics <b>{topicsStr}</b>.</div>
        <div>
          <div className="h-10" />
          <div className="animate-spin w-20 h-20 rounded-full border-4 border-t-transparent border-black" />
          <div className="h-10" />
        </div>
        <div className="flex justify-center mt-20">
          <Button className="bg-red-500 text-white hover:bg-gray-500" onClick={cancelMatching}>Cancel matching</Button>
        </div>
      </div>
    </MainContainer>
  </>
  )
}