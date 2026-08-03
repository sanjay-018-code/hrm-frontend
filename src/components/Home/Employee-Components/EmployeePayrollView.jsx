import React, { useEffect, useState } from 'react'
import { getEmployeePayroll } from '../../../services/payrollSeervices'

const EmployeePayrollView = ({ employeeId }) => {
  const [payrolls, setPayrolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!employeeId) return
    const fetchPayroll = async () => {
      setLoading(true)
      try {
        const data = await getEmployeePayroll(employeeId)
        setPayrolls(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to fetch payroll:', err)
        setError('Unable to load payroll history.')
      } finally {
        setLoading(false)
      }
    }
    fetchPayroll()
  }, [employeeId])

  if (loading) {
    return (
      <main className='min-h-screen bg-slate-100 p-4 text-slate-900 md:p-8'>
        <div className='mx-auto max-w-7xl'>
          <div className='rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm'>
            <p className='text-sm text-slate-500'>Loading payslips...</p>
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
            <h1 className='text-3xl font-bold'>Payroll</h1>
          </div>
        </div>

        {error && <p className='mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{error}</p>}

        {payrolls.length === 0 ? (
          <div className='rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center'>
            <p className='text-base font-semibold text-slate-700'>No payslips generated yet</p>
            <p className='mt-1 text-sm text-slate-500'>Your generated monthly payslips will appear here once processed by HR.</p>
          </div>
        ) : (
          <div className='overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'>
            <table className='w-full text-left text-sm text-slate-700'>
              <thead className='bg-slate-50 text-xs uppercase text-slate-500'>
                <tr>
                  <th className='px-6 py-3'>Month / Year</th>
                  <th className='px-6 py-3'>Base Salary</th>
                  <th className='px-6 py-3'>Present Days</th>
                  <th className='px-6 py-3'>Leave Days</th>
                  <th className='px-6 py-3'>OT Amount</th>
                  <th className='px-6 py-3'>Deduction</th>
                  <th className='px-6 py-3'>Final Pay</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-200'>
                {payrolls.map((item) => (
                  <tr key={item.id || item._id} className='hover:bg-slate-50'>
                    <td className='px-6 py-4 font-semibold text-slate-900'>
                      {item.month} / {item.year}
                    </td>
                    <td className='px-6 py-4'>₹{item.base_salary ? Number(item.base_salary).toLocaleString('en-IN') : '0'}</td>
                    <td className='px-6 py-4'>{item.present_days || 0}</td>
                    <td className='px-6 py-4'>{item.leave_days || 0}</td>
                    <td className='px-6 py-4 text-emerald-600'>+₹{item.ot_amount ? Number(item.ot_amount).toLocaleString('en-IN') : '0'}</td>
                    <td className='px-6 py-4 text-rose-600'>-₹{item.deduction ? Number(item.deduction).toLocaleString('en-IN') : '0'}</td>
                    <td className='px-6 py-4 font-bold text-slate-900'>₹{item.final ? Number(item.final).toLocaleString('en-IN') : '0'}</td>
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

export default EmployeePayrollView
