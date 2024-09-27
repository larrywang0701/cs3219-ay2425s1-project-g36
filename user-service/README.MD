# PeerPrep Backend for User Service - Developer Readme 

## Quick Start

- This backend service uses <b>npm</b> as the package manager
- Why not yarn? Because i don't like.

### How to run backend server

+ 1. Run `npm i` in the `user-service` directory to install dependencies
+ 2. Add the `USER_SERVICE_MONGODB_URL` (which max has sent in tele chat) into the `.env` file (follow .env.sample)
+ 3. Run `npm run dev` (make sure you are in the `/user-service/` directory)
    - If it works, you should see the following console logs in your terminal
  ```
        Server is running on port 4000
        MongoDB connected: ac-ofwon3u-shard-00-01.mnir8bt.mongodb.net
  ```
4. FYI: I used the nodemon dependency so that you can save your code changes and the backend server will automatically restart (observe your terminal for more information)

Credit: Zac