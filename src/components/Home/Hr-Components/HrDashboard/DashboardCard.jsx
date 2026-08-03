import React from 'react'
import { useNavigate } from 'react-router-dom'

const cardStyles = {
  total_employees: 'border-slate-200 bg-slate-50 text-slate-800',
  total_departments: 'border-slate-200 bg-slate-50 text-slate-800',
  present_today: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  absent_today: 'border-red-200 bg-red-50 text-red-800',
}

const DashboardCard = ({ data, routePrefix = '/hr', showAdminReports = false }) => {
  const navigate = useNavigate()
  const safeData = data ?? {}
  const cards = [
    { key: 'total_employees', label: 'Total Employees', value: safeData.total_employees ?? 0, route: `${routePrefix}/employees` },
    { key: 'total_departments', label: 'Total Departments', value: safeData.total_departments ?? 0, route: `${routePrefix}/departments` },
    { key: 'present_today', label: 'Present Today', value: safeData.present_today ?? 0, route: `${routePrefix}/attendance` },
    { key: 'absent_today', label: 'Absent Today', value: safeData.absent_today ?? 0, route: `${routePrefix}/attendance` }
  ]

  const handleClick = (route) => {
    if (route) {
      navigate(route)
    }
  }

  const handleLeaveClick = () => {
    navigate(`${routePrefix}/leave`)
  }
  const handleAttClick = () => {
    navigate(`${routePrefix}/attendance`)
  }
  const handlePayrollClick = () => {
    navigate(`${routePrefix}/payroll`)
  }
  const handleUserManagementClick = () => {
    navigate(`${routePrefix}/users`)
  }

  return (
    <div className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {data && cards.map((card) => (
        <div
          key={card.key}
          onClick={() => handleClick(card.route)}
          className={`rounded-lg border p-4 ${cardStyles[card.key]} cursor-pointer hover:opacity-90`}
        >
          <p className='text-sm font-semibold'>{card.label}</p>
          <p className='mt-1 text-3xl font-bold'>{card.value}</p>
        </div>
      ))}

      {data && (
        <div
          className='flex cursor-pointer items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 hover:opacity-90 sm:col-span-2'
          onClick={handleLeaveClick}
        >
          <p className='text-sm font-semibold'>Pending Leave</p>
          <p className='text-3xl font-bold text-amber-950'>{safeData.pending_leaves ?? 0}</p>
        </div>
      )}

      <div
        className='flex cursor-pointer items-center justify-center rounded-lg bg-slate-800 p-4 text-lg font-bold text-white hover:bg-slate-700 sm:col-span-1'
        onClick={handleAttClick}
      >
        Mark Attendance
      </div>
      <div
        className='flex cursor-pointer items-center justify-center rounded-lg bg-slate-800 p-4 text-lg font-bold text-white hover:bg-slate-700 sm:col-span-1'
        onClick={handlePayrollClick}
      >
        Payroll
      </div>
      <div
        className={showAdminReports ? 
          'flex cursor-pointer items-center justify-center rounded-lg bg-purple-700 p-4 text-lg font-bold text-white hover:bg-purple-600 sm:col-span-2'
          : 'flex cursor-pointer items-center justify-center rounded-lg bg-purple-700 p-4 text-lg font-bold text-white hover:bg-purple-600 sm:col-span-4'
        }
        onClick={handleUserManagementClick}
      >
        User Management
      </div>
      {showAdminReports && (
        <div
          className='flex cursor-pointer items-center justify-center rounded-lg bg-indigo-700 p-4 text-lg font-bold text-white hover:bg-indigo-600 sm:col-span-2'
          onClick={() => handleClick(`${routePrefix}/reports`)}
        >
          Payroll Reports
        </div>
      )}
    </div>
  )
}

export default DashboardCard
