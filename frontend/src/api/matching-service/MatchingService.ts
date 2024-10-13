import axios from "axios";
import { SelectedDifficultyData } from "@/components/matching-service/DifficultySelectionBox";

const MATCHING_SERVICE_URL = "http://localhost:5000/";
const MATCHING_BASE_URL = "/matching";
const START_MATCHING_URL = "/start";
const CHECK_MATCHING_STATE_URL = "/check_state";
const CANCEL_MATCHING_URL = "/cancel";
const CONFIRM_READY_URL = "/confirm_ready"

const api = axios.create({baseURL : MATCHING_SERVICE_URL})

let previousStartMatchingData : any = null;

async function sendStartMatchingRequest(userID : number, difficulties : SelectedDifficultyData, topics : string[]) {
  const requestBody = {
    userID : userID,
    difficulties : difficulties,
    topics : topics
  }

  previousStartMatchingData = requestBody;

  return await api.post(MATCHING_BASE_URL + START_MATCHING_URL, requestBody).then(response => {
    return {status : response.status, message : response.data.message}
  }).catch(error => {
    return {status : error.status, message : error.response.data.message}
  })
}

async function retryPreviousMatching(userID : number) {
  if(previousStartMatchingData === null) {
    throw new Error("[retryMatching] previousStartMatchingData is null");
  }

  return await api.post(MATCHING_BASE_URL + START_MATCHING_URL, {...previousStartMatchingData, userID : userID}).then(response => {
    return {status : response.status, message : response.data.message}
  }).catch(error => {
    return {status : error.status, message : error.response.data.message}
  })
}

async function sendCheckMatchingStateRequest(userID : number) {
  const requestBody = {
    userID : userID
  }
  return await api.post(MATCHING_BASE_URL + CHECK_MATCHING_STATE_URL, requestBody).then(response => {
    return {status : response.status, message : response.data.message}
  }).catch(error => {
    if(error.code === "ERR_NETWORK") {
      return {status : error.status, message : "ERR_NETWORK"}
    }
    return {status : error.status, message : error.response.data.message}
  });
}

async function sendCancelMatchingRequest(userID : number) {
  const requestBody = {
    userID : userID
  }
  return await api.post(MATCHING_BASE_URL + CANCEL_MATCHING_URL, requestBody).then(response => {
    return {status : response.status, message : response.data.message}
  }).catch(error => {
    return {status : error.status, message : error.response.data.message}
  })
}

async function sendConformReadyRequest(userID : number) {
  const requestBody = {
    userID : userID
  }
  return await api.post(MATCHING_BASE_URL + CONFIRM_READY_URL, requestBody).then(response => {
    return {status : response.status, message : response.data.message}
  }).catch(error => {
    return {status : error.status, message : error.response.data.message}
  })
}

export { sendStartMatchingRequest, sendCheckMatchingStateRequest, sendCancelMatchingRequest, sendConformReadyRequest, retryPreviousMatching };