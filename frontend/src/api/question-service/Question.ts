/**
 * Module for a Question object, based on the
 * Question model from the Question Service.
 */
export interface Question {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  topics?: string[];
  createdAt: string;
  updatedAt: string;
}

export function fromQuestionList(questionData : any[]) {
  return questionData.map(question => {
    return {
      id: question._id,
      ...question
    };
  }) as Question[];
}