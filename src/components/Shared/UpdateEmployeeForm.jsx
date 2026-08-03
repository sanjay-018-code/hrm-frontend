import React from 'react'

const UpdateEmployeeForm = ({
  isOpen,
  employeeForm,
  error,
  onChange,
  onSubmit,
  onClose,
  title = 'Update Employee'
}) => {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
      <form onSubmit={onSubmit} className='w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6 text-slate-900 shadow-xl'>
        <div className='flex items-center justify-between mb-5'>
          <h2 className='text-3xl font-bold'>{title}</h2>
          <button type='button' onClick={onClose} className='hover:cursor-pointer text-2xl font-bold text-slate-500 hover:text-slate-700'>X</button>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {Object.entries(employeeForm).map(([field, value]) => (
            <label key={field} className='flex flex-col gap-2 text-sm font-semibold uppercase text-slate-700'>
              {field.replace(/_/g, ' ')}
              <input
                name={field}
                type={field === 'salary' ? 'number' : 'text'}
                value={value}
                onChange={onChange}
                required
                className='h-10 rounded border border-slate-300 bg-white p-2 font-normal normal-case outline-none focus:border-slate-700'
              />
            </label>
          ))}
        </div>

        {error && <p className='mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{String(error)}</p>}

        <div className='flex gap-3 mt-6'>
          <button type='submit' className='w-full h-10 rounded bg-slate-800 text-white font-bold hover:bg-slate-700'>Save</button>
          <button type='button' onClick={onClose} className='w-full h-10 rounded border border-slate-300 text-slate-700 font-bold hover:bg-slate-50'>Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default UpdateEmployeeForm
