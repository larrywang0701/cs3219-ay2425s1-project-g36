import { sendCheckConfirmationStateRequest, sendConfirmReadyRequest } from "@/api/matching-service/MatchingService";
import { DisplayedMessage, DisplayedMessageContainer, DisplayedMessageTypes } from "@/components/common/DisplayedMessage";
import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import PageTitle from "@/components/common/PageTitle";
import SpinningCircle from "@/components/matching-service/SpinningCircle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const MAXIMUM_CONFIRMATION_DURATION = 5; // in seconds
const CHECK_CONFIRMATION_STATE_INTERVAL = 500; // in milliseconds
const MAXIMUM_CHECK_CONFIRMATION_STATE_NETWORK_ERROR_COUNT = 10;

export default function GetReadyPage() {
  const pathname = location.pathname;
  const { auth } = useAuth();
  const navigate = useNavigate();
  const checkConfirmationStateNetworkErrorCount = useRef(0);
  const [endConfirmationTimer, setEndConfirmationTimer] = useState(MAXIMUM_CONFIRMATION_DURATION);
  const [ isReady, setIsReady ] = useState(false);
  const [displayedMessage, setDisplayedMessage] = useState<DisplayedMessage | null>(null);
  const checkConfirmationStateIntervalID = useRef<number | null>(null);
  const endConfirmationTimerIntervalID = useRef<number | null>(null);

  const [parameters] = useSearchParams();
  const difficultiesStr = parameters.get("difficulties");
  const topicsStr = parameters.get("topics");

  const HTTP_OK = 200;
  const HTTP_WAITING = 202;
  const HTTP_USER_NOT_FOUND = 409;
  const HTTP_ERROR = 500;
  
  // Clear the intervals when user is about to be navigated away
  const onNavigatingAway = () => {
    console.log("on navigating away");
    if(checkConfirmationStateIntervalID.current !== null) {
      window.clearInterval(checkConfirmationStateIntervalID.current);
      checkConfirmationStateIntervalID.current = null;
    }
    if(endConfirmationTimerIntervalID.current !== null) {
      window.clearInterval(endConfirmationTimerIntervalID.current);
      endConfirmationTimerIntervalID.current = null;
    }
  }
  
  // When the user fails to get ready in time, navigate to the failed matching page
  const notGettingReady = () => {
    const MESSAGE_NOT_GETTING_READY_IN_TIME = "Failed to receive confirmation from both users";
    // sendUpdateReadyStateRequest(auth.token, false);
    // Nothing is required to be sent to backend 
    onNavigatingAway();
    navigate(`../matching/failed?message=${MESSAGE_NOT_GETTING_READY_IN_TIME}&difficulties=${difficultiesStr}&topics=${topicsStr}`)
  }

  // When the user clicks the confirmation button
  const confirmationButtonOnClick = () => {
    setIsReady(true);

    sendConfirmReadyRequest(auth.id).then((response) => {
      const httpStatus = response.status;
      const errorMessage = response.message

      if (httpStatus === HTTP_OK) {
        // Do nothing
      } else if (httpStatus === HTTP_USER_NOT_FOUND || httpStatus === HTTP_ERROR) {
        navigate(`/matching/failed?message=${errorMessage}&difficulties=${difficultiesStr}&topics=${topicsStr}`);
      } else {
        displayError("An error has occured: \n" + response.message);
      }
    });
  };

  // Display an error message
  const displayError = (message : string) => {
    setDisplayedMessage({message : message, type : DisplayedMessageTypes.Error});
  }

  // Check every 0.5 seconds if the peer is ready
  const checkConfirmationState = () => {
    console.log("checking confirmation state");
    if(location.pathname !== pathname) {
      onNavigatingAway();
      // TODO: backend required to handle this ?
      console.log("matching cancelled due to leaving page");
      return;
    }
    sendCheckConfirmationStateRequest(auth.id).then(
      response => {
        if(response.status === HTTP_OK) {
          console.log("confirmation received, starting collaboration");
          onNavigatingAway();
          // TODO: update based on collab service
          navigate(`../collaboration`);
        } else if (response.status === HTTP_WAITING) {
          //Do nothing
          console.log("matching...");
        } else if (response.message === "ERR_NETWORK") {
          checkConfirmationStateNetworkErrorCount.current++;
          if(checkConfirmationStateNetworkErrorCount.current >= MAXIMUM_CHECK_CONFIRMATION_STATE_NETWORK_ERROR_COUNT) {
            // TODO: backend required to handle this ?
            onNavigatingAway();
            console.log("confirmation cancelled due to network error");
            navigate(`../matching/failed?message=Network error, please check your network and try again.&difficulties=${difficultiesStr}&topics=${topicsStr}`);
          }
        } else {
          onNavigatingAway();
          console.log("confirmation cancelled due to backend error");
          navigate(`../matching/failed?message=${response.message}&difficulties=${difficultiesStr}&topics=${topicsStr}`);
        }
      }
    );
  }

  const updateEndConfirmationTimer = () => {
    if(location.pathname !== pathname) {
      onNavigatingAway();
      return;
    }
    if(isReady) {
      return;
    }
    setEndConfirmationTimer(val => {
      if(val - 1 == 0) {
        notGettingReady();
      }
      return val - 1;
    });
  }
  
  
  useEffect(() => {
    if (checkConfirmationStateIntervalID.current === null) {
      checkConfirmationStateIntervalID.current = window.setInterval(checkConfirmationState, CHECK_CONFIRMATION_STATE_INTERVAL);
    }
    if (endConfirmationTimerIntervalID.current === null) {
      endConfirmationTimerIntervalID.current = window.setInterval(updateEndConfirmationTimer, 1000);
    }
  }, []);
  // // Check if peer is ready
  // const checkConfirmationState = () => {
  //   console.log("checking peer ready state");
  //   if(location.pathname !== pathname) {
  //     onNavigatingAway();
  //     return;
  //   }
  //   sendCheckConfirmationStateRequest(auth.id).then(
  //     response => {
  //       const isSuccess = response.status === 200;
  //       if(isSuccess) {

  //         console.log("the peer is also ready, starting collaboration");
  //         onNavigatingAway();
  //         navigate(`../collaboration`);

  //       } else if (response.message === "not ready") {
  //           console.log("the peer is not ready, retry matching");
  //           onNavigatingAway();
  //           retryMatching();
  //         }
  //         return;
  //       }
  //       if(response.message === "ERR_NETWORK") {
  //         checkPeerReadyStateNetworkErrorCount.current++;
  //         if(checkPeerReadyStateNetworkErrorCount.current >= MAXIMUM_CHECK_PEER_READY_STATE_NETWORK_ERROR_COUNT) {
  //           onNavigatingAway();
  //           console.log("waiting for getting ready cancelled due to network error");
  //           navigate(`../matching/failed?message=Network error, please check your network and try again.&difficulties=${difficultiesStr}&topics=${topicsStr}`);
  //         }
  //       }
  //       else {
  //         onNavigatingAway();
  //         console.log("waiting for getting ready cancelled due to backend error");
  //         navigate(`../matching/failed?message=${response.message}&difficulties=${difficultiesStr}&topics=${topicsStr}`);
  //       }
  //     }
  //   );
  // }


  // const retryMatching = () => {
  //   retryPreviousMatching(auth.token).then(
  //     response => {
  //       const isSuccess = response.status === 200;
  //       if(isSuccess) {
  //         navigate(`../matching/wait?peerNotReady=true&difficulties=${difficultiesStr}&topics=${topicsStr}`);
  //       }
  //       else {
  //         displayError("An error has occured: \n" + response.message);
  //       }
  //     }
  //   )
  // }

  // useEffect(() => {
  //   if(getReadyTimerIntervalID.current === null) {
  //     getReadyTimerIntervalID.current = window.setInterval(updateEndMatchingTimer, 1000);
  //   }
  // }, []);

  // document.title = "Get Ready | PeerPrep";

  // const getReadyButtonOnClick = () => {
  //   sendUpdateReadyStateRequest(auth.token, true).then(
  //     response => {
  //       const isSuccess = response.status === 200;
  //       if(isSuccess) {
  //         setIsReady(true);
  //         if(getReadyTimerIntervalID.current !== null) {
  //           window.clearInterval(getReadyTimerIntervalID.current);
  //         }
  //         if(checkPeerReadyStateIntervalID.current === null) {
  //           checkPeerReadyStateIntervalID.current = window.setInterval(checkConfirmationState, CHECK_PEER_READY_STATE_INTERVAL);
  //         }
  //       }
  //       else {
  //         displayError("An error has occured: \n" + response.message);
  //       }
  //     }
  //   )
  // }

  return (
  <>
    <PageHeader />
    <MainContainer>
      <div className="flex flex-col space-y-5 justify-center items-center">
        <PageTitle>Matching success</PageTitle>
        <div>We have successfully found a match!</div>
        {!isReady ? (
          <>
            <div>Get ready in {MAXIMUM_CONFIRMATION_DURATION} seconds!</div>
            <Button className="btngreen" onClick={confirmationButtonOnClick}>Yes, I'm ready! ({endConfirmationTimer})</Button>
          </>
        ) : (
          <>
            <div>Waiting for the other user to get ready...</div>
            <SpinningCircle />
          </>
        )}
        <DisplayedMessageContainer displayedMessage={displayedMessage}/>
        </div>
    </MainContainer>
  </>
  )
}

