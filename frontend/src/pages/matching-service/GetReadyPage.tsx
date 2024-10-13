import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import PageTitle from "@/components/common/PageTitle";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

const GET_READY_MAXIMUM_WAIT_TIME = 5; // in seconds

export default function MatchingFailedPage() {
    
    const getReadyTimerIntervalID = useRef<number | null>(null);
    const [getReadyTimer, setGetReadyTimer] = useState(GET_READY_MAXIMUM_WAIT_TIME);
    const pathname = location.pathname;

    const updateEndMatchingTimer = () => {
      if(location.pathname !== pathname) {
        if(getReadyTimerIntervalID.current !== null) {
          window.clearInterval(getReadyTimerIntervalID.current);
        }
      }
      setGetReadyTimer(val => {
        if(val - 1 == 0) {
          window.clearInterval(getReadyTimerIntervalID.current as number);
          // TODO
          alert("TODO: Get ready expired logic");
        }
        return val - 1;
      });
    }
  
    useEffect(() => {
      if(getReadyTimerIntervalID.current === null) {
        getReadyTimerIntervalID.current = window.setInterval(updateEndMatchingTimer, 1000);
      }
    }, []);

  document.title = "Get Ready | PeerPrep";

  const getReadyButtonOnClick = () => {
    // TODO
    alert("TODO: getReadyButtonOnClick");
  }

  return (
  <>
    <PageHeader />
    <MainContainer>
      <div className="flex flex-col space-y-5 justify-center items-center">
        <PageTitle>Matching success</PageTitle>
        <div>We have successfully found a match!</div>
        <div>Get ready in {GET_READY_MAXIMUM_WAIT_TIME} seconds!</div>
        <Button className="btngreen" onClick={getReadyButtonOnClick}>Yes, I'm ready! ({getReadyTimer})</Button>
        </div>
    </MainContainer>
  </>
  )
}
