import axios from "axios";

const COLLABORATION_SERVICE_URL = "http://localhost:3002/collaboration/"

const api = axios.create({
    baseURL : COLLABORATION_SERVICE_URL,
    withCredentials : true
})

async function getCollaborationInformation(userId : string) {
    return await api.get(COLLABORATION_SERVICE_URL + userId).then(response => {
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

export { getCollaborationInformation }