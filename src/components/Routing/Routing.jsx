import { Routes, Route } from "react-router-dom"

import ProtectedRoute from "./ProtectedRoute"
import Login from "../login/Login"

import Hr from "../Home/Hr"
import EmployeeList from "../Home/Hr-Components/Hr-employee/EmployeeList"
import Attendance from './../Home/Hr-Components/HrAttendance/Attendance';
import Departments from "../Home/Hr-Components/HrDepartments/Departments"
import HrLeave from "../Home/Hr-Components/HrLeave/HrLeave"
import Payroll from "../Home/Hr-Components/HrPayroll/Payroll"
import UserManagement from "../Home/Hr-Components/UserManagement/UserManagement"

import Admin from "../Home/Admin"
import AdminReports from "../Home/AdminReports"

import Employee from "../Home/Employee"

const managementRoles = ["hr", "admin"]

const Routing = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}> <Admin /> </ProtectedRoute>} />
      <Route path="/admin/employees" element={<ProtectedRoute allowedRoles={["admin"]}><EmployeeList workspaceLabel="Admin Workspace" /> </ProtectedRoute>} />
      <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={["admin"]}><Departments workspaceLabel="Admin Workspace" /> </ProtectedRoute>} />
      <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={["admin"]}><Attendance workspaceLabel="Admin Workspace" /> </ProtectedRoute>} />
      <Route path="/admin/leave" element={<ProtectedRoute allowedRoles={["admin"]}><HrLeave workspaceLabel="Admin Workspace" /> </ProtectedRoute>}/>
      <Route path="/admin/payroll" element={<ProtectedRoute allowedRoles={["admin"]}><Payroll workspaceLabel="Admin Workspace" /> </ProtectedRoute>}/>
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><UserManagement workspaceLabel="Admin Workspace" /> </ProtectedRoute>}/>
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={["admin"]}><AdminReports /> </ProtectedRoute>}/>

      <Route path="/hr" element={<ProtectedRoute allowedRoles={["hr"]}> <Hr /> </ProtectedRoute>} />
      <Route path="/hr/employees" element={<ProtectedRoute allowedRoles={managementRoles}><EmployeeList/> </ProtectedRoute>} />
      <Route path="/hr/departments" element={<ProtectedRoute allowedRoles={managementRoles}><Departments/> </ProtectedRoute>} />
      <Route path="/hr/attendance" element={<ProtectedRoute allowedRoles={managementRoles}><Attendance/> </ProtectedRoute>} />
      <Route path="/hr/leave" element={<ProtectedRoute allowedRoles={managementRoles}><HrLeave/> </ProtectedRoute>}/>
      <Route path="/hr/payroll" element={<ProtectedRoute allowedRoles={managementRoles}><Payroll/> </ProtectedRoute>}/>
      <Route path="/hr/users" element={<ProtectedRoute allowedRoles={managementRoles}><UserManagement workspaceLabel="HR Workspace" /> </ProtectedRoute>}/>

      <Route path="/employee" element={<ProtectedRoute allowedRoles={["employee"]}> <Employee /> </ProtectedRoute>} />

    </Routes>
  )
}

export default Routing
