import { Question } from "@/api/question-service/Question";
import { deleteQuestion, fetchQuestions } from "@/api/question-service/QuestionService";
import ListQuestionTable from "@/components/question-service/list-question-page/ListQuestionTable";
import { Button } from "@/components/ui/button";
import SearchInput from "@/components/ui/SearchInput";
import { useAuth } from "@/contexts/AuthContext";
import { FilterIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Page for the question list.
 */
export default function ListQuestionPage() {
  const [ questions, setQuestions ] = useState<Question[]>([]);
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
    return titleContains || difficultyMatch || topicContains;
  });

  return (
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
        <Button variant="ghost" className="p-0 flex items-center">
          <FilterIcon />
        </Button>
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
  );
}