import {jwtDecode} from "jwt-decode"

const TOKEN_STORAGE_KEY = "token"

export function cleanupExpiredToken(){
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)

    if(!token){
        return
    }

    try{
        const { exp } = jwtDecode(token)

        if(!exp || exp * 1000 <= Date.now()){
            localStorage.removeItem(TOKEN_STORAGE_KEY)
        }
    }catch{
        localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
}

export function getJWT(){
    cleanupExpiredToken()
    return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function getCurrentUser(){
    const token = getJWT()    
    if(!token){
        return null
    }
    try{
        return jwtDecode(token)
    }catch(error){
        return null
    }
}

export function isAuthenticated(){
    return !!getJWT()
}

export function logout(){
    localStorage.removeItem(TOKEN_STORAGE_KEY)
}
