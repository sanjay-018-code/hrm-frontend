import React, { useEffect, useState } from 'react'
import { create_leave, get_all_leaves } from '../../../services/leaveServices'

const EmployeeLeaveView = ({ employeeId }) => {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [formData, setFormData] = useState({
    leave_type: 'Casual Leave',
    start_date: '',
    end_date: '',
    reason: '',
  })

  const fetchLeaves = async () => {
    setLoading(true)
    try {
      const data = await get_all_leaves()
      const list = Array.isArray(data) ? data : []
      const userLeaves = employeeId ? list.filter((l) => l.employee_id === employeeId) : list
      setLeaves(userLeaves)
    } catch (err) {
      console.error('Failed to fetch leaves:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaves()
  }, [employeeId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.start_date || !formData.end_date) {
      setMessage({ type: 'error', text: 'Please fill in both start and end dates.' })
      return
    }
    setSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      await create_leave({
        employee_id: employeeId || '6a4a6d0edd6d813edb463b63',
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason,
      })

      setMessage({ type: 'success', text: 'Leave request submitted successfully!' })
      setFormData({
        leave_type: 'Casual Leave',
        start_date: '',
        end_date: '',
        reason: '',
      })
      await fetchLeaves()
    } catch (err) {
      console.error('Failed to submit leave:', err)
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to submit leave request.' })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase()
    if (s === 'approved') {
      return <span className='inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800'>Approved</span>
    }
    if (s === 'rejected') {
      return <span className='inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800'>Rejected</span>
    }
    return <span className='inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800'>Pending</span>
  }

  return (
    <main className='min-h-screen bg-slate-100 p-4 text-slate-900 md:p-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-wide text-slate-500'>Employee Workspace</p>
            <h1 className='text-3xl font-bold'>Leave Management</h1>
          </div>
        </div>

        <div className='grid gap-8 lg:grid-cols-3'>
          {/* Leave Application Form */}
          <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1'>
            <h3 className='mb-4 text-lg font-bold text-slate-900'>Apply for Leave</h3>
            <p className='mb-4 text-xs text-slate-500'>Submit a time-off request for HR approval</p>

            {message.text && (
              <div
                className={`mb-4 rounded p-3 text-xs font-semibold ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-xs font-semibold text-slate-700'>Leave Type</label>
                <select
                  value={formData.leave_type}
                  onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                  className='mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-700'
                >
                  <option value='Casual Leave'>Casual Leave</option>
                  <option value='Sick Leave'>Sick Leave</option>
                  <option value='Annual Leave'>Annual Leave</option>
                  <option value='Unpaid Leave'>Unpaid Leave</option>
                </select>
              </div>

              <div>
                <label className='block text-xs font-semibold text-slate-700'>Start Date</label>
                <input
                  type='date'
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  className='mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-700'
                />
              </div>

              <div>
                <label className='block text-xs font-semibold text-slate-700'>End Date</label>
                <input
                  type='date'
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                  className='mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-700'
                />
              </div>

              <div>
                <label className='block text-xs font-semibold text-slate-700'>Reason</label>
                <textarea
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder='Brief explanation...'
                  className='mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-700'
                />
              </div>

              <button
                type='submit'
                disabled={submitting}
                className='w-full rounded bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400'
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>

          {/* Leave History List */}
          <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2'>
            <h3 className='mb-4 text-lg font-bold text-slate-900'>My Leave Requests</h3>
            <p className='mb-4 text-xs text-slate-500'>Track status of previous leave submissions</p>

            {loading ? (
              <p className='text-sm text-slate-500'>Loading requests...</p>
            ) : leaves.length === 0 ? (
              <div className='rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500'>
                No leave requests submitted yet.
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full text-left text-sm text-slate-700'>
                  <thead className='bg-slate-50 text-xs uppercase text-slate-500'>
                    <tr>
                      <th className='px-4 py-3'>Type</th>
                      <th className='px-4 py-3'>Duration</th>
                      <th className='px-4 py-3'>Reason</th>
                      <th className='px-4 py-3'>Status</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-200'>
                    {leaves.map((item) => (
                      <tr key={item.id || item._id} className='hover:bg-slate-50'>
                        <td className='px-4 py-3 font-semibold text-slate-800'>{item.leave_type}</td>
                        <td className='px-4 py-3 text-xs text-slate-600'>
                          {item.start_date} to {item.end_date}
                        </td>
                        <td className='px-4 py-3 text-xs text-slate-600'>{item.reason || '—'}</td>
                        <td className='px-4 py-3'>{getStatusBadge(item.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default EmployeeLeaveView
