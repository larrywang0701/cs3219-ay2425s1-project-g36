import { Router, Request, Response } from 'express'
import { Question } from '../models/questionModel'

const router: Router = Router()

// retrieves entire list of questions
router.get('/', async (req: Request, res: Response) => {
    try {
        const questions = await Question.find({}).sort({ title: 1 })

        return res.status(200).send({
            length: questions.length,
            data: questions
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            message: "Error retrieving list of questions"
        })
    }
})

// retrieves a specific question by id
router.get('/:id', async (req: Request, res: Response) => {
    const id = req.params.id
    
    try {
        const question = await Question.findById(id)

        return res.status(200).send(question)

    } catch (error) {
        console.log(error)
        return res.status(500).send({
            message: `Error retrieving question of id: ${id}`
        })
    }
})

// create a question
router.post('/', async (req: Request, res: Response) => {
    const question = req.body
    if (
        !question.title ||
        !question.difficulty ||
        !question.description
    ) {
        return res.status(400).send({
            message: "Title, difficulty, and description must not be empty"
        })
    }
    
    try {
        await Question.create(question)
        return res.status(200).send({
            message: "Question successfully created"
        }) 
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            message: "Error creating question"
        })
    }
})

// updates a question, identifed by id
router.put('/:id', async (req: Request, res: Response) => {
    const id = req.params.id
    const question = req.body
    if (
        !question.title ||
        !question.difficulty ||
        !question.description
    ) {
        return res.status(400).send({
            message: "Title, difficulty, and description must not be empty"
        })
    }

    try {
        await Question.findByIdAndUpdate(id, question)

        return res.status(200).send({
            message: "Question successfully updated"
        }) 

    } catch (error) {
        console.log(error)
        return res.status(500).send({
            message: "Error editting question"
        })
    }
})

// deletes a specific question by id
router.delete('/:id', async (req: Request, res: Response) => {
    const id = req.params.id
    
    try {
        await Question.findByIdAndDelete(id)
        
        return res.status(200).send({
            message: `Successfully delete question with id: ${id}`
        })

    } catch (error) {
        console.log(error)
        return res.status(500).send({
            message: `Error deleting question of id: ${id}`
        })
    }
})

export default router

/*

TODO: (for zac's convenience, will be deleted later)
1. have more specific error handling for all API endpoints (check chatGPT for explanation)
2. handle duplicates when creating a question
3. convert question-service.js to typescript

*/



/*

{
    "title": "Word Search II",
    "difficulty": "hard",
    "description": "brute force is the way",
    "topics": ["brute force"]
}

{
    "title": "N queens",
    "difficulty": "hard",
    "description": "I like searching through arrays",
    "topics": ["DP", "array"]
}
    
{
    "title": "Longest Common Subsequence",
    "difficulty": "medium",
    "description": "DP is too easy",
    "topics": ["stack", "DP"]
}

*/