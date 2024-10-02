import axios from "axios";


const USER_SERVICE_URL = "http://localhost:4000";
const AUTH_BASE_URL = "/authentication";
const LOGIN_API = "/login";
const RESET_PASSWORD_API = "/forgot-password";

const api = axios.create({baseURL: USER_SERVICE_URL});

/**
 * An async function for sending a login request to the backend.
 * @param username The username/email address.
 * @param password The password.
 * @param captcha The captcha value (when required).
 * @returns An object containing the HTTP status code of the request and the responded message from the backend.
 */
async function sendLoginRequest(username : string, password : string, captcha : string) {
  const loginData = {
    email : username,
    password : password,
    captcha : captcha
  }
  return await api.post(AUTH_BASE_URL + LOGIN_API, loginData).then(response =>
  {
    const userInfo = {
      isAdmin: username === "Admin" ? true : false // TODO: This information should be told by the response from the backend.
    }
    return {status: response.status, message: response.data.message, userInfo: userInfo};
  }).catch(error =>
  {
    return {status: error.status, message: error.response.data.message, userInfo: null};
  })
}


/**
 * An async function for sending a reset password request to the backend.
 * @param emailAddress The email address of the account for resetting password.
 * @returns An object containing the HTTP status code of the request and the responded message from the backend.
 */
async function sendResetPasswordRequest(emailAddress : string) {
  const requestBody = {
    email : emailAddress
  }
  return await api.post(AUTH_BASE_URL + RESET_PASSWORD_API, requestBody).then(response => {
    return {status: response.status, message: response.data.message};
  }).catch(error => {
    return {status: error.status, message: error.response.data.message};
  })
}

export { sendLoginRequest, sendResetPasswordRequest };