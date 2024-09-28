import { Question } from "@/api/question-service/Question";
import { deleteQuestion, fetchQuestions } from "@/api/question-service/QuestionService";
import PageHeader from "@/components/common/PageHeader";
import { TDifficulty } from "@/components/question-service/Difficulty";
import FilterPopover from "@/components/question-service/list-question-page/FilterPopover";
import ListQuestionTable from "@/components/question-service/list-question-page/ListQuestionTable";
import { Button } from "@/components/ui/button";
import SearchInput from "@/components/ui/SearchInput";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Page for the question list.
 */
export default function ListQuestionPage() {
  const [ questions, setQuestions ] = useState<Question[]>([]);
  const [ difficultyFilter, setDifficultyFilter ] = useState<TDifficulty[]>(["easy", "medium", "hard"]);
  const [ topicFilter, setTopicFilter ] = useState<string[]>([]);
  const [ search, setSearch ] = useState("");
  const { auth } = useAuth();

  const updateQuestionTable = () => {
    fetchQuestions().then(questionList => {
      setQuestions(questionList);
    });
  }

  // update question table on first page load
  useEffect(() => {
    updateQuestionTable();
  }, [])

  // perhaps a new backend API endpoint that lists all topics would be nice here?
  const [ topics, setTopics ] = useState<string[]>([]);

  // set here to remove duplicate topics
  const fetchTopics = () => fetchQuestions().then(
    questions => [ ...new Set(
      questions.flatMap(question => question.topics ?? [])
    )]
  )

  // initialise topics and topic filters
  useEffect(() => {
    fetchTopics().then(topics => {
      setTopics(topics);
      setTopicFilter(topics);
    })
  }, [])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleClearInput = () => {
    setSearch("")
  }

  const handleDelete = (id : string) => {
    deleteQuestion(id).then(() => {
      // update question table on deletion
      updateQuestionTable();
    })
  }

  const filteredQuestions = questions.filter((question) => {
    // case-insensitive search
    const searchString = search.toLowerCase();

    const titleContains = question.title.toLowerCase().includes(searchString);
    const topicContains = question.topics?.reduce((acc, x) => acc || (x.toLowerCase() == searchString), false) ?? false;
    const difficultyMatch = (searchString == question.difficulty);
    const difficultyInFilter = difficultyFilter.includes(question.difficulty);
    const topicInFilter = topicFilter.filter(
      topic => (question.topics && question.topics.includes(topic))
    ).length > 0;

    return (titleContains || difficultyMatch || topicContains) && difficultyInFilter && topicInFilter;
  });

  return (
    <>
      <PageHeader />
      <div className="container mx-auto py-10">
        <div className="flex flex-row">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:tracking-tight mb-4">
            Questions
          </h2>
          <div className="flex-1"></div>
          <SearchInput 
            className="rounded-lg mb-4 ml-10 mr-5"
            value={search}
            onClearInput={ handleClearInput }
            onInputChange={ handleInputChange } />
          <FilterPopover 
            dChecked={ difficultyFilter }
            onDChecked={ setDifficultyFilter }
            topics={ topics }
            tChecked={ topicFilter }
            onTChecked={ setTopicFilter }
          />
          { auth.isAdmin &&
            // this should only be shown if the user is an admin
            <Button className="rounded-lg bg-black hover:bg-gray-800 text-white hover:text-gray-100 ml-4 flex items-center">
              <Link to="/questions/new">
                Add Question
              </Link>
            </Button>
          }
        </div>
        <ListQuestionTable onDelete={ handleDelete } questions={ filteredQuestions } />
      </div>
    </>
  );
}