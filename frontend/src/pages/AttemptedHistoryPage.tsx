import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarIcon, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sidebar, SidebarContent, SidebarProvider, } from "@/components/ui/sidebar";
import PageHeader from "@/components/common/PageHeader";

interface Attempt {
  id: string
  timeSubmitted: string
  questionTitle: string
  questionUrl: string
  language: string
}

const ITEMS_PER_PAGE = 10

const fetchSubmissions = async (page: number): Promise<{ submissions: Attempt[], totalPages: number }> => {
  // Replace this with your actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const allSubmissions = Array(50).fill(null).map((_, i) => ({
        id: `submission-${i + 1}`,
        timeSubmitted: `${Math.floor(i / 7) + 1} week${Math.floor(i / 7) > 0 ? 's' : ''} ago`,
        questionTitle: `Question ${i + 1}`,
        questionUrl: `/questions/question-${i + 1}`,
        status: i % 3 === 0 ? 'Accepted' : 'Wrong Answer',
        runtime: i % 3 === 0 ? `${(i + 1) * 5} ms` : 'N/A',
        language: 'python3'
      }))

      const totalPages = Math.ceil(allSubmissions.length / ITEMS_PER_PAGE)
      const startIndex = (page - 1) * ITEMS_PER_PAGE
      const endIndex = startIndex + ITEMS_PER_PAGE
      const paginatedSubmissions = allSubmissions.slice(startIndex, endIndex)

      resolve({
        submissions: paginatedSubmissions,
        totalPages: totalPages
      })
    }, 30) // Simulate network delay
  })
}

export default function AttemptedHistoryPage() {
  const [submissions, setSubmissions] = useState<Attempt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [attemptedQuestions, setAttemptedQuestions] = useState({
    total: 0,
    accepted: 0,
    wrongAnswer: 0
  })
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);

  // This would come from your data source in a real application
  const stats = {
    total: { completed: 297, total: 3339 },
    categories: [
      { name: "Easy", completed: 101, total: 831, color: "bg-green-500" },
      { name: "Medium", completed: 169, total: 1748, color: "bg-yellow-500" },
      { name: "Hard", completed: 27, total: 760, color: "bg-red-500" },
    ],
  }

  // Simulate completed days (in a real app, this would come from your data)
  useEffect(() => {
    const days = []
    for (let i = 1; i <= 19; i++) {
      const day = new Date(2024, 9, i) // October 2024
      days.push(day)
    }
    setSelectedDays(days)
  }, [])

  useEffect(() => {
    const loadSubmissions = async () => {
      setIsLoading(true)
      try {
        const { submissions, totalPages } = await fetchSubmissions(currentPage)
        setSubmissions(submissions)
        setTotalPages(totalPages)
        setIsLoading(false)
      } catch (err) {
        setError('Failed to fetch submissions')
        setIsLoading(false)
      }
    }

    loadSubmissions()
  }, [currentPage])

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages))
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>An error occurred: {error}</div>
  return (
      <>
      <PageHeader />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Submission History</h1>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-3/4"> {/* Increase table width */}
            <Table className="rounded-2xl"> 
              <TableHeader className="bg-black-100">
                <TableRow>
                  <TableHead>Time Submitted</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Language</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id} className="border-b border-black-300 h-16">
                    <TableCell className="px-4 py-1 text-muted-foreground"> {/* Add padding to each cell */}
                      {submission.timeSubmitted}
                    </TableCell>
                    <TableCell className="px-4 py-1">
                      <Link 
                        to={"/questions"}
                        className="text-blue-500 hover:text-blue-700 hover:underline"
                      >
                        {submission.questionTitle}
                      </Link>
                    </TableCell>
                    <TableCell className="px-4 py-1 text-muted-foreground"> {/* Add padding to each cell */}
                      {submission.language}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-end items-center space-x-2"> 
              <span>Page {currentPage} of {totalPages}</span>
              <Button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="ml-2"
              >
                Previous
              </Button>
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
          <div className="lg:w-1/4 space-y-6 ml-auto" style={{ minWidth: "250px", maxWidth: "300px" }}> {/* Fix the calendar's min-width and max-width */}
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
                  style={{ width: "100%", height: "auto" }} /* Ensure responsive calendar */
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
                      {attemptedQuestions.total}
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
        </div>
      </div>
    </>
    );
}