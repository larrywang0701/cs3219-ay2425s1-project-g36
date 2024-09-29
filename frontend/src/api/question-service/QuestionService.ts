/**
 * Module that represents information to and from the Question Service.
 */

import axios from "axios";
import { fromQuestionList, Question } from "./Question";

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
    console.log(`questions fetched: ${response.data.data}`)
    return response.data.data;
  }).catch(error => {
    console.error("An error occurred when fetching questions in fetchQuestions():", error)
  });
  return fromQuestionList(data);
}

/**
 * An async function that fetches a question by id from the backend question
 * service.
 * 
 * @param id The question ID to fetch.
 * 
 * @returns The question.
 */
export async function fetchQuestion(id: string) : Promise<Question | null> {
  try {
    const question = await api.get('/questions/' + id)
    return question.data
  } catch (error) {
    console.error(`An error occurred when fetching question of id ${id} in fetchQuestion():`, error)
    return null
  }
}

// TODO: add question service

// TODO: update question service


/**
 * An async function that fetches the list of topics from the backend question service.
 * 
 * @returns The list of topics from the question-service as a promise.
 */
export async function fetchTopics(): Promise<String[]> {
  try {
    const response = await api.get('/questions/topics');
    return response.data;
  } catch (error) {
    console.error("An error occurred when fetching topics in fetchTopics():", error);
    return []; 
  }
}

/**
 * An async function that deletes the question in the backend question service based on the given
 * question ID.
 * 
 * @param id The question ID to delete.
 */
export async function deleteQuestion(id : string) {
  await api.delete('/questions/' + id).then(response => {
    console.log(response);
    return response.data.data;
  }).catch(error => {
    console.error("An error occurred when deleting question " + id + " in deleteQuestion():", error)
  });
}