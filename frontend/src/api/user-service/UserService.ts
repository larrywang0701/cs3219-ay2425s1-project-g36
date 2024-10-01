import axios from "axios";


const USER_SERVICE_URL = "http://localhost:4000";

const api = axios.create({baseURL: USER_SERVICE_URL});

async function sendLoginRequest(username : string, password : string, captcha : string) {
    const loginData = {
        email : username,
        password : password,
        captcha : captcha
    }
    return await api.post("/authentication/login", loginData).then(response => {
        const userInfo = {
            isAdmin: username === "Admin" ? true : false // TODO: This information should be told by the response from the backend.
        }
        return {status: response.status, message: response.data.message, userInfo: userInfo};
    }).catch(error => {
        //console.log(error);
        return {status: error.status, message: error.response.data.message, userInfo: null};
    })
}

export { sendLoginRequest };