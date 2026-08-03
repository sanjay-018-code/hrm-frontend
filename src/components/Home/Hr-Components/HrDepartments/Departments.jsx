import React, { useEffect, useState } from 'react'

import { get_all_departments, get_department_by_id, get_dep_emp, update_department, delete_department } from '../../../../services/departmentServices'
import { update_employee, delete_employee } from '../../../../services/employeeServices'
import UpdateEmployeeForm from '../../../Shared/UpdateEmployeeForm'
import Navbar from '../../../Navbar/Navbar'

const initialEmployeeForm = {
    name: '',
    department: '',
    designation: '',
    joining_date: '',
    salary: '',
    phone: '',
    email: ''
}

const Departments = ({ workspaceLabel = 'HR Workspace' }) => {
    const [departments, setDepartments] = useState([])
    const [employees, setEmployees] = useState([])
    const [department, setDepartment] = useState(null)
    const [sortBy, setSortBy] = useState('name')
    const [order, setOrder] = useState('asc')
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const [showUpdatePopup, setShowUpdatePopup] = useState(false)
    const [employeeForm, setEmployeeForm] = useState(initialEmployeeForm)
    const [showDepartmentPopup, setShowDepartmentPopup] = useState(false)
    const [departmentName, setDepartmentName] = useState('')
    const [error, setError] = useState("")

    const fetchDepartments = async () => {
        try{
            const data = await get_all_departments()
            setDepartments(data)
        }catch(err){
            setError(err)
            console.log(err);
        }
    }

    const sortEmployees = (employeeList, sortField, sortOrder) => {
        const sorted = [...employeeList].sort((a, b) => {
            const fieldA = String(a[sortField] ?? '').toLowerCase()
            const fieldB = String(b[sortField] ?? '').toLowerCase()
            if (fieldA < fieldB) return -1
            if (fieldA > fieldB) return 1
            return 0
        })

        return sortOrder === 'desc' ? sorted.reverse() : sorted
    }

    const fetchDepartmentById = async (department_id) => {
        try{
            const data = await get_department_by_id(department_id) 
            setDepartment(data)
        }catch(err){
            setError(err)
            console.log(err);
        }
    }
    const fetchEmpByDepId = async (department_id) => {
        try{
            const data = await get_dep_emp(department_id) 
            setEmployees(sortEmployees(data, sortBy, order))
        }catch(err){
            setError(err)
            console.log(err);
        }
    }

    useEffect(()=>{
        fetchDepartments();
    },[])

    const handleDepClick =async (department_id) => {
        fetchDepartmentById(department_id)
        fetchEmpByDepId(department_id)
    }

    const openDepartmentPopup = () => {
        if (!department) return
        setDepartmentName(department.name)
        setShowDepartmentPopup(true)
    }

    const closeDepartmentPopup = () => {
        setShowDepartmentPopup(false)
    }

    const handleDepartmentNameChange = (event) => {
        setDepartmentName(event.target.value)
    }

    const handleDepartmentUpdate = async (event) => {
        event.preventDefault()
        if (!department) return
        if (!window.confirm('Update department name?')) return

        try {
            const updated = await update_department(department.id, departmentName)
            setDepartment(updated)
            setShowDepartmentPopup(false)
            fetchDepartments()
        } catch (err) {
            setError(err)
            console.error(err)
        }
    }

    const handleDepartmentDelete = async () => {
        if (!department) return
        if (!window.confirm('Delete this department')) return

        try {
            await delete_department(department.id)
            setDepartment(null)
            setEmployees([])
            setShowUpdatePopup(false)
            fetchDepartments()
        } catch (err) {
            setError(err)
            console.error(err)
        }
    }

    const handleSortByChange = (event) => {
        const value = event.target.value
        setSortBy(value)
        setEmployees((current) => sortEmployees(current, value, order))
    }

    const handleOrderChange = (event) => {
        const value = event.target.value
        setOrder(value)
        setEmployees((current) => sortEmployees(current, sortBy, value))
    }

    const handleEmployeeDelete = async (employeeId) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return

        try {
            await delete_employee(employeeId)
            setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId))
            setDepartment((prev) => prev ? { ...prev, total_employees: Math.max(0, prev.total_employees - 1) } : prev)
            if (selectedEmployee?.id === employeeId) {
                setSelectedEmployee(null)
                setShowUpdatePopup(false)
            }
        } catch (err) {
            setError(err)
            console.error(err)
        }
    }

    const openUpdatePopup = (employee) => {
        setSelectedEmployee(employee)
        setEmployeeForm({
            name: employee.name,
            department: employee.department,
            designation: employee.designation,
            joining_date: employee.joining_date,
            salary: employee.salary,
            phone: employee.phone,
            email: employee.email,
        })
        setShowUpdatePopup(true)
    }

    const handleUpdateChange = (event) => {
        const { name, value } = event.target
        setEmployeeForm((prev) => ({
            ...prev,
            [name]: name === 'salary' ? Number(value) : value,
        }))
    }

    const handleUpdateSubmit = async (event) => {
        event.preventDefault()
        if (!selectedEmployee) return

        if (!window.confirm('Are you sure you want to update this employee?')) return

        try {
            const updated = await update_employee(selectedEmployee.id, {
                ...employeeForm,
                salary: Number(employeeForm.salary)
            })
            setEmployees((prev) => prev.map((emp) => emp.id === updated.id ? updated : emp))
            setSelectedEmployee(updated)
            setShowUpdatePopup(false)
        } catch (err) {
            setError(err)
            console.error(err)
        }
    }

  return (
    <>
    <Navbar title="Department Management" showBackButton={true} />
    <main className='min-h-screen bg-slate-100 p-4 text-slate-900 md:p-8'>
        <div className='mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row'>
            <section className='w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:w-[40%]'>
                <div className='border-b border-slate-200 p-4'>
                    <p className='text-sm font-semibold uppercase tracking-wide text-slate-500'>{workspaceLabel}</p>
                    <h1 className='text-2xl font-bold'>Departments</h1>
                </div>
                <div className='max-h-[calc(100vh-12rem)] overflow-y-auto p-4'>
                    {departments && departments.map((d) => (
                        <div
                            key={d.id}
                            onClick={() => handleDepClick(d.id)}
                            className={`mb-3 flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
                                department?.id === d.id
                                    ? 'border-slate-700 bg-slate-50'
                                    : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                        >
                            <h2 className='font-bold uppercase text-slate-900'>{d.name}</h2>
                            <div className='text-right text-sm text-slate-600'>
                                <p className='font-semibold'>Total Employees</p>
                                <p className='text-lg font-bold text-slate-900'>{d.total_employees}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className='w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:w-[60%]'>
                {!department && (
                    <div className='flex h-full min-h-[400px] items-center justify-center p-8'>
                        <p className='text-lg font-semibold text-slate-500'>Select a department to view details</p>
                    </div>
                )}
                {department && (
                    <div className='p-4 md:p-6'>
                        <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                            <div>
                                <h2 className='text-2xl font-bold uppercase text-slate-900'>{department.name}</h2>
                                <p className='text-sm text-slate-500'>Department ID: {department.id}</p>
                            </div>
                            <div className='flex flex-col items-start sm:items-end'>
                                <p className='text-lg font-bold text-slate-900'>Employees: {department.total_employees}</p>
                                <div className='mt-2 flex gap-2'>
                                    <button onClick={openDepartmentPopup} className='rounded bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700'>Edit</button>
                                    <button onClick={handleDepartmentDelete} className='rounded bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700'>Delete</button>
                                </div>
                            </div>
                        </div>

                        <div className='mb-6 flex flex-row gap-3'>
                            <div className='flex w-[45%] flex-col'>
                                <label className='text-sm font-semibold text-slate-700'>Sort By</label>
                                <select value={sortBy} onChange={handleSortByChange} className='mt-1 rounded border border-slate-300 bg-white p-2 outline-none focus:border-slate-700'>
                                    <option value='name'>Name</option>
                                    <option value='designation'>Role</option>
                                </select>
                            </div>
                            <div className='flex w-[45%] flex-col'>
                                <label className='text-sm font-semibold text-slate-700'>Order</label>
                                <select value={order} onChange={handleOrderChange} className='mt-1 rounded border border-slate-300 bg-white p-2 outline-none focus:border-slate-700'>
                                    <option value='asc'>Ascending</option>
                                    <option value='desc'>Descending</option>
                                </select>
                            </div>
                        </div>

                        {error && <p className='mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{String(error)}</p>}

                        <h3 className='mb-3 text-lg font-bold text-slate-900'>Employees</h3>
                        {employees && employees.length === 0 && (
                            <p className='text-slate-600'>No employees found for this department.</p>
                        )}
                        {employees && employees.map((employee) => (
                            <div key={employee.id} className='mb-3 flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50'>
                                <div>
                                    <h4 className='font-bold uppercase text-slate-900'>{employee.name}</h4>
                                    <p className='text-sm uppercase text-slate-600'>{employee.designation}</p>
                                </div>
                                <div className='flex gap-2'>
                                    <button onClick={() => openUpdatePopup(employee)} className='rounded bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700'>Update</button>
                                    <button onClick={() => handleEmployeeDelete(employee.id)} className='rounded bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700'>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>

        <UpdateEmployeeForm
            isOpen={showUpdatePopup && Boolean(selectedEmployee)}
            employeeForm={employeeForm}
            error={error}
            onChange={handleUpdateChange}
            onSubmit={handleUpdateSubmit}
            onClose={() => setShowUpdatePopup(false)}
            title='Update Employee'
        />

        {showDepartmentPopup && (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
                <form onSubmit={handleDepartmentUpdate} className='w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 text-slate-900 shadow-xl'>
                    <div className='mb-5 flex items-center justify-between'>
                        <h2 className='text-3xl font-bold'>Update Department</h2>
                        <button type='button' onClick={closeDepartmentPopup} className='text-2xl font-bold text-slate-500 hover:text-slate-700'>X</button>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label className='text-sm font-bold uppercase text-slate-700'>Department Name</label>
                        <input
                            type='text'
                            value={departmentName}
                            onChange={handleDepartmentNameChange}
                            required
                            className='h-10 rounded border border-slate-300 bg-white p-2 outline-none focus:border-slate-700'
                        />
                    </div>
                    {error && <p className='mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{String(error)}</p>}
                    <div className='mt-6 flex gap-3'>
                        <button type='submit' className='h-10 w-full rounded bg-slate-800 font-bold text-white hover:bg-slate-700'>Save</button>
                        <button type='button' onClick={closeDepartmentPopup} className='h-10 w-full rounded border border-slate-300 font-bold text-slate-700 hover:bg-slate-50'>Cancel</button>
                    </div>
                </form>
            </div>
        )}
    </main>
    </>
  )
}

export default Departments
