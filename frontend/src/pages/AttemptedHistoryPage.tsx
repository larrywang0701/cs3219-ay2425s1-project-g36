import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import PageHeader from "@/components/common/PageHeader";
import { getUserAttempts } from "@/api/user-service/UserService";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from 'date-fns';

interface History {
  id: string;
  timeSubmitted: Date;
  questionTitle: string;
  questionId: number;
  language: string;
  code: string;
}

const DEFAULT_ITEMS_PER_PAGE = 5;
const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20];

export default function AttemptedHistoryPage() {
  const [attemptedQuestions, setAttemptedQuestions] = useState<History[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [dropdownOpen, setDropdownOpen] = useState(false); // Track dropdown open/close state
  const { auth } = useAuth();

  useEffect(() => {
    const loadAttemptHistory = async () => {
      try {
        setIsLoading(true);
        const result = await getUserAttempts(auth.id);
        
        if (result.status === 200) {
          setAttemptedQuestions(result.data);
          setError("");
          setTotalPages(Math.ceil(result.data.length / itemsPerPage));
        } else {
          setError(result.message);
        }
      } catch (err) {
        console.error("Error fetching attempt history:", err);
        setError("Failed to fetch attempt history.");
      } finally {
        setIsLoading(false);
      }
    };

    loadAttemptHistory();
  }, [itemsPerPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error}</div>;

  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedQuestions = attemptedQuestions.slice(startIdx, startIdx + itemsPerPage);

  return (
    <>
      <PageHeader />
      <div className={`container mx-auto p-6 ${dropdownOpen ? 'pb-32' : ''}`}>
        {/* Apply extra padding at the bottom when dropdown is open */}
        <h1 className="text-3xl font-bold mb-6">Submission History</h1>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-3/4">
            <Table className="rounded-2xl">
              <TableHeader className="bg-black-100">
                <TableRow>
                  <TableHead>Time Submitted</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Language</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedQuestions.map((question) => (
                  <TableRow key={question.id} className="border-b border-black-300 h-16">
                    <TableCell className="px-4 py-1 text-muted-foreground">
                      {formatDistanceToNow(new Date(question.timeSubmitted), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="px-4 py-1">
                      <Link
                        to={`/questions/${question.id}`}
                        className="text-blue-500 hover:text-blue-700 hover:underline"
                      >
                        {question.questionTitle}
                      </Link>
                    </TableCell>
                    <TableCell className="px-4 py-1 text-muted-foreground">
                      {question.language}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex justify-between items-center flex-wrap">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-32">
                    {itemsPerPage} / page
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="bottom"
                  sideOffset={5}
                  avoidCollisions={false} // Disable automatic flipping
                >
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option}
                      onClick={() => handleItemsPerPageChange(option)}
                    >
                      {option} / page
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center space-x-2 mt-2 lg:mt-0">
                <span>Page {currentPage} of {totalPages}</span>
                <Button onClick={handlePreviousPage} disabled={currentPage === 1}>
                  Previous
                </Button>
                <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


          {/* <div className="lg:w-1/4 space-y-6 ml-auto" style={{ minWidth: "250px", maxWidth: "300px" }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Submission Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border w-full"
                  style={{ width: "100%", height: "auto" }}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Questions Attempted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Attempted</span>
                    <span className="text-sm text-muted-foreground">
                      {attemptedQuestions.length}
                    </span>
                  </div>
                  <Progress value={100} className="h-2" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Accepted</span>
                      <span className="text-sm text-muted-foreground">
                        {attemptedQuestions.accepted}/{attemptedQuestions.total}
                      </span>
                    </div>
                    <Progress
                      value={(attemptedQuestions.accepted / attemptedQuestions.total) * 100}
                      className="h-2 bg-green-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Wrong Answer</span>
                      <span className="text-sm text-muted-foreground">
                        {attemptedQuestions.wrongAnswer}/{attemptedQuestions.total}
                      </span>
                    </div>
                    <Progress
                      value={(attemptedQuestions.wrongAnswer / attemptedQuestions.total) * 100}
                      className="h-2 bg-red-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div> 
          
            // This would come from your data source in a real application
  // const stats = {
  //   total: { completed: 297, total: 3339 },
  //   categories: [
  //     { name: "Easy", completed: 101, total: 831, color: "bg-green-500" },
  //     { name: "Medium", completed: 169, total: 1748, color: "bg-yellow-500" },
  //     { name: "Hard", completed: 27, total: 760, color: "bg-red-500" },
  //   ],
  // }*/}