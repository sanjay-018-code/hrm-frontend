import axios from "axios";
import config from "../config.json";
import { getJWT } from "./auth";

export const apiClient = axios.create({
    baseURL: config.backend_url,
    headers:{
        "Content-Type":"application/json"
    }
});

apiClient.interceptors.request.use(
    requestConfig => {
        const token = getJWT()

        if(token){
            requestConfig.headers.Authorization = `Bearer ${token}`
        }

        return requestConfig
    },
    (error) => Promise.reject(error)
)
