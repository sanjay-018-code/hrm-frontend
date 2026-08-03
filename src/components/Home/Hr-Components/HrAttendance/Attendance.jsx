import React, { useCallback, useEffect, useMemo, useState } from 'react'

import {
  delete_attendance,
  get_all_attendance,
  get_today_attendance_stats,
  mark_attendance,
  update_attendance,
} from '../../../../services/attendanceServices'
import { get_all_employees } from '../../../../services/employeeServices'
import { get_leaves_for_date } from '../../../../services/leaveServices'
import Navbar from '../../../Navbar/Navbar'

const statusClasses = {
  present: 'bg-emerald-100 text-emerald-800',
  absent: 'bg-red-100 text-red-800',
  leave: 'bg-amber-100 text-amber-800',
}

const initialForm = {
  employee_id: '',
  date: new Date().toISOString().split('T')[0],
  status: 'present',
  check_in: '09:00',
  check_out: '18:00',
}

const defaultMarkDraft = {
  status: 'present',
  check_in: '09:00',
  check_out: '18:00',
}

const formatDate = (date) => {
  const parsedDate = new Date(`${date}T00:00:00`)
  return Number.isNaN(parsedDate.getTime()) ? date : parsedDate.toLocaleDateString()
}

const formatTime = (time) => {
  if (!time) return '—'
  return String(time).slice(0, 5)
}

const toApiTime = (time) => (time?.length === 5 ? `${time}:00` : time)

const normalizeEmployeeList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.employees)) return payload.employees
  if (Array.isArray(payload?.data?.employees)) return payload.data.employees
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

const normalizeAttendanceList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.attendance)) return payload.attendance
  if (Array.isArray(payload?.records)) return payload.records
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

const normalizeErrorMessage = (error) => {
  const detail = error?.response?.data?.detail

  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || item?.detail || JSON.stringify(item)).join(', ')
  }
  if (detail && typeof detail === 'object') {
    return detail.msg || detail.detail || JSON.stringify(detail)
  }

  return error?.message || 'Something went wrong.'
}

