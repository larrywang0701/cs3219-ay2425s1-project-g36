import axios from "axios";

const COLLABORATION_SERVICE_URL = "http://localhost:3002/"
const COLLABORATION_BASE_URL = "/collaboration"
const REMOVE_USER_URL = "/remove"

const api = axios.create({
    baseURL : COLLABORATION_SERVICE_URL,
    withCredentials : true
})

async function getCollaborationInformation(userId : string) {
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

async function removeUserFromUserStore(userId: string) {
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

export { getCollaborationInformation, removeUserFromUserStore }