# PeerPrep Backend for Question Service - Developer Readme 

## Quick Start

- This backend service uses <b>npm</b> as the package manager
- Why not yarn? Because I was too lazy to switch to yarn

### How to run backend server

1. Add the `QUESTION_SERVICE_MONGODB_URL` (which zac sent in tele chat) into the `.env` file
2. Run `npm run dev` (make sure you are in the `backend` directory)
    - If it works, you should see the following console logs in your terminal
  ```
    MongoDB URL:  <the URL>
    App connected to database
    App is listening to port: 3000
  ```
3. FYI: I used the nodemon dependency so that you can save your code changes and the backend server will automatically restart (observe your terminal for more information)

### Things to take note if you face some issues running the application

1. If you see the following, try connecting to VPN before running the application
  ```
    querySrv ETIMEOUT _mongodb._tcp.peerprep.reijg.mongodb.net
  ```
2. Any further troubles direct to @z_acwon_g on telegram (pls dont)

### Example queries to run on Postman

1. `GET http://localhost:3000/questions`
    - Retrieves all the questions

2. `GET http://localhost:3000/questions/:id`
    - Retrieves a specific question by id

3. `POST http://localhost:3000/questions`
    - Create a question with a question JSON object
    ```
        {
            "title": "Word Search II",
            "difficulty": "hard",
            "description": "brute force is the way",
            "topics": ["brute force"]
        }
    ```

4. `PUT http://localhost:3000/questions/:id`
    - Update a question by id with a question JSON object

5. `DELETE http://localhost:3000/questions/:id`
    - Deletes a specific question by id