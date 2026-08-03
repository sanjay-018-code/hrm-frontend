import { apiClient } from "../utils/api-client";

export async function login(user){
    const {data} = await apiClient.post("/auth/login",user)
    localStorage.setItem("token",data.access_token)
    return data
}

export async function register(user){
    const {data} = await apiClient.post("/auth/register",user)
    return data
}

export async function createUser(user){
    const response = await apiClient.post("/users/", user)
    return response.data
}

export function logout(){
    localStorage.removeItem("token")
    window.location.href = "/"
}

export async function getAllUsers(){
    const response = await apiClient.get("/users")
    return response.data
}

export async function getUserById(userId){
    const response = await apiClient.get(`/users/${userId}`)
    return response.data
}

export async function updateUser(userId, userData){
    const response = await apiClient.put(`/users/${userId}`, userData)
    return response.data
}

export async function deleteUser(userId){
    const response = await apiClient.delete(`/users/${userId}`)
    return response.data
}

export async function getUsersByRole(role){
    const users = await getAllUsers()
    return users.filter(user => user.role === role)
}

export async function requestForgotUsername(payload){
    const { data } = await apiClient.post('/auth/forgot-username', payload)
    return data
}

export async function requestForgotPassword(payload){
    const { data } = await apiClient.post('/auth/forgot-password', payload)
    return data
}

export async function getRecoveryRequests(){
    const { data } = await apiClient.get('/auth/recovery-requests')
    return data
}

export async function updateRecoveryRequest(requestId, payload){
    const { data } = await apiClient.patch(`/auth/recovery-requests/${requestId}`, payload)
    return data
}
