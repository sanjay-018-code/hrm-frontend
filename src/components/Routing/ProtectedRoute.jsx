import React from 'react'
import { Navigate } from 'react-router-dom'

import { getCurrentUser , isAuthenticated} from '../../utils/auth'

const ProtectedRoute = ({children, allowedRoles}) => {
    if(!isAuthenticated()){
        return <Navigate to="/" replace />
    }

    const user = getCurrentUser()

    if(!user || !allowedRoles.includes(user.role)){
        return <Navigate to="/" replace />
    }
    return children;
}

export default ProtectedRoute;
