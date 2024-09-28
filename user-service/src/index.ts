import express, { Application, Request, Response } from 'express'
import { PORT, USER_SERVICE_MONGO_URI } from '../utils/config'
// import cors from 'cors'
import authenticationRoute from './routes/authenticationRoute'


const app: Application = express()
app.use(express.json())
const port: number = Number(PORT) | 4000

app.use('/authentication', authenticationRoute)