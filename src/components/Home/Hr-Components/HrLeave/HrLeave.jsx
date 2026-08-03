import React, { useEffect, useMemo, useState } from 'react'

import { get_all_leaves, update_leave_status } from '../../../../services/leaveServices'
import { get_all_employees } from '../../../../services/employeeServices'
import Navbar from '../../../Navbar/Navbar'

const statusClasses = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
}

const paidStatusClasses = {
  paid: 'bg-blue-100 text-blue-800',
  unpaid: 'bg-orange-100 text-orange-800',
}

const leaveTypes = ['Sick', 'Casual', 'Unpaid', 'Annual']

const formatDate = (date) => {
  const parsedDate = new Date(`${date}T00:00:00`)

  return Number.isNaN(parsedDate.getTime()) ? date : parsedDate.toLocaleDateString()
}

const HrLeave = ({ workspaceLabel = 'HR Workspace' }) => {
  const [leaves, setLeaves] = useState([])
  const [employees, setEmployees] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingLeaveId, setUpdatingLeaveId] = useState(null)
  const [editingLeaveType, setEditingLeaveType] = useState(null)
  const [newLeaveType, setNewLeaveType] = useState('')
  const [editingPaidStatus, setEditingPaidStatus] = useState(null)
  const [newPaidStatus, setNewPaidStatus] = useState('')

  const employeeMap = useMemo(() => {
    const map = {}
    employees.forEach((employee) => {
      map[employee.id] = { name: employee.name, department: employee.department }
    })
    return map
  }, [employees])

  const fetchLeaves = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await get_all_leaves()
      setLeaves(data)
    } catch (requestError) {
      setError(requestError.message || 'Unable to load leave requests.')
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const data = await get_all_employees(1, 100)
      const normalizedEmployees = Array.isArray(data) ? data : (data.employees || [])
      setEmployees(normalizedEmployees)
    } catch (requestError) {
      console.error('Failed to fetch employees:', requestError)
    }
  }

  useEffect(() => {
    fetchLeaves()
    fetchEmployees()
  }, [])

  const leaveCounts = useMemo(() => ({
    pending: leaves.filter((leave) => leave.status === 'pending').length,
    approved: leaves.filter((leave) => leave.status === 'approved').length,
    rejected: leaves.filter((leave) => leave.status === 'rejected').length,
  }), [leaves])

  const filteredLeaves = useMemo(() => {
    if (statusFilter === 'all') {
      return leaves
    }

    return leaves.filter((leave) => leave.status === statusFilter)
  }, [leaves, statusFilter])

  const handleStatusUpdate = async (leaveId, status) => {
    const action = status === 'approved' ? 'approve' : 'reject'

    if (!window.confirm(`Are you sure you want to ${action} this leave request?`)) {
      return
    }

    setUpdatingLeaveId(leaveId)
    setError('')

    try {
      const updatedLeave = await update_leave_status(leaveId, status)
      setLeaves((currentLeaves) => currentLeaves.map((leave) => (
        leave.id === leaveId ? updatedLeave : leave
      )))
    } catch (requestError) {
      setError(requestError.message || 'Unable to update the leave request.')
    } finally {
      setUpdatingLeaveId(null)
    }
  }

  const handleLeaveTypeUpdate = async (leaveId) => {
    if (!newLeaveType) {
      setError('Please select a leave type')
      return
    }

    setUpdatingLeaveId(leaveId)
    setError('')

    try {
      const updatedLeave = await update_leave_status(leaveId, null, newLeaveType)
      setLeaves((currentLeaves) => currentLeaves.map((leave) => (
        leave.id === leaveId ? updatedLeave : leave
      )))
      setEditingLeaveType(null)
      setNewLeaveType('')
    } catch (requestError) {
      setError(requestError.message || 'Unable to update leave type.')
    } finally {
      setUpdatingLeaveId(null)
    }
  }

  const handlePaidStatusUpdate = async (leaveId) => {
    if (!newPaidStatus) {
      setError('Please select a paid status')
      return
    }

    setUpdatingLeaveId(leaveId)
    setError('')

    try {
      const updatedLeave = await update_leave_status(leaveId, null, null, newPaidStatus)
      setLeaves((currentLeaves) => currentLeaves.map((leave) => (
        leave.id === leaveId ? updatedLeave : leave
      )))
      setEditingPaidStatus(null)
      setNewPaidStatus('')
    } catch (requestError) {
      setError(requestError.message || 'Unable to update paid status.')
    } finally {
      setUpdatingLeaveId(null)
    }
  }

  const startEditingLeaveType = (leave) => {
    setEditingLeaveType(leave.id)
    setNewLeaveType(leave.leave_type)
  }

  const cancelEditingLeaveType = () => {
    setEditingLeaveType(null)
    setNewLeaveType('')
    setError('')
  }

  const startEditingPaidStatus = (leave) => {
    setEditingPaidStatus(leave.id)
    setNewPaidStatus(leave.paid_status || 'paid')
  }

  const cancelEditingPaidStatus = () => {
    setEditingPaidStatus(null)
    setNewPaidStatus('')
    setError('')
  }

  return (
    <>
      <Navbar title="Leave Management" showBackButton={true} />
      <main className='min-h-screen bg-slate-100 p-4 text-slate-900 md:p-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-wide text-slate-500'>{workspaceLabel}</p>
            <h1 className='text-3xl font-bold'>Leave Management</h1>
          </div>
          <button
            type='button'
            onClick={fetchLeaves}
            disabled={loading}
            className='rounded bg-slate-800 px-4 py-2 font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400'
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <section className='mb-6 grid gap-4 sm:grid-cols-3'>
          <div className='rounded-lg border border-amber-200 bg-amber-50 p-4'>
            <p className='text-sm font-semibold text-amber-800'>Pending</p>
            <p className='mt-1 text-3xl font-bold text-amber-950'>{leaveCounts.pending}</p>
          </div>
          <div className='rounded-lg border border-emerald-200 bg-emerald-50 p-4'>
            <p className='text-sm font-semibold text-emerald-800'>Approved</p>
            <p className='mt-1 text-3xl font-bold text-emerald-950'>{leaveCounts.approved}</p>
          </div>
          <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
            <p className='text-sm font-semibold text-red-800'>Rejected</p>
            <p className='mt-1 text-3xl font-bold text-red-950'>{leaveCounts.rejected}</p>
          </div>
        </section>

        <section className='overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'>
          <div className='flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between'>
            <h2 className='text-xl font-bold'>Leave Requests</h2>
            <label className='flex items-center gap-2 text-sm font-semibold text-slate-700'>
              Status
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className='rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-slate-700'
              >
                <option value='all'>All requests</option>
                <option value='pending'>Pending</option>
                <option value='approved'>Approved</option>
                <option value='rejected'>Rejected</option>
              </select>
            </label>
          </div>

          {error && <p className='m-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{error}</p>}

          {loading ? (
            <p className='p-6 text-slate-600'>Loading leave requests...</p>
          ) : filteredLeaves.length === 0 ? (
            <p className='p-6 text-slate-600'>No {statusFilter === 'all' ? '' : `${statusFilter} `}leave requests found.</p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[860px] text-left text-sm'>
                <thead className='bg-slate-50 text-xs uppercase tracking-wide text-slate-500'>
                  <tr>
                    <th className='px-4 py-3'>Employee</th>
                    <th className='px-4 py-3'>Department</th>
                    <th className='px-4 py-3'>Leave Type</th>
                    <th className='px-4 py-3'>Period</th>
                    <th className='px-4 py-3'>Reason</th>
                    <th className='px-4 py-3'>Status</th>
                    <th className='px-4 py-3'>Paid Status</th>
                    <th className='px-4 py-3 text-right'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-200'>
                  {filteredLeaves.map((leave) => {
                    const status = leave.status?.toLowerCase() || 'pending'
                    const isUpdating = updatingLeaveId === leave.id
                    const employeeInfo = employeeMap[leave.employee_id] || { name: 'Unknown', department: 'Unknown' }

                    return (
                      <tr key={leave.id} className='align-top hover:bg-slate-50'>
                        <td className='px-4 py-4 font-medium text-slate-900'>{employeeInfo.name}</td>
                        <td className='px-4 py-4 text-slate-700'>{employeeInfo.department}</td>
                        <td className='px-4 py-4 font-medium capitalize'>
                          {editingLeaveType === leave.id && status === 'pending' ? (
                            <select
                              value={newLeaveType}
                              onChange={(e) => setNewLeaveType(e.target.value)}
                              className='rounded border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-slate-700'
                            >
                              {leaveTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className='flex items-center gap-2'>
                              {leave.leave_type}
                              {status === 'pending' && (
                                <button
                                  type='button'
                                  onClick={() => startEditingLeaveType(leave)}
                                  className='text-xs text-blue-600 hover:text-blue-800 underline'
                                >
                                  Edit
                                </button>
                              )}
                            </span>
                          )}
                        </td>
                        <td className='px-4 py-4 text-slate-700'>
                          <div>{formatDate(leave.start_date)}</div>
                          <div className='text-xs text-slate-500'>to {formatDate(leave.end_date)}</div>
                        </td>
                        <td className='max-w-xs px-4 py-4 text-slate-700'>{leave.reason || 'No reason provided'}</td>
                        <td className='px-4 py-4'>
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusClasses[status] || 'bg-slate-100 text-slate-700'}`}>
                            {status}
                          </span>
                        </td>
                        <td className='px-4 py-4'>
                          <span className='flex items-center gap-2'>
                            {editingPaidStatus === leave.id && status === 'approved' ? (
                              <select
                                value={newPaidStatus}
                                onChange={(e) => setNewPaidStatus(e.target.value)}
                                className='rounded border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-slate-700'
                              >
                                <option value='paid'>Paid</option>
                                <option value='unpaid'>Unpaid</option>
                              </select>
                            ) : (
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${paidStatusClasses[leave.paid_status] || 'bg-slate-100 text-slate-700'}`}>
                                {leave.paid_status || 'N/A'}
                              </span>
                            )}
                            {status === 'approved' && editingPaidStatus !== leave.id && (
                              <button
                                type='button'
                                onClick={() => startEditingPaidStatus(leave)}
                                className='text-xs text-blue-600 hover:text-blue-800 underline'
                              >
                                Edit
                              </button>
                            )}
                          </span>
                        </td>
                        <td className='px-4 py-4'>
                          {editingLeaveType === leave.id && status === 'pending' ? (
                            <div className='flex justify-end gap-2'>
                              <button
                                type='button'
                                onClick={() => handleLeaveTypeUpdate(leave.id)}
                                disabled={isUpdating}
                                className='rounded bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400'
                              >
                                {isUpdating ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                type='button'
                                onClick={cancelEditingLeaveType}
                                disabled={isUpdating}
                                className='rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-400'
                              >
                                Cancel
                              </button>
                            </div>
                          ) : editingPaidStatus === leave.id && status === 'approved' ? (
                            <div className='flex justify-end gap-2'>
                              <button
                                type='button'
                                onClick={() => handlePaidStatusUpdate(leave.id)}
                                disabled={isUpdating}
                                className='rounded bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400'
                              >
                                {isUpdating ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                type='button'
                                onClick={cancelEditingPaidStatus}
                                disabled={isUpdating}
                                className='rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-400'
                              >
                                Cancel
                              </button>
                            </div>
                          ) : status === 'pending' ? (
                            <div className='flex justify-end gap-2'>
                              <button
                                type='button'
                                onClick={() => handleStatusUpdate(leave.id, 'approved')}
                                disabled={isUpdating}
                                className='rounded bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400'
                              >
                                {isUpdating ? 'Saving...' : 'Approve'}
                              </button>
                              <button
                                type='button'
                                onClick={() => handleStatusUpdate(leave.id, 'rejected')}
                                disabled={isUpdating}
                                className='rounded bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400'
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className='block text-right text-xs font-semibold text-slate-500'>Reviewed</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      </main>
    </>
  )
}

export default HrLeave
