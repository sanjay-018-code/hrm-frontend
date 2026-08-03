import React from 'react'

import { get_employee_by_id } from '../../../../services/employeeServices'

const EmployeeCard = ({ details, onEmployeeSelect, onEmployeeUpdateClick, onEmployeeDeleteClick }) => {

    if (!details || !details.employees || details.employees.length === 0) {
        return <div className='p-5 text-slate-600'>No employees found</div>
    }

    const handleClick = async (employee_id) => {
        try {
            const employeeDetails = await get_employee_by_id(employee_id)
            onEmployeeSelect(employeeDetails)
        } catch (error) {
            console.error(error)
        }
    }

    const handleUpdate = async (event, employee_id) => {
        event.stopPropagation()

        try {
            const employeeDetails = await get_employee_by_id(employee_id)
            onEmployeeUpdateClick(employeeDetails)
        } catch (error) {
            console.error(error)
        }
    }

    const handleDelete = (event, employee_id) => {
        event.stopPropagation()
        onEmployeeDeleteClick(employee_id)
    }

    return (
        <div className='flex flex-col w-full'>
            {details && details.employees.map((emp) => (
                <div onClick={() => handleClick(emp.id)} key={emp.id} className='flex flex-row justify-between rounded-lg border border-slate-200 bg-white p-5 m-1 cursor-pointer shadow-sm hover:bg-slate-50'>
                    <div className='flex flex-col ml-10'>
                        <h2 className='text-3xl font-bold uppercase text-slate-900'>{emp.name}</h2>
                        <h3 className='text-xl font-bold uppercase text-slate-700'>{emp.designation}</h3>
                        <p className='text-sm font-bold uppercase text-slate-500'>{emp.department}</p>
                    </div>
                    <div className='flex flex-row'>
                        <div className='flex flex-col mr-10 pt-6 text-slate-700'>
                            <h4 className='text-2xl font-bold uppercase'>{emp.email}</h4>
                            <h4 className='text-2xl font-bold uppercase'>{emp.phone}</h4>
                        </div>
                        <div className='flex flex-col mr-5 pt-6'>
                            <button onClick={(event) => handleUpdate(event, emp.id)} className='rounded bg-slate-800 px-3 py-1 m-1 text-xs font-bold text-white hover:cursor-pointer hover:bg-slate-700' >Update</button>
                            <button onClick={(event) => handleDelete(event, emp.id)} className='rounded bg-red-600 px-3 py-1 m-1 text-xs font-bold text-white hover:cursor-pointer hover:bg-red-700' >Delete</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default EmployeeCard
