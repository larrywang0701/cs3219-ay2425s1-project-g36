/**
 * Module that represents information to and from the Question Service.
 */

import axios from "axios";
import { EMPTY_QUESTION, fromQuestionList, Question, toQuestionObject } from "./Question";

/**
 * URL of question service microservice to be used.
 */
const QUESTION_SERVICE_URL = "http://localhost:3000/";

const api = axios.create({
  baseURL: QUESTION_SERVICE_URL,
  
});

/**
 * An async function that fetches the question list from the backend question
 * service.
 * 
 * @returns The question list from the question-service as a promise.
 */
export async function fetchQuestions() : Promise<Question[]> {
  const data = await api.get('/questions/').then(response => {
    return response.data.data;
  }).catch(error => {
    console.error("An error occurred when fetching questions in fetchQuestions():", error)
  });
  return fromQuestionList(data);
}

/**
 * An async function that fetches a specific question from the backend question
 * service based on the given ID. Returns an empty question if the ID is invalid.
 * @param id The ID of the question to fetch, if any.
 */
export async function fetchQuestionById(id? : string) : Promise<Question> {
  if (id === undefined) return EMPTY_QUESTION;

  const data = await api.get('/questions/' + id).then(response => {
    return response.data;
  }).catch(error => {
    console.error("An error occurred when fetching the question with ID " + id + " from fetchQuestionById():", error);
    return EMPTY_QUESTION;
  })
  return toQuestionObject(data);
}

// TODO: add question service
export async function insertQuestion(question : Question) {
  const newQuestionData = {
    title: question.title,
    description: question.description,
    topics: question.topics,
    difficulty: question.difficulty
  };
  return await api.post('/questions/', newQuestionData).then(response => {
    return { status: response.status, message: response.data };
  }).catch(error => {
    console.error("An error occurred when adding question in insertQuestion():", error);
    return { status: error.response.status, message: error.response.data.message };
  });
}

// TODO: update question service
export async function updateQuestion(question : Question) {
  const id = question.id;
  const newQuestionData = {
    title: question.title,
    description: question.description,
    topics: question.topics,
    difficulty: question.difficulty
  };
  return await api.put('/questions/' + id, newQuestionData).then(response => {
    return { status: response.status, message: response.data };
  }).catch(error => {
    console.error("An error occurred when updating question " + id + " in updateQuestion():", error);
    return { status: error.response.status, message: error.response.data.message };
  });
}

/**
 * An async function that deletes the question in the backend question service based on the given
 * question ID.
 * 
 * @param id The question ID to delete.
 */
export async function deleteQuestion(id : string) {
  await api.delete('/questions/' + id).then(response => {
    return response.data.data;
  }).catch(error => {
    console.error("An error occurred when deleting question " + id + " in deleteQuestion():", error)
  });
}