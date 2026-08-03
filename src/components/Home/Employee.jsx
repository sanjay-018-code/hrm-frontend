import React, {useEffect, useState} from 'react'
import { Navigate } from 'react-router-dom'
import Navbar from '../Navbar/Navbar'
import EmployeeDashboard from './Employee-Components/EmployeeDashboard'
import EmployeePayrollView from './Employee-Components/EmployeePayrollView'
import EmployeeAttendanceView from './Employee-Components/EmployeeAttendanceView'
import EmployeeLeaveView from './Employee-Components/EmployeeLeaveView'
import { isAuthenticated, getCurrentUser } from '../../utils/auth'

const Employee = () => {
    const [user, setuser] = useState(null)
    const [selectedView, setSelectedView] = useState('dashboard')
    
    const fetchUser =  () => {
        const currentUser = getCurrentUser()
        if (currentUser && currentUser.employee_id) {
            setuser(currentUser.employee_id)
        }
    }
    useEffect(()=>{
        fetchUser()
    },[])

    if (!isAuthenticated()) {
        return <Navigate to="/" replace />
    }

    const renderComponent = () => {
        switch(selectedView) {
            case 'dashboard':
                return <EmployeeDashboard employeeId={user} />
            case 'payroll':
                return <EmployeePayrollView employeeId={user} />
            case 'attendance':
                return <EmployeeAttendanceView employeeId={user} />
            case 'leave':
                return <EmployeeLeaveView employeeId={user} />
            default:
                return <EmployeeDashboard employeeId={user} />
        }
    }

    return (
        <div>
            <Navbar title="Employee Portal" />
            {user ? (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg">
                        <div 
                            className={`px-4 py-2 text-lg font-semibold text-center cursor-pointer hover:bg-purple-400 ${selectedView === 'dashboard' ? 'bg-purple-600 text-white' : 'bg-purple-200'}`}
                            onClick={() => setSelectedView('dashboard')}
                        >
                            Dashboard
                        </div>
                        <div 
                            className={`px-4 py-2 text-lg font-semibold text-center cursor-pointer hover:bg-purple-400 ${selectedView === 'payroll' ? 'bg-purple-600 text-white' : 'bg-purple-200'}`}
                            onClick={() => setSelectedView('payroll')}
                        >
                            Payroll
                        </div>
                        <div 
                            className={`px-4 py-2 text-lg font-semibold text-center cursor-pointer hover:bg-purple-400 ${selectedView === 'attendance' ? 'bg-purple-600 text-white' : 'bg-purple-200'}`}
                            onClick={() => setSelectedView('attendance')}
                        >
                            Attendance
                        </div>
                        <div 
                            className={`px-4 py-2 text-lg font-semibold text-center cursor-pointer hover:bg-purple-400 ${selectedView === 'leave' ? 'bg-purple-600 text-white' : 'bg-purple-200'}`}
                            onClick={() => setSelectedView('leave')}
                        >
                            Leave
                        </div>
                    </div>
                    <div className="p-4">
                        {renderComponent()}
                    </div>
                </>
            ) : (
                <div className="p-8 text-center">Loading employee data...</div>
            )}
        </div>
    )
} 

export default Employee