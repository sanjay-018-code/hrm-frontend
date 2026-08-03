import React, { useEffect, useState } from 'react'
import { get_all_attendance } from '../../../services/attendanceServices'

const EmployeeAttendanceView = ({ employeeId }) => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!employeeId) return
    const fetchAttendance = async () => {
      setLoading(true)
      try {
        const data = await get_all_attendance(1, 50, employeeId)
        setRecords(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to fetch attendance:', err)
        setError('Unable to load attendance log.')
      } finally {
        setLoading(false)
      }
    }
    fetchAttendance()
  }, [employeeId])

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase()
    if (s === 'present') {
      return <span className='inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800'>Present</span>
    }
    if (s === 'late') {
      return <span className='inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800'>Late</span>
    }
    return <span className='inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800'>{status || 'Absent'}</span>
  }

  if (loading) {
    return (
      <main className='min-h-screen bg-slate-100 p-4 text-slate-900 md:p-8'>
        <div className='mx-auto max-w-7xl'>
          <div className='rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm'>
            <p className='text-sm text-slate-500'>Loading attendance logs...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className='min-h-screen bg-slate-100 p-4 text-slate-900 md:p-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-wide text-slate-500'>Employee Workspace</p>
            <h1 className='text-3xl font-bold'>Attendance</h1>
          </div>
        </div>

        {error && <p className='mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{error}</p>}

        {records.length === 0 ? (
          <div className='rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center'>
            <p className='text-base font-semibold text-slate-700'>No attendance records found</p>
            <p className='mt-1 text-sm text-slate-500'>Your logged daily attendance will be listed here.</p>
          </div>
        ) : (
          <div className='overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'>
            <table className='w-full text-left text-sm text-slate-700'>
              <thead className='bg-slate-50 text-xs uppercase text-slate-500'>
                <tr>
                  <th className='px-6 py-3'>Date</th>
                  <th className='px-6 py-3'>Check-In Time</th>
                  <th className='px-6 py-3'>Check-Out Time</th>
                  <th className='px-6 py-3'>Status</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-200'>
                {records.map((item) => (
                  <tr key={item.id || item._id} className='hover:bg-slate-50'>
                    <td className='px-6 py-4 font-semibold text-slate-900'>{item.date}</td>
                    <td className='px-6 py-4 text-slate-600'>{item.check_in || 'N/A'}</td>
                    <td className='px-6 py-4 text-slate-600'>{item.check_out || 'N/A'}</td>
                    <td className='px-6 py-4'>{getStatusBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}

export default EmployeeAttendanceView
