/**
 * Module that represents information to and from the Question Service.
 */

import axios from "axios";
import { fromQuestionList } from "./Question";

/**
 * URL of question service microservice to be used.
 */
const QUESTION_SERVICE_URL = "http://localhost:3000/";

const api = axios.create({
  baseURL: QUESTION_SERVICE_URL,
  
});

export async function fetchQuestions() {
  const data = await api.get('/questions/').then(response => {
    return response.data.data;
  }).catch(error => {
    console.error("An error occurred when fetching questions in fetchQuestions():", error)
  });
  return fromQuestionList(data);
}

// TODO: add question service

// TODO: update question service

// TODO: delete question service