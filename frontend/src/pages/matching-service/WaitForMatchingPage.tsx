import { sendCancelMatchingRequest, sendCheckMatchingStateRequest } from "@/api/matching-service/MatchingService";
import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import PageTitle from "@/components/common/PageTitle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const CHECK_MATCHING_STATE_INTERVAL = 1000; // in milliseconds
const MAXIMUM_MATCHING_DURATION = 60; // in seconds
const MAXIMUM_CHECK_MATCHING_STATE_NETWORK_ERROR_COUNT = 5;

export default function WaitForMatchingPage() {
  const [parameters] = useSearchParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const checkMatchingStateIntervalID = useRef<number | null>(null);
  const endMatchingTimerIntervalID = useRef<number | null>(null);
  const checkMatchingStateNetworkErrorCount = useRef(0);
  const [endMatchingTimer, setEndMatchingTimer] = useState(MAXIMUM_MATCHING_DURATION);
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
    sendCheckMatchingStateRequest(auth.userID).then(
      response => {
        const isSuccess = response.status === 200;
        if(isSuccess) {
          return;
        }
        if(response.message === "ERR_NETWORK") {
          checkMatchingStateNetworkErrorCount.current++;
          if(checkMatchingStateNetworkErrorCount.current >= MAXIMUM_CHECK_MATCHING_STATE_NETWORK_ERROR_COUNT) {
            cancelMatching(false);
            console.log("matching cancelled due to network error");
            navigate(`../matching/failed?message=Network error, please check your network and try again.&difficulties=${difficultiesStr}&topics=${topicsStr}`);
          }
        }
        else {
          cancelMatching();
          console.log("matching cancelled due to backend error");
          navigate(`../matching/failed?message=${response.message}&difficulties=${difficultiesStr}&topics=${topicsStr}`);
        }
      }
    );
  }

  const cancelMatching = (sendCancellationRequest : boolean = true) => {
    console.log("cancel matching");
    if(checkMatchingStateIntervalID.current !== null) {
      window.clearInterval(checkMatchingStateIntervalID.current);
    }
    if(endMatchingTimerIntervalID.current !== null) {
      window.clearInterval(endMatchingTimerIntervalID.current);
    }
    if(sendCancellationRequest) {
      sendCancelMatchingRequest(auth.userID);
    }
    navigate("../matching/start");
  }

  const updateEndMatchingTimer = () => {
    setEndMatchingTimer(val => {
      if(val - 1 <= 0) {
        cancelMatching();
        console.log("matching cancelled due to timed out");
        navigate(`../matching/failed?message=A match couldn't be found after ${MAXIMUM_MATCHING_DURATION} seconds. You may try again or refine your question selections to increase your chances to match.&difficulties=${difficultiesStr}&topics=${topicsStr}`);
      }
      return val - 1;
    });
    
  }

  useEffect(() => {
    if(checkMatchingStateIntervalID.current === null) {
      checkMatchingStateIntervalID.current = window.setInterval(checkMatchingState, CHECK_MATCHING_STATE_INTERVAL);
    }
    if(endMatchingTimerIntervalID.current === null) {
      endMatchingTimerIntervalID.current = window.setInterval(updateEndMatchingTimer, 1000);
    }
  }, []);

  document.title = "Matching | PeerPrep";

  return (
  <>
    <PageHeader />
    <MainContainer>
      <div className="flex flex-col space-y-5 justify-center items-center">
        <PageTitle>Please wait for a moment...</PageTitle>
        <div>Searching for students who also want to do <b>{difficultiesStr}</b> questions with topics <b>{topicsStr}</b>.</div>
        <div>
          <div className="h-10" />
          <div className="flex justify-center items-center relative w-20 h-20">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-transparent border-black" />
            <div className="text-2xl">{endMatchingTimer}</div>
          </div>
          <div className="h-10" />
        </div>
        <div className="flex justify-center mt-20">
          <Button className="bg-red-500 text-white hover:bg-gray-500" onClick={()=>cancelMatching(true)}>Cancel matching</Button>
        </div>
      </div>
    </MainContainer>
  </>
  )
}