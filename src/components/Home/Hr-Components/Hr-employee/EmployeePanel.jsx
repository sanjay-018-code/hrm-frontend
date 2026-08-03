import React, { useEffect, useState } from 'react'

import { delete_employee, update_employee } from '../../../../services/employeeServices'
import { get_all_departments } from '../../../../services/departmentServices'

const initialFormData = {
  name: '',
  department: '',
  designation: '',
  joining_date: '',
  salary: '',
  phone: '',
  email: ''
}

const EmployeePanel = ({ employeeDetails, onEmployeeUpdate, onEmployeeDelete, updatePopupKey }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [error, setError] = useState('')
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await get_all_departments()
        setDepartments(data || [])
      } catch (err) {
        console.error("Failed to fetch departments:", err)
      }
    }
    fetchDepartments()
  }, [])

  const detailEntries = employeeDetails
    ? Object.entries(employeeDetails).filter(([, value]) => value !== null && value !== undefined && value !== '')
    : []

  useEffect(() => {
    if (employeeDetails) {
      setFormData({
        name: employeeDetails.name ?? '',
        department: employeeDetails.department ?? '',
        designation: employeeDetails.designation ?? '',
        joining_date: employeeDetails.joining_date ?? '',
        salary: employeeDetails.salary ?? '',
        phone: employeeDetails.phone ?? '',
        email: employeeDetails.email ?? ''
      })
    } else {
      setFormData(initialFormData)
      setIsPopupOpen(false)
    }

    setError('')
  }, [employeeDetails])

  useEffect(() => {
    if (updatePopupKey > 0 && employeeDetails) {
      setIsPopupOpen(true)
    }
  }, [updatePopupKey, employeeDetails])

  const formatLabel = (label) => {
    return label.replace(/_/g, ' ')
  }

  const formatValue = (value) => {
    return typeof value === 'object' ? JSON.stringify(value) : value
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value
    }))
  }

  const handleUpdate = async (event) => {
    event.preventDefault()

    if (!employeeDetails?.id || !window.confirm('Are you sure you want to update this employee?')) {
      return
    }

    try {
      setError('')
      const updatedEmployee = await update_employee(employeeDetails.id, {
        ...formData,
        salary: Number(formData.salary)
      })
      onEmployeeUpdate(updatedEmployee)
      setIsPopupOpen(false)
    } catch (updateError) {
      console.error(updateError)
      setError('Failed to update employee.')
    }
  }

  const handleDelete = async () => {
    if (!employeeDetails?.id || !window.confirm('Are you sure you want to delete this employee?')) {
      return
    }

    try {
      setError('')
      await delete_employee(employeeDetails.id)
      onEmployeeDelete()
    } catch (deleteError) {
      console.error(deleteError)
      setError('Failed to delete employee.')
    }
  }

  return (
    <div>
        <div className="mt-5">
            <h1 className="text-2xl font-bold mb-5 text-slate-900">Employee Details</h1>
            <div className='flex flex-col gap-3 min-h-[300px] w-full rounded-lg border border-slate-200 bg-white mr-5 p-4 overflow-y-auto shadow-sm' >
                {!employeeDetails && (
                  <p className='text-sm font-semibold text-slate-500'>Select an employee to view details.</p>
                )}

                {detailEntries.map(([label, value]) => (
                  <div key={label} className='flex flex-col border-b border-slate-200 pb-2'>
                    <span className='text-xs font-semibold uppercase text-slate-500'>{formatLabel(label)}</span>
                    <span className='text-sm font-semibold break-words text-slate-900'>{formatValue(value)}</span>
                  </div>
                ))}

                {employeeDetails && (
                  <div className='flex gap-3 mt-3'>
                    <button
                      type='button'
                      onClick={() => setIsPopupOpen(true)}
                      className='w-full h-10 rounded bg-slate-800 text-white font-bold hover:bg-slate-700'
                    >
                      Update
                    </button>
                    <button
                      type='button'
                      onClick={handleDelete}
                      className='w-full h-10 rounded bg-red-600 text-white font-bold hover:bg-red-700'
                    >
                      Delete
                    </button>
                  </div>
                )}

                {error && <p className='rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{error}</p>}
            </div>
        </div>

        {isPopupOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
            <form onSubmit={handleUpdate} className='w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 text-slate-900 shadow-xl'>
              <div className='flex items-center justify-between mb-5'>
                <h2 className='text-3xl font-bold'>Update Employee</h2>
                <button
                  type='button'
                  onClick={() => setIsPopupOpen(false)}
                  className='text-2xl font-bold text-slate-500 hover:text-slate-700'
                >
                  X
                </button>
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {Object.entries(formData).map(([field, value]) => (
                  <label key={field} className='flex flex-col gap-2 text-sm font-semibold uppercase text-slate-700'>
                    {formatLabel(field)}
                    {field === 'department' ? (
                      <select
                        name={field}
                        value={value}
                        onChange={handleChange}
                        required
                        className='h-10 rounded border border-slate-300 bg-white p-2 font-normal normal-case outline-none focus:border-slate-700'
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        name={field}
                        type={field === 'salary' ? 'number' : 'text'}
                        value={value}
                        onChange={handleChange}
                        required
                        className='h-10 rounded border border-slate-300 bg-white p-2 font-normal normal-case outline-none focus:border-slate-700'
                      />
                    )}
                  </label>
                ))}
              </div>

              <div className='flex gap-3 mt-6'>
                <button
                  type='submit'
                  className='w-full h-10 rounded bg-slate-800 text-white font-bold hover:bg-slate-700'
                >
                  Submit
                </button>
                <button
                  type='button'
                  onClick={() => setIsPopupOpen(false)}
                  className='w-full h-10 rounded border border-slate-300 text-slate-700 font-bold hover:bg-slate-50'
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
    </div>
  )
}

export default EmployeePanel