// import {
//   sendConfirmMatch,
// } from "@/api/matching-service/MatchingService";
// import {
//   DisplayedMessage,
//   DisplayedMessageContainer,
//   DisplayedMessageTypes,
// } from "@/components/common/DisplayedMessage";
// import MainContainer from "@/components/common/MainContainer";
// import PageHeader from "@/components/common/PageHeader";
// import PageTitle from "@/components/common/PageTitle";
// import SpinningCircle from "@/components/matching-service/SpinningCircle";
// import { Button } from "@/components/ui/button";
// import { useAuth } from "@/contexts/AuthContext";
// import { useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";

// const HTTP_OK = 200;
// const HTTP_NO_CONTENT = 204;
// const HTTP_REQUEST_TIMEOUT = 408;

// export default function GetReadyPage() {

//   const { auth } = useAuth();
//   const navigate = useNavigate();
//   const [isReady, setIsReady] = useState(false);
//   const [displayedMessage, setDisplayedMessage] =
//     useState<DisplayedMessage | null>(null);

//   const [parameters] = useSearchParams();
//   const difficultiesStr = parameters.get("difficulties");
//   const topicsStr = parameters.get("topics");

//   const displayError = (message: string) => {
//     setDisplayedMessage({
//       message: message,
//       type: DisplayedMessageTypes.Error,
//     });
//   };

