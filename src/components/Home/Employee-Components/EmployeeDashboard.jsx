import React, { useEffect, useState } from "react";
import { get_employee_by_id } from "../../../services/employeeServices";
import { getCurrentUser } from "../../../utils/auth";

const EmployeeDashboard = ({employeeId}) =>{
 const [details, setDetails] = useState()
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(null)

 const fetchDetails = async ()=>{
  if (!employeeId || employeeId === 'null') {
    setError('No employee ID provided')
    setLoading(false)
    return
  }
  try {
    const user = await get_employee_by_id(employeeId)
    setDetails(user)
    setLoading(false)
  } catch (err) {
    setError(err.message || 'Failed to load employee details')
    setLoading(false)
  }
 }

 useEffect(()=>{
  fetchDetails()
},[employeeId])

 const currentUser = getCurrentUser()

 if (loading) return <div className="p-8 text-center text-slate-600">Loading employee details...</div>
 if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>

  return(
    <main className='min-h-screen bg-slate-100 p-4 text-slate-900 md:p-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-wide text-slate-500'>Employee Workspace</p>
            <h1 className='text-3xl font-bold'>Employee Dashboard</h1>
            {currentUser && <p className='mt-2 text-lg font-semibold text-slate-700'>Welcome {currentUser.username}!</p>}
          </div>
        </div>

        {error && <p className='mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{error}</p>}

        {details ? (
          <section className='overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-sm'>
            <h2 className='mb-6 text-2xl font-bold text-slate-900'>Employee Details</h2>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
                <p className='text-sm font-semibold text-slate-500'>Name</p>
                <p className='mt-1 uppercase text-lg font-medium text-slate-900'>{details.name}</p>
              </div>
              <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
                <p className='text-sm font-semibold text-slate-500'>Employee ID</p>
                <p className='mt-1 text-lg font-medium text-slate-900'>{details.id}</p>
              </div>
              <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
                <p className='text-sm font-semibold text-slate-500'>Department</p>
                <p className='mt-1 uppercase text-lg font-medium text-slate-900'>{details.department}</p>
              </div>
              <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
                <p className='text-sm font-semibold text-slate-500'>Designation</p>
                <p className='mt-1 uppercase text-lg font-medium text-slate-900'>{details.designation || 'N/A'}</p>
              </div>
              <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
                <p className='text-sm font-semibold text-slate-500'>Email</p>
                <p className='mt-1 text-lg font-medium text-slate-900'>{details.email}</p>
              </div>
              <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
                <p className='text-sm font-semibold text-slate-500'>Phone</p>
                <p className='mt-1 text-lg font-medium text-slate-900'>{details.phone || 'N/A'}</p>
              </div>
              <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
                <p className='text-sm font-semibold text-slate-500'>Join Date</p>
                <p className='mt-1 text-lg font-medium text-slate-900'>{details.joining_date || 'N/A'}</p>
              </div>
              <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
                <p className='text-sm font-semibold text-slate-500'>Salary</p>
                <p className='mt-1 text-lg font-medium text-slate-900'>₹{details.salary ? Number(details.salary).toLocaleString('en-IN') : 'N/A'}</p>
              </div>
            </div>
          </section>
        ) : (
          <div className='rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm'>
            <p className='text-slate-600'>No employee details available</p>
          </div>
        )}
      </div>
    </main>
  )
}

export default EmployeeDashboard  