const buildMonthOptions = (referenceDate = new Date()) => {
  const months = []
  const baseYear = referenceDate.getFullYear()
  const baseMonth = referenceDate.getMonth()

  for (let offset = 0; offset < 6; offset += 1) {
    const date = new Date(baseYear, baseMonth - offset, 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    months.push({
      key,
      label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    })
  }

  return months
}

const Attendance = ({ workspaceLabel = 'HR Workspace' }) => {
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [employeeError, setEmployeeError] = useState('')
  const [stats, setStats] = useState({ present: 0, absent: 0, leave: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('review')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [formData, setFormData] = useState(initialForm)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [attendanceDrafts, setAttendanceDrafts] = useState({})
  const [leaveLookup, setLeaveLookup] = useState({})
  const [editingRecord, setEditingRecord] = useState(null)
  const [editForm, setEditForm] = useState({ status: '', check_in: '', check_out: '' })
  const [actionId, setActionId] = useState(null)

  const monthOptions = useMemo(() => buildMonthOptions(), [])

  const employeeMap = useMemo(() => {
    const map = {}
    employees.forEach((employee) => {
      map[employee.id] = employee.name
    })
    return map
  }, [employees])

  const selectedDateRecords = useMemo(() => {
    return records.filter((record) => record.date === selectedDate)
  }, [records, selectedDate])

  const groupedEmployees = useMemo(() => {
    return employees.reduce((groups, employee) => {
      const departmentName = employee.department || 'Unassigned'
      if (!groups[departmentName]) {
        groups[departmentName] = []
      }
      groups[departmentName].push(employee)
      return groups
    }, {})
  }, [employees])

  const fetchEmployees = useCallback(async () => {
    setEmployeeError('')

    try {
      const data = await get_all_employees(1, 50)
      const normalizedEmployees = normalizeEmployeeList(data)
      setEmployees(normalizedEmployees)

      if (normalizedEmployees.length === 0) {
        setEmployeeError('No employees were returned by the API yet. Create an employee first or verify the backend response.')
      }
    } catch (requestError) {
      console.error(requestError)
      setEmployees([])
      setEmployeeError(normalizeErrorMessage(requestError))
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const data = await get_today_attendance_stats()
      setStats({
        present: data.present ?? 0,
        absent: data.absent ?? 0,
        leave: data.leave ?? 0,
      })
    } catch (requestError) {
      console.error(requestError)
    }
  }, [])

  const fetchAttendance = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await get_all_attendance(1, 200, null, 'desc')
      setRecords(normalizeAttendanceList(data))
    } catch (requestError) {
      setError(normalizeErrorMessage(requestError))
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLeaveData = useCallback(async (date) => {
    try {
      const leaves = await get_leaves_for_date(date)
      const nextLookup = {}

      leaves.forEach((leave) => {
        nextLookup[leave.employee_id] = leave
      })

      setLeaveLookup(nextLookup)
    } catch (requestError) {
      console.error(requestError)
      setLeaveLookup({})
    }
  }, [])

  useEffect(() => {
    fetchEmployees()
    fetchStats()
  }, [fetchEmployees, fetchStats])

  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  useEffect(() => {
    if (!employees.length) {
      setAttendanceDrafts({})
      return
    }

    setAttendanceDrafts((current) => {
      const nextDrafts = {}
      employees.forEach((employee) => {
        const leaveRecord = leaveLookup[employee.id]
        const existingAttendance = selectedDateRecords.find(record => record.employee_id === employee.id)
        const nextDraft = current[employee.id] || { ...defaultMarkDraft }

        if (existingAttendance) {
          nextDrafts[employee.id] = {
            status: existingAttendance.status,
            check_in: formatTime(existingAttendance.check_in),
            check_out: formatTime(existingAttendance.check_out),
          }
        } else if (leaveRecord) {
          nextDrafts[employee.id] = {
            status: 'leave',
            check_in: '00:00',
            check_out: '00:00',
          }
        } else {
          nextDrafts[employee.id] = {
            ...nextDraft,
            status: nextDraft.status,
            check_in: nextDraft.check_in,
            check_out: nextDraft.check_out,
          }
        }
      })
      return nextDrafts
    })
  }, [employees, leaveLookup, selectedDateRecords])

  useEffect(() => {
    if (selectedDate) {
      setSelectedMonth(selectedDate.slice(0, 7))
      fetchLeaveData(selectedDate)
    }
  }, [selectedDate, fetchLeaveData])

  const handleRefresh = async () => {
    await Promise.all([fetchEmployees(), fetchStats(), fetchAttendance()])
  }

  const handleMonthSelect = (monthKey) => {
    setSelectedMonth(monthKey)
    setSelectedDate(`${monthKey}-01`)
    setViewMode('review')
  }

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value)
    setViewMode('review')
  }

  const handleOpenMarkView = () => {
    const today = new Date().toISOString().split('T')[0]
    setSelectedDate(today)
    setSelectedMonth(today.slice(0, 7))
    setViewMode('mark')
    setFormData((current) => ({ ...current, date: today }))
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleDraftChange = (employeeId, field, value) => {
    setAttendanceDrafts((current) => ({
      ...current,
      [employeeId]: {
        ...(current[employeeId] || defaultMarkDraft),
        [field]: value,
      },
    }))
  }

  const handleMarkSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setSubmitting(true)

    if (!employees.length) {
      setFormError('No employees are available to mark attendance yet.')
      setSubmitting(false)
      return
    }

    try {
      const existingAttendanceMap = {}
      selectedDateRecords.forEach(record => {
        existingAttendanceMap[record.employee_id] = record
      })

      await Promise.all(
        employees.map((employee) => {
          const draft = attendanceDrafts[employee.id] || defaultMarkDraft
          const existingRecord = existingAttendanceMap[employee.id]

          if (existingRecord) {
            return update_attendance(existingRecord.id, {
              status: draft.status,
              check_in: toApiTime(draft.check_in),
              check_out: toApiTime(draft.check_out),
            })
          }

          return mark_attendance({
            employee_id: employee.id,
            date: selectedDate,
            status: draft.status,
            check_in: toApiTime(draft.check_in),
            check_out: toApiTime(draft.check_out),
          })
        })
      )

      setFormData({ ...initialForm, date: selectedDate })
      setSelectedDate(selectedDate)
      setSelectedMonth(selectedDate.slice(0, 7))
      setViewMode('review')
      await Promise.all([fetchStats(), fetchAttendance()])
    } catch (requestError) {
      setFormError(normalizeErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  const openEditModal = (record) => {
    setEditingRecord(record)
    setEditForm({
      status: record.status,
      check_in: formatTime(record.check_in),
      check_out: formatTime(record.check_out),
    })
  }

  const closeEditModal = () => {
    setEditingRecord(null)
    setEditForm({ status: '', check_in: '', check_out: '' })
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditForm((current) => ({ ...current, [name]: value }))
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (!editingRecord) return

    setActionId(editingRecord.id)
    setError('')

    try {
      const updated = await update_attendance(editingRecord.id, {
        status: editForm.status,
        check_in: toApiTime(editForm.check_in),
        check_out: toApiTime(editForm.check_out),
      })
      setRecords((current) => current.map((record) => (
        record.id === updated.id ? updated : record
      )))
      await fetchStats()
      closeEditModal()
    } catch (requestError) {
      setError(normalizeErrorMessage(requestError))
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (attendanceId) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) {
      return
    }

    setActionId(attendanceId)
    setError('')

    try {
      await delete_attendance(attendanceId)
      setRecords((current) => current.filter((record) => record.id !== attendanceId))
      await fetchStats()
    } catch (requestError) {
      setError(normalizeErrorMessage(requestError))
    } finally {
      setActionId(null)
    }
  }

  return (
    <>
      <Navbar title="Attendance Management" showBackButton={true} />
      <main className='min-h-screen bg-slate-100 p-4 text-slate-900 md:p-8'>
        <div className='mx-auto max-w-7xl'>
        <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-wide text-slate-500'>{workspaceLabel}</p>
            <h1 className='text-3xl font-bold'>Attendance Management</h1>
          </div>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={handleOpenMarkView}
              className='rounded bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700'
            >
              Mark Attendance
            </button>
            <button
              type='button'
              onClick={handleRefresh}
              disabled={loading}
              className='rounded bg-slate-800 px-4 py-2 font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400'
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <section className='mb-6 grid gap-4 sm:grid-cols-3'>
          <div className='rounded-lg border border-emerald-200 bg-emerald-50 p-4'>
            <p className='text-sm font-semibold text-emerald-800'>Present Today</p>
            <p className='mt-1 text-3xl font-bold text-emerald-950'>{stats.present}</p>
          </div>
          <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
            <p className='text-sm font-semibold text-red-800'>Absent Today</p>
            <p className='mt-1 text-3xl font-bold text-red-950'>{stats.absent}</p>
          </div>
          <div className='rounded-lg border border-amber-200 bg-amber-50 p-4'>
            <p className='text-sm font-semibold text-amber-800'>On Leave Today</p>
            <p className='mt-1 text-3xl font-bold text-amber-950'>{stats.leave}</p>
          </div>
        </section>

        <section className='grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]'>
          <div className='rounded-lg border border-slate-200 bg-white p-4 shadow-sm'>
            <div className='mb-4'>
              <h2 className='text-lg font-bold'>Attendance Timeline</h2>
              <p className='text-sm text-slate-600'>Pick a month to review historical records, or mark attendance for today.</p>
            </div>

            <button
              type='button'
              onClick={handleOpenMarkView}
              className='mb-4 w-full rounded-lg h-20 border border-emerald-200 bg-emerald-50 px-4 py-3 text-left transition hover:border-emerald-400 hover:bg-emerald-100'
            >
              <p className='text-sm font-semibold text-emerald-800'>Mark attendance for today</p>
            </button>

            <div className='space-y-2'>
              {monthOptions.map((month) => {
                const isActive = month.key === selectedMonth

                return (
                  <button
                    key={month.key}
                    type='button'
                    onClick={() => handleMonthSelect(month.key)}
                    className={`w-full rounded-lg border px-4 py-3 text-left transition ${isActive ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'}`}
                  >
                    <p className='font-semibold'>{month.label}</p>
                    <p className={`text-xs ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>Review records for this month</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className='rounded-lg border border-slate-200 bg-white shadow-sm'>
            <div className='flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between'>
              <div>
                <p className='text-sm font-semibold uppercase tracking-wide text-slate-500'>Selected date</p>
                <h2 className='text-xl font-bold'>{formatDate(selectedDate)}</h2>
              </div>

              <div className='flex flex-wrap items-center gap-2'>
                <label className='flex items-center gap-2 text-sm font-semibold text-slate-700'>
                  <span>Date</span>
                  <input
                    type='date'
                    value={selectedDate}
                    onChange={handleDateChange}
                    className='rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-slate-700'
                  />
                </label>
                <button
                  type='button'
                  onClick={() => setViewMode('review')}
                  className='rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                >
                  Review Table
                </button>
                <button
                  type='button'
                  onClick={handleOpenMarkView}
                  className='rounded bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700'
                >
                  Mark Attendance
                </button>
              </div>
            </div>

            {employeeError && (
              <div className='m-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800'>
                {employeeError}
              </div>
            )}

            {error && <p className='m-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{error}</p>}

            {viewMode === 'mark' ? (
              <div className='p-4'>
                <div className='mb-4'>
                  <h3 className='text-lg font-bold'>Mark attendance for this date</h3>
                  <p className='text-sm text-slate-600'>Select a status for each employee and save all rows for the selected date.</p>
                </div>

                {formError && (
                  <p className='mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
                    {formError}
                  </p>
                )}

                {employees.length === 0 ? (
                  <p className='rounded border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600'>No employees are available to mark attendance right now.</p>
                ) : (
                  <form onSubmit={handleMarkSubmit} className='space-y-4'>
                    {Object.entries(groupedEmployees).map(([departmentName, departmentEmployees]) => (
                      <div key={departmentName} className='overflow-hidden rounded-lg border border-slate-200'>
                        <div className='bg-slate-50 px-4 py-3'>
                          <h4 className='font-semibold text-slate-800'>{departmentName}</h4>
                        </div>
                        <div className='overflow-x-auto'>
                          <table className='min-w-full text-left text-sm'>
                            <thead className='bg-white text-xs uppercase tracking-wide text-slate-500'>
                              <tr>
                                <th className='px-4 py-3'>Employee</th>
                                <th className='px-4 py-3'>Status</th>
                                <th className='px-4 py-3'>Check In</th>
                                <th className='px-4 py-3'>Check Out</th>
                              </tr>
                            </thead>
                            <tbody className='divide-y divide-slate-200'>
                              {departmentEmployees.map((employee) => {
                                const draft = attendanceDrafts[employee.id] || defaultMarkDraft
                                const hasExistingAttendance = selectedDateRecords.some(record => record.employee_id === employee.id)

                                return (
                                  <tr key={employee.id} className='bg-white'>
                                    <td className='px-4 py-3'>
                                      <div className='font-medium text-slate-900'>{employee.name}</div>
                                      <div className='text-xs text-slate-500'>{employee.designation || '—'}</div>
                                      {hasExistingAttendance && (
                                        <div className='mt-1 text-xs font-semibold text-emerald-700'>Attendance marked</div>
                                      )}
                                      {leaveLookup[employee.id] && (
                                        <div className='mt-1 text-xs font-semibold text-amber-700'>Leave scheduled</div>
                                      )}
                                    </td>
                                    <td className='px-4 py-3'>
                                      <select
                                        value={draft.status}
                                        onChange={(event) => handleDraftChange(employee.id, 'status', event.target.value)}
                                        className='rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-700'
                                      >
                                        <option value='present'>Present</option>
                                        <option value='absent'>Absent</option>
                                        <option value='leave'>Leave</option>
                                      </select>
                                    </td>
                                    <td className='px-4 py-3'>
                                      <input
                                        type='time'
                                        value={draft.check_in}
                                        onChange={(event) => handleDraftChange(employee.id, 'check_in', event.target.value)}
                                        className='rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-700'
                                      />
                                    </td>
                                    <td className='px-4 py-3'>
                                      <input
                                        type='time'
                                        value={draft.check_out}
                                        onChange={(event) => handleDraftChange(employee.id, 'check_out', event.target.value)}
                                        className='rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-700'
                                      />
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}

                    <div className='flex justify-end'>
                      <button
                        type='submit'
                        disabled={submitting}
                        className='rounded bg-slate-800 px-4 py-2 font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400'
                      >
                        {submitting ? 'Saving attendance...' : 'Save Attendance'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div>
                <div className='flex flex-wrap gap-3 border-b border-slate-200 p-4'>
                  <div className='rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800'>
                    Present: {selectedDateRecords.filter((record) => record.status === 'present').length}
                  </div>
                  <div className='rounded border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800'>
                    Absent: {selectedDateRecords.filter((record) => record.status === 'absent').length}
                  </div>
                  <div className='rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800'>
                    Leave: {selectedDateRecords.filter((record) => record.status === 'leave').length}
                  </div>
                </div>

                {loading ? (
                  <p className='p-6 text-slate-600'>Loading attendance records...</p>
                ) : selectedDateRecords.length === 0 ? (
                  <div className='p-6 text-slate-600'>No attendance records found for this date yet. Use the Mark Attendance action to add one.</div>
                ) : (
                  <div className='overflow-x-auto'>
                    <table className='w-full min-w-[900px] text-left text-sm'>
                      <thead className='bg-slate-50 text-xs uppercase tracking-wide text-slate-500'>
                        <tr>
                          <th className='px-4 py-3'>Employee</th>
                          <th className='px-4 py-3'>Date</th>
                          <th className='px-4 py-3'>Status</th>
                          <th className='px-4 py-3'>Check In</th>
                          <th className='px-4 py-3'>Check Out</th>
                          <th className='px-4 py-3 text-right'>Actions</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-slate-200'>
                        {selectedDateRecords.map((record) => {
                          const status = record.status?.toLowerCase() || 'present'
                          const isBusy = actionId === record.id

                          return (
                            <tr key={record.id} className='align-top hover:bg-slate-50'>
                              <td className='px-4 py-4'>
                                <div className='font-medium text-slate-900'>
                                  {employeeMap[record.employee_id] || record.employee?.name || 'Unknown'}
                                </div>
                                <div className='font-mono text-xs text-slate-500'>{record.employee_id}</div>
                              </td>
                              <td className='px-4 py-4 text-slate-700'>{formatDate(record.date)}</td>
                              <td className='px-4 py-4'>
                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusClasses[status] || 'bg-slate-100 text-slate-700'}`}>
                                  {status}
                                </span>
                              </td>
                              <td className='px-4 py-4 text-slate-700'>{formatTime(record.check_in)}</td>
                              <td className='px-4 py-4 text-slate-700'>{formatTime(record.check_out)}</td>
                              <td className='px-4 py-4'>
                                <div className='flex justify-end gap-2'>
                                  <button
                                    type='button'
                                    onClick={() => openEditModal(record)}
                                    disabled={isBusy}
                                    className='rounded bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400'
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type='button'
                                    onClick={() => handleDelete(record.id)}
                                    disabled={isBusy}
                                    className='rounded bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400'
                                  >
                                    {isBusy ? 'Deleting...' : 'Delete'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {editingRecord && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
          <form onSubmit={handleEditSubmit} className='w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-slate-900 shadow-xl'>
            <div className='mb-5 flex items-center justify-between'>
              <h2 className='text-2xl font-bold'>Edit Attendance</h2>
              <button
                type='button'
                onClick={closeEditModal}
                className='text-2xl font-bold text-slate-500 hover:text-slate-700'
              >
                X
              </button>
            </div>

            <p className='mb-4 text-sm text-slate-600'>
              {employeeMap[editingRecord.employee_id] || editingRecord.employee_id} — {formatDate(editingRecord.date)}
            </p>

            <div className='flex flex-col gap-4'>
              <label className='flex flex-col gap-1 text-sm font-semibold text-slate-700'>
                Status
                <select
                  name='status'
                  value={editForm.status}
                  onChange={handleEditChange}
                  required
                  className='rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-slate-700'
                >
                  <option value='present'>Present</option>
                  <option value='absent'>Absent</option>
                  <option value='leave'>Leave</option>
                </select>
              </label>
              <label className='flex flex-col gap-1 text-sm font-semibold text-slate-700'>
                Check In
                <input
                  type='time'
                  name='check_in'
                  value={editForm.check_in}
                  onChange={handleEditChange}
                  required
                  className='rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-slate-700'
                />
              </label>
              <label className='flex flex-col gap-1 text-sm font-semibold text-slate-700'>
                Check Out
                <input
                  type='time'
                  name='check_out'
                  value={editForm.check_out}
                  onChange={handleEditChange}
                  required
                  className='rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-slate-700'
                />
              </label>
            </div>

            <div className='mt-6 flex gap-3'>
              <button
                type='submit'
                disabled={actionId === editingRecord.id}
                className='w-full rounded bg-slate-800 py-2 font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400'
              >
                {actionId === editingRecord.id ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type='button'
                onClick={closeEditModal}
                className='w-full rounded border border-slate-300 py-2 font-bold text-slate-700 hover:bg-slate-50'
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      </main>
    </>
  )
}

export default Attendance
