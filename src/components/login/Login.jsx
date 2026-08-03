import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { login, requestForgotUsername, requestForgotPassword } from '../../services/userServices';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { getCurrentUser } from '../../utils/auth';

const getErrorMessage = (error) => {
  const detail = error?.response?.data?.detail

  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || item?.detail || JSON.stringify(item)).join(' ') 
  }

  if (detail && typeof detail === 'object') {
    return detail?.msg || detail?.detail || JSON.stringify(detail)
  }

  return detail || error?.message || 'Request failed'
}

const Login = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username:"",
    password:"",
    loginType: "administration"
  })
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recoveryMode, setRecoveryMode] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState({ type: '', text: '' });
  const [recoveryForm, setRecoveryForm] = useState({
    employee_id: '',
    new_username: '',
    username: '',
    old_password: '',
    new_password: '',
    reason: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData, [e.target.name] : e.target.value
    })
  }

  const handleRecoveryChange = (e) => {
    setRecoveryForm({
      ...recoveryForm,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    login(formData)
      .then(() => {
        const user = getCurrentUser()
        
        if (formData.loginType === "employee" && user?.role !== "employee") {
          setError("Only employees can use Employee login. Please use Administration login.");
          setLoading(false);
          return;
        }
        
        if (formData.loginType === "administration" && user?.role === "employee") {
          setError("Employees cannot use Administration login. Please use Employee login.");
          setLoading(false);
          return;
        }
        
        if (user?.role === "admin") {
          navigate('/admin');
        } else if (user?.role === "hr") {
          navigate('/hr');
        } else if (user?.role === "employee") {
          navigate('/employee');
        }
      })
      .catch((error) => {
        const message = getErrorMessage(error)
        setError(message);
      })
      .finally(() => setLoading(false));
  };

  const handleRecoverySubmit = async (event) => {
    event.preventDefault();
    setRecoveryLoading(true);
    setRecoveryMessage({ type: '', text: '' });

    try {
      if (recoveryMode === 'username') {
        await requestForgotUsername({
          employee_id: recoveryForm.employee_id,
          new_username: recoveryForm.new_username,
          reason: recoveryForm.reason,
        })
        setRecoveryMessage({ type: 'success', text: 'Username change request sent to HR for approval.' })
      } else {
        await requestForgotPassword({
          username: recoveryForm.username,
          old_password: recoveryForm.old_password,
          new_password: recoveryForm.new_password,
          reason: recoveryForm.reason,
        })
        setRecoveryMessage({ type: 'success', text: 'Password change request sent to HR for approval.' })
      }

      setRecoveryForm({
        employee_id: '',
        new_username: '',
        username: '',
        old_password: '',
        new_password: '',
        reason: ''
      })
    } catch (requestError) {
      const message = getErrorMessage(requestError)
      setRecoveryMessage({ type: 'error', text: message })
    } finally {
      setRecoveryLoading(false)
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center">
      <div className="flex w-1/2 flex-col items-center justify-center rounded shadow signup_form">
        <form onSubmit={handleSubmit} className="flex w-full flex-col items-center justify-center p-4">
          <h1 className='text-2xl mt-4 font-bold mb-10 text-red-400' >Login</h1>
          <div className='mb-4 w-[80%]'>
            <TextField
              onChange={handleChange}
              name='loginType'
              value={formData.loginType}
              fullWidth
              label="Login Type"
              select
              id="loginType"
              size='small'
              disabled={loading}
            >
              <MenuItem value="administration">Administration (Admin/HR)</MenuItem>
              <MenuItem value="employee">Employee</MenuItem>
            </TextField>
          </div>
          <div className='mb-4 w-[80%]'>
            <TextField onChange={handleChange} name='username' value={formData.username} fullWidth label="Username" type='text' id="fullWidth" size='small' disabled={loading} />
          </div>
          <div className='mb-4 w-[80%]'>
            <TextField onChange={handleChange}  name='password' value={formData.password} fullWidth label="Password" type='password' id="fullWidth" size='small' disabled={loading} />
          </div>
          {error && <p className='text-red-500 mb-4'>{error}</p>}
          <div className='flex flex-row mb-4 p-5'><Button type='submit' variant="contained" disabled={loading}>{loading ? 'Logging in...' : 'Submit'}</Button></div>
          <div className='mb-6 flex gap-2 text-sm'>
            <button type='button' onClick={() => setRecoveryMode('username')} className='text-blue-600 hover:underline'>Forgot Username</button>
            <span className='text-slate-400'>|</span>
            <button type='button' onClick={() => setRecoveryMode('password')} className='text-blue-600 hover:underline'>Reset Password</button>
          </div>
        </form>

        {recoveryMode && (
          <form onSubmit={handleRecoverySubmit} className='mb-8 w-[80%] rounded border border-slate-200 bg-slate-50 p-4'>
            <h2 className='mb-3 text-lg font-bold text-slate-900'>Request {recoveryMode === 'username' ? 'Username Change' : 'Password Change'}</h2>
            {recoveryMessage.text && (
              <p className={`mb-3 rounded p-2 text-xs font-semibold ${recoveryMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {recoveryMessage.text}
              </p>
            )}

            {recoveryMode === 'username' ? (
              <>
                <div className='mb-3'>
                  <TextField onChange={handleRecoveryChange} name='employee_id' value={recoveryForm.employee_id} fullWidth label='Employee ID' type='text' size='small' />
                </div>
                <div className='mb-3'>
                  <TextField onChange={handleRecoveryChange} name='new_username' value={recoveryForm.new_username} fullWidth label='New Username' type='text' size='small' />
                </div>
              </>
            ) : (
              <>
                <div className='mb-3'>
                  <TextField onChange={handleRecoveryChange} name='username' value={recoveryForm.username} fullWidth label='Current Username' type='text' size='small' />
                </div>
                <div className='mb-3'>
                  <TextField onChange={handleRecoveryChange} name='old_password' value={recoveryForm.old_password} fullWidth label='Old Password' type='password' size='small' />
                </div>
                <div className='mb-3'>
                  <TextField onChange={handleRecoveryChange} name='new_password' value={recoveryForm.new_password} fullWidth label='New Password' type='password' size='small' />
                </div>
              </>
            )}

            <div className='mb-3'>
              <TextField onChange={handleRecoveryChange} name='reason' value={recoveryForm.reason} fullWidth label='Reason' type='text' size='small' />
            </div>

            <div className='flex gap-2'>
              <Button type='submit' variant='contained' disabled={recoveryLoading}>
                {recoveryLoading ? 'Submitting...' : 'Submit Request'}
              </Button>
              <Button type='button' variant='outlined' onClick={() => setRecoveryMode('')}>
                Close
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

export default Login