//   const getReadyButtonOnClick = () => {
//     setIsReady(true);

//     sendConfirmMatch(auth.id).then((response) => {
//       const httpStatus = response.status;
//       const errorMessage = response.message

//       if (httpStatus === HTTP_OK) {
//         // send this guy to the collaboration page
//         navigate("/collaboration")
//       } else if (
//         httpStatus === HTTP_NO_CONTENT ||
//         httpStatus === HTTP_REQUEST_TIMEOUT
//       ) {
//         // happens when timeout after 10s (10 seconds counting happens in backend), navigate to failed matching page
//         navigate(`/matching/failed?message=${errorMessage}&difficulties=${difficultiesStr}&topics=${topicsStr}`);
//       } else {
//         displayError("An error has occured: \n" + response.message);
//       }
//     });
//   };

//   return (
//     <>
//       <PageHeader />
//       <MainContainer>
//         <div className="flex flex-col space-y-5 justify-center items-center">
//           <PageTitle>Matching success</PageTitle>
//           <div>We have successfully found a match!</div>
//           {!isReady ? (
//             <>
//               <div>Get ready!</div>
//               <Button className="btngreen" onClick={getReadyButtonOnClick}>
//                 Yes, I'm ready!
//               </Button>
//             </>
//           ) : (
//             <>
//               <div>Waiting for the other user to get ready...</div>
//               <SpinningCircle />
//             </>
//           )}
//           <DisplayedMessageContainer displayedMessage={displayedMessage} />
//         </div>
//       </MainContainer>
//     </>
//   );
// }
