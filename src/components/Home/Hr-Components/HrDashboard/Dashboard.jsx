import React from 'react'
import { useState, useEffect } from 'react'

import AttendancePieChart from './Piechart'

import { apiClient } from '../../../../utils/api-client'
import { getCurrentUser } from '../../../../utils/auth'
import DashboardCard from './DashboardCard'

const Dashboard = ({ workspaceLabel = 'HR Workspace', dashboardTitle = 'HR Dashboard', routePrefix = '/hr', showAdminReports = false }) => {

  const [attendance, setAttendance] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchDashboard = async () => {
    await apiClient.get("/dashboard/").then(
      response => {
        setDashboard(response.data)
      }
    ).catch(error => {
      console.log(error);
      setError(error.message)
    })
  }


  const fetchAttendance = async () => {
    await apiClient.get("/dashboard/chart").then(
      response => {
        setAttendance(response.data)
      }
    ).catch(error => {
      console.log(error);
      setError(error.message)
    })
  }

  const handleRefresh = async () => {
    setLoading(true)
    setError("")
    await Promise.all([fetchAttendance(), fetchDashboard()])
    setLoading(false)
  }

  useEffect(() => {
    fetchAttendance()
    fetchDashboard()
  }, [])

  const user = getCurrentUser()

  return (
    <main className='min-h-screen bg-slate-100 p-4 text-slate-900 md:p-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-wide text-slate-500'>{workspaceLabel}</p>
            <h1 className='text-3xl font-bold'>{dashboardTitle}</h1>
            {user && <p className='mt-2 text-lg font-semibold text-slate-700'>Welcome {user.username}!</p>}
          </div>
          <button
            type='button'
            onClick={handleRefresh}
            disabled={loading}
            className='rounded bg-slate-800 px-4 py-2 font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400'
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && <p className='mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{error}</p>}

        <DashboardCard data={dashboard} routePrefix={routePrefix} showAdminReports={showAdminReports} />

        <section className='mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-center text-2xl font-bold text-slate-900'>Attendance</h2>
          {!attendance && !error && <p className='text-center text-slate-600'>Loading attendance chart...</p>}
          <AttendancePieChart attendance={attendance} />
        </section>
      </div>
    </main>
  )
}

export default Dashboard
