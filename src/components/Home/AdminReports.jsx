import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { get_all_employees } from '../../services/employeeServices'
import { getAllPayroll } from '../../services/payrollSeervices'
import Navbar from '../Navbar/Navbar'

const currentMonthKey = new Date().toISOString().slice(0, 7)

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
}).format(Number(amount) || 0)

const formatMonth = (monthKey) => {
  const [year, month] = monthKey.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })
}

const getMonthKey = (payroll) => `${String(payroll.year).padStart(4, '0')}-${String(payroll.month).padStart(2, '0')}`

const toCsvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`

const AdminReports = () => {
  const navigate = useNavigate()
  const [payrolls, setPayrolls] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadReportData = async () => {
      setLoading(true)
      setError('')

      try {
        const [payrollData, employeeData] = await Promise.all([
          getAllPayroll(),
          get_all_employees(1, 1000, '', 'name', 'asc'),
        ])
        setPayrolls(Array.isArray(payrollData) ? payrollData : [])
        setEmployees(Array.isArray(employeeData) ? employeeData : employeeData?.employees ?? [])
      } catch (requestError) {
        setError(requestError?.response?.data?.detail || requestError.message || 'Unable to load payroll reports.')
      } finally {
        setLoading(false)
      }
    }

    loadReportData()
  }, [])

  const monthOptions = useMemo(() => {
    const months = new Set([currentMonthKey])
    payrolls.forEach((payroll) => months.add(getMonthKey(payroll)))
    return [...months].sort().reverse()
  }, [payrolls])

  const employeeNames = useMemo(() => (
    Object.fromEntries(employees.map((employee) => [employee.id, employee.name]))
  ), [employees])

  const monthlyPayrolls = useMemo(() => (
    payrolls
      .filter((payroll) => getMonthKey(payroll) === selectedMonth)
      .sort((first, second) => Number(second.final) - Number(first.final))
  ), [payrolls, selectedMonth])

  const summary = useMemo(() => {
    const totalPayout = monthlyPayrolls.reduce((total, payroll) => total + (Number(payroll.final) || 0), 0)
    const totalDeductions = monthlyPayrolls.reduce((total, payroll) => total + (Number(payroll.deduction) || 0), 0)
    const totalOvertime = monthlyPayrolls.reduce((total, payroll) => total + (Number(payroll.ot_amount) || 0), 0)

    return {
      totalPayout,
      totalDeductions,
      totalOvertime,
      generated: monthlyPayrolls.length,
      remaining: Math.max(employees.length - monthlyPayrolls.length, 0),
      averagePayout: monthlyPayrolls.length ? totalPayout / monthlyPayrolls.length : 0,
    }
  }, [employees.length, monthlyPayrolls])

  const downloadCsv = () => {
    const rows = [
      ['Employee', 'Employee ID', 'Base Salary', 'Overtime', 'Deductions', 'Final Pay', 'Present Days'],
      ...monthlyPayrolls.map((payroll) => [
        employeeNames[payroll.employee_id] || 'Unknown employee',
        payroll.employee_id,
        payroll.base_salary,
        payroll.ot_amount,
        payroll.deduction,
        payroll.final,
        payroll.present_days,
      ]),
    ]
    const csv = rows.map((row) => row.map(toCsvCell).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `payroll-report-${selectedMonth}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Navbar title="Payroll Reports" showBackButton={true} />
      <main className='min-h-screen bg-slate-100 p-4 text-slate-900 md:p-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-wide text-slate-500'>Admin Workspace</p>
            <h1 className='text-3xl font-bold'>Payroll Reports</h1>
            <p className='mt-2 text-slate-600'>Review monthly payroll costs and export the employee-level breakdown.</p>
          </div>
          <div className='flex flex-wrap gap-3'>
            <button type='button' onClick={() => navigate('/admin')} className='rounded border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50'>
              Dashboard
            </button>
            <button type='button' onClick={() => navigate('/admin/payroll')} className='rounded bg-slate-800 px-4 py-2 font-semibold text-white hover:bg-slate-700'>
              Manage Payroll
            </button>
          </div>
        </div>

        {error && <p className='mb-6 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{String(error)}</p>}

        <section className='mb-6 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between'>
          <label className='flex flex-col gap-1 text-sm font-semibold text-slate-700'>
            Payroll month
            <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className='rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-slate-700'>
              {monthOptions.map((monthKey) => <option key={monthKey} value={monthKey}>{formatMonth(monthKey)}</option>)}
            </select>
          </label>
          <button type='button' onClick={downloadCsv} disabled={monthlyPayrolls.length === 0} className='rounded bg-indigo-700 px-4 py-2 font-semibold text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-400'>
            Export CSV
          </button>
        </section>

        {loading ? (
          <p className='rounded-lg border border-slate-200 bg-white p-6 text-slate-600 shadow-sm'>Loading payroll report...</p>
        ) : (
          <>
            <section className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <div className='rounded-lg border border-emerald-200 bg-emerald-50 p-4'>
                <p className='text-sm font-semibold text-emerald-800'>Total payout</p>
                <p className='mt-1 text-3xl font-bold text-emerald-950'>{formatCurrency(summary.totalPayout)}</p>
              </div>
              <div className='rounded-lg border border-amber-200 bg-amber-50 p-4'>
                <p className='text-sm font-semibold text-amber-800'>Overtime paid</p>
                <p className='mt-1 text-3xl font-bold text-amber-950'>{formatCurrency(summary.totalOvertime)}</p>
              </div>
              <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
                <p className='text-sm font-semibold text-red-800'>Deductions</p>
                <p className='mt-1 text-3xl font-bold text-red-950'>{formatCurrency(summary.totalDeductions)}</p>
              </div>
              <div className='rounded-lg border border-slate-200 bg-white p-4'>
                <p className='text-sm font-semibold text-slate-600'>Payrolls generated</p>
                <p className='mt-1 text-3xl font-bold'>{summary.generated}</p>
              </div>
              <div className='rounded-lg border border-slate-200 bg-white p-4'>
                <p className='text-sm font-semibold text-slate-600'>Employees remaining</p>
                <p className='mt-1 text-3xl font-bold'>{summary.remaining}</p>
              </div>
              <div className='rounded-lg border border-slate-200 bg-white p-4'>
                <p className='text-sm font-semibold text-slate-600'>Average payout</p>
                <p className='mt-1 text-3xl font-bold'>{formatCurrency(summary.averagePayout)}</p>
              </div>
            </section>

            <section className='overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'>
              <div className='border-b border-slate-200 p-4'>
                <h2 className='text-xl font-bold'>Employee Payroll Breakdown</h2>
              </div>
              {monthlyPayrolls.length === 0 ? (
                <p className='p-6 text-slate-600'>No payroll records are available for {formatMonth(selectedMonth)}.</p>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='w-full min-w-[900px] text-left text-sm'>
                    <thead className='bg-slate-50 text-xs uppercase tracking-wide text-slate-500'>
                      <tr>
                        <th className='px-4 py-3'>Employee</th>
                        <th className='px-4 py-3 text-right'>Base</th>
                        <th className='px-4 py-3 text-right'>Overtime</th>
                        <th className='px-4 py-3 text-right'>Deductions</th>
                        <th className='px-4 py-3 text-right'>Final pay</th>
                        <th className='px-4 py-3 text-right'>Present days</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-slate-200'>
                      {monthlyPayrolls.map((payroll) => (
                        <tr key={payroll.id} className='hover:bg-slate-50'>
                          <td className='px-4 py-3'>
                            <p className='font-semibold'>{employeeNames[payroll.employee_id] || 'Unknown employee'}</p>
                            <p className='font-mono text-xs text-slate-500'>{payroll.employee_id}</p>
                          </td>
                          <td className='px-4 py-3 text-right'>{formatCurrency(payroll.base_salary)}</td>
                          <td className='px-4 py-3 text-right'>{formatCurrency(payroll.ot_amount)}</td>
                          <td className='px-4 py-3 text-right'>{formatCurrency(payroll.deduction)}</td>
                          <td className='px-4 py-3 text-right font-bold'>{formatCurrency(payroll.final)}</td>
                          <td className='px-4 py-3 text-right'>{payroll.present_days ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
      </main>
    </>
  )
}

export default AdminReports
