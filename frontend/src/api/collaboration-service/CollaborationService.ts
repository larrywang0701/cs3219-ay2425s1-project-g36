import axios from "axios";

const COLLABORATION_SERVICE_URL = "http://localhost:3002/"
const COLLABORATION_BASE_URL = "/collaboration"
const REMOVE_USER_URL = "/remove"
const IS_USER_IN_STORE_URL = "/in-store"

const api = axios.create({
    baseURL : COLLABORATION_SERVICE_URL,
    withCredentials : true
})

// Frontend uses this function to retrieve collaboration details
async function getCollabInfo(userId : string) {
    return await api.get(COLLABORATION_BASE_URL + `/${userId}`).then(response => {
      return {
        status : response.status, 
        message : response.data.message,
        data: response.data.data
      }
    }).catch(error => {
      return {
        status : error.status,
        message : error.response.data.message,
        data: null
      }
    })
}

// When user ends a session/logs out, remove the user from collabStore
async function removeUserFromCollabStore(userId: string) {
  return await api.post(COLLABORATION_BASE_URL + REMOVE_USER_URL +  `/${userId}`).then(response => {
    return {
      status : response.status, 
      message : response.data.message,
    }
  }).catch(error => {
    return {
      status : error.status,
      message : error.response.data.message,
    }
  })
}

// Checks if userId is in collabStore. Used to verify a user that is attempting to enter a collaboration room
async function isUserInCollabStore(userId: string) {
  return await api.get(COLLABORATION_BASE_URL + IS_USER_IN_STORE_URL + `/${userId}`).then(response => {
    return {
      status : response.status, 
      message : response.data.message,
    }
  }).catch(error => {
    return {
      status : error.status,
      message : error.response.data.message,
    }
  })
}

export { getCollabInfo, removeUserFromCollabStore, isUserInCollabStore }