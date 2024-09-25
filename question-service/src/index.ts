import express, { Application, Request, Response } from 'express'
import { PORT, QUESTION_SERVICE_MONGODB_URL } from '../config'
// import cors from 'cors'
import questionsRoute from './routes/questionsRoute'
import mongoose from 'mongoose'

const app: Application = express()
app.use(express.json())
const port: number = PORT

app.get('/', (req: Request, res: Response) => {
    console.log('good')
    res.send({
        message: "hello world"
    })
})

app.use('/questions', questionsRoute)

mongoose
    .connect(QUESTION_SERVICE_MONGODB_URL)
    .then(() => {
        console.log('MongoDB URL: ', QUESTION_SERVICE_MONGODB_URL)
        console.log('App connected to database');
        app.listen(PORT, () => {
            console.log(`App is listening to port: ${PORT}`);
        });
    })
    .catch((error) => {
        console.log(error.message);
    });