import React from 'react'
import Dashboard from './Hr-Components/HrDashboard/Dashboard'
import Navbar from '../Navbar/Navbar'

const Admin = () => {
    return (
        <div>
            <Navbar title="Admin Management System" />
            <Dashboard workspaceLabel='Admin Workspace' dashboardTitle='Admin Dashboard' routePrefix='/admin' showAdminReports />
        </div>
    )
}

export default Admin;
