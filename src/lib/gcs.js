import axios from 'axios'

export async function getSignedUrl(fileName, action = 'read'){
    const response = await axios.get(`http://localhost:4000/gcs/signed_url?filename=${fileName}&action=${action}`)
    return response.data.signedUrl
}

export async function createSyncEvent(data){
    const response = await axios.post(`http://localhost:4000/gcs/create_sync_event`, data)
    return response.data
}