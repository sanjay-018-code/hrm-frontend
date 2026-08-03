import React from 'react'
import { useNavigate } from 'react-router-dom'
import { logout, getCurrentUser } from '../../utils/auth'

const Navbar = ({ title = 'HR Management System', showBackButton = false }) => {
  const navigate = useNavigate()
  const user = getCurrentUser()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleHome = () => {
    const role = user?.role || 'hr'
    navigate(`/${role}`)
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <nav className='border-b border-slate-200 bg-white px-4 py-3 shadow-sm'>
      <div className='mx-auto flex max-w-7xl items-center justify-between'>
        <div className='flex items-center gap-4'>
          {showBackButton && (
            <button
              type='button'
              onClick={handleBack}
              className='rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              ← Back
            </button>
          )}
          <button
            type='button'
            onClick={handleHome}
            className='text-xl font-bold text-slate-900 hover:text-slate-700'
          >
            {title}
          </button>
        </div>
        <div className='flex items-center gap-4'>
          {user && (
            <span className='text-sm text-slate-600'>
              {user.username} ({user.role})
            </span>
          )}
          <button
            type='button'
            onClick={handleLogout}
            className='rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700'
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
