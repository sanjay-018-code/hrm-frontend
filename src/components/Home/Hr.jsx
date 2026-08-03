import React from 'react'
import { Navigate } from 'react-router-dom';
import Dashboard from './Hr-Components/HrDashboard/Dashboard';
import { isAuthenticated } from '../../utils/auth';
import Navbar from '../Navbar/Navbar';

const Hr = () => {
    if(!isAuthenticated()){
        return <Navigate to="/" replace />
    }
    return(
        <div>
            <Navbar title="HR Management System" />
            <Dashboard/>
        </div>
    )
}

export default Hr;
