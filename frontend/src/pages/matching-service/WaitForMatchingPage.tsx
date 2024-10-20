import { sendCancelMatchingRequest } from "@/api/matching-service/MatchingService";
import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import PageTitle from "@/components/common/PageTitle";
import SpinningCircle from "@/components/matching-service/SpinningCircle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

const MAXIMUM_MATCHING_DURATION = 60; // in seconds

export default function WaitForMatchingPage() {
  const [parameters] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();
  const [timer, setTimer] = useState(MAXIMUM_MATCHING_DURATION);

  const difficultiesStr = parameters.get("difficulties");
  const topicsStr = parameters.get("topics");

  // Runs every second to decrement the timer
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer >= -10) {
          return prevTimer - 1;
        } else {
          clearInterval(intervalId);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const cancelMatching = useCallback(() => {
    sendCancelMatchingRequest(auth.token).then(() => {
      navigate("/matching/cancelled");
    });
  }, [auth.token, navigate]);

  // Detects if the user navigates away. If so, cancels matching straight away
  useEffect(() => {
    const currentPath = location.pathname;

    const unlisten = () => {
      if (location.pathname !== currentPath) {
        cancelMatching();
      }
    };

    return unlisten; 
  }, [location, cancelMatching]);

  return (
    <>
      <PageHeader />
      <MainContainer>
        <div className="flex flex-col space-y-5 justify-center items-center">
          <PageTitle>Please wait for a moment...</PageTitle>
          <div>
            Searching for students who also want to do <b>{difficultiesStr}</b>{" "}
            questions with topics <b>{topicsStr}</b>.
          </div>
          <div>
            <div className="h-10" />
            <SpinningCircle>
              <div className="text-2xl">{timer}</div>
            </SpinningCircle>
            <div className="h-10" />
          </div>
          <div className="flex justify-center mt-20">
            <Button
              className="bg-red-500 text-white hover:bg-gray-500"
              onClick={cancelMatching}
            >
              Cancel matching
            </Button>
          </div>
        </div>
      </MainContainer>
    </>
  );
}
