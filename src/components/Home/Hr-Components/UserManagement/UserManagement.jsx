import React, { useEffect, useState } from 'react'
import { getAllUsers, updateUser, deleteUser, createUser, getRecoveryRequests, updateRecoveryRequest } from '../../../../services/userServices'
import { get_all_employees } from '../../../../services/employeeServices'
import { getCurrentUser } from '../../../../utils/auth'
import Navbar from '../../../Navbar/Navbar'

const UserManagement = ({ workspaceLabel = 'Admin Workspace' }) => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [employees, setEmployees] = useState([])
  const [roleFilter, setRoleFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [recoveryRequests, setRecoveryRequests] = useState([])
  const currentUser = getCurrentUser()

  const isAdmin = currentUser?.role === 'admin'
  const canEditDelete = isAdmin || currentUser?.role === 'hr'

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await getAllUsers()
      setUsers(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const data = await get_all_employees(1, 100, '', 'name', 'asc')
      setEmployees(data?.employees ?? [])
    } catch (err) {
      console.error('Failed to load employees:', err)
    }
  }

  const fetchRecoveryRequests = async () => {
    try {
      const data = await getRecoveryRequests()
      setRecoveryRequests(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load recovery requests:', err)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchEmployees()
    fetchRecoveryRequests()
  }, [])

  useEffect(() => {
    let filtered = users

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }, [users, roleFilter, searchQuery])

  const handleEditUser = async (userData) => {
    try {
      setLoading(true)
      await updateUser(editingUser.id, userData)
      await fetchUsers()
      setShowEditModal(false)
      setEditingUser(null)
      setMessage('User updated successfully')
      setError(null)
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to update user'
      if (errorMessage.includes('Only admin can update admin users')) {
        setError('Only admin can update admin users')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    try {
      setLoading(true)
      await deleteUser(deletingUserId)
      await fetchUsers()
      setShowDeleteModal(false)
      setDeletingUserId(null)
      setMessage('User deleted successfully')
      setError(null)
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete user'
      if (errorMessage.includes('Only admin can delete admin users')) {
        setError('Only admin can delete admin users')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (userData) => {
    try {
      setLoading(true)
      const cleanData = { ...userData }
      if (!cleanData.employee_id || cleanData.employee_id === '') {
        delete cleanData.employee_id
      }
      if (cleanData.password && cleanData.password.length < 8) {
        setError('Password must be at least 8 characters long')
        setLoading(false)
        return
      }
      console.log('Creating user with data:', cleanData)
      const response = await createUser(cleanData)
      console.log('Create user response:', response)
      await fetchUsers()
      setShowCreateModal(false)
      setMessage('User created successfully')
      setError(null)
    } catch (err) {
      console.error('Create user error:', err)
      console.error('Error response:', err.response?.data)
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to create user'
      if (typeof errorMessage === 'object') {
        setError(JSON.stringify(errorMessage))
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (user) => {
    if (!isAdmin && user.role === 'admin') {
      setError('Only admin can edit admin users')
      return
    }
    setEditingUser(user)
    setShowEditModal(true)
    setError(null)
  }

  const openDeleteModal = (userId) => {
    const user = users.find(u => u.id === userId)
    if (!isAdmin && user && user.role === 'admin') {
      setError('Only admin can delete admin users')
      return
    }
    setDeletingUserId(userId)
    setShowDeleteModal(true)
    setError(null)
  }

  const handleRecoveryDecision = async (requestId, status) => {
    try {
      setLoading(true)
      await updateRecoveryRequest(requestId, { status, review_note: status === 'approved' ? 'Approved by HR' : 'Rejected by HR' })
      await fetchRecoveryRequests()
      setMessage(`Recovery request ${status} successfully`)
      setError(null)
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to update recovery request'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar title="User Management" showBackButton={true} />
      <main className='min-h-screen bg-slate-100 p-4 text-slate-900 md:p-8'>
        <div className='mx-auto max-w-7xl'>
          <div className='mb-6'>
            <p className='text-sm font-semibold uppercase tracking-wide text-slate-500'>{workspaceLabel}</p>
            <h1 className='text-3xl font-bold'>User Management</h1>
            <p className='mt-2 text-lg text-slate-700'>Manage system users and their roles.</p>
          </div>

          {error && <p className='mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{String(error)}</p>}
          {message && <p className='mb-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700'>{String(message)}</p>}

          <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-sm'>
            <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                <div>
                  <label className='text-sm font-semibold text-slate-700'>Search
                    <input
                      type='text'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder='Search by username...'
                      className='ml-2 mt-1 h-11 rounded border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-700'
                    />
                  </label>
                </div>
                <div>
                  <label className='text-sm font-semibold text-slate-700'>Filter by Role
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className='ml-2 mt-1 h-11 rounded border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-700'
                    >
                      <option value='all'>All Roles</option>
                      <option value='admin'>Admin</option>
                      <option value='hr'>HR</option>
                      <option value='employee'>Employee</option>
                    </select>
                  </label>
                </div>
              </div>
              <button
                type='button'
                onClick={fetchUsers}
                disabled={loading}
                className='h-11 rounded bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400'
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                type='button'
                onClick={() => {
                  setShowCreateModal(true)
                  setError(null)
                }}
                className='h-11 rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700'
              >
                Create User
              </button>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full border-collapse border border-slate-200 bg-white'>
                <thead>
                  <tr className='bg-slate-50'>
                    <th className='border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-900'>Username</th>
                    <th className='border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-900'>Role</th>
                    <th className='border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-900'>Employee</th>
                    <th className='border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-900'>User ID</th>
                    {canEditDelete && (
                      <th className='border border-slate-200 px-4 py-3 text-right text-sm font-semibold text-slate-900'>Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={canEditDelete ? 5 : 4} className='border border-slate-200 px-4 py-8 text-center text-slate-600'>
                        {loading ? 'Loading users...' : 'No users found'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const employee = employees.find(emp => emp.id === user.employee_id)
                      return (
                        <tr key={user.id} className='hover:bg-slate-50'>
                          <td className='flex border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900'>{user.username}{user.username === currentUser?.username ?<p className='flex mx-5 border border-blue-800 rounded-full text-blue-500 bg-blue-200 px-2'>
                            CURRENT USER
                          </p>:""}</td>
                          <td className='border border-slate-200 px-4 py-3 text-sm'>
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                              user.role === 'hr' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {user.role.toUpperCase()}
                            </span>
                          </td>
                          <td className='border border-slate-200 px-4 py-3 text-sm text-slate-700'>
                            {employee ? employee.name : 'Not linked'}
                          </td>
                          <td className='border border-slate-200 px-4 py-3 text-sm text-slate-600'>{user.id}</td>
                          {canEditDelete && (
                            <td className='border border-slate-200 px-4 py-3 text-right'>
                              <div className='flex justify-end gap-2'>
                                <button
                                  type='button'
                                  onClick={() => openEditModal(user)}
                                  disabled={!isAdmin && user.role === 'admin'}
                                  className='rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400'
                                  title={!isAdmin && user.role === 'admin' ? 'Only admin can edit admin users' : ''}
                                >
                                  Edit
                                </button>
                                <button
                                  type='button'
                                  onClick={() => openDeleteModal(user.id)}
                                  disabled={!isAdmin && user.role === 'admin'}
                                  className='rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400'
                                  title={!isAdmin && user.role === 'admin' ? 'Only admin can delete admin users' : ''}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className='mt-4 text-sm text-slate-600'>
              Total users: {filteredUsers.length}
            </div>
          </div>

          <div className='mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm'>
            <div className='mb-4 flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-bold text-slate-900'>Account Recovery Requests</h2>
                <p className='text-sm text-slate-600'>Approve or reject forgotten username/password requests from the login panel.</p>
              </div>
              <button
                type='button'
                onClick={fetchRecoveryRequests}
                disabled={loading}
                className='rounded bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400'
              >
                Refresh
              </button>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full border-collapse border border-slate-200 bg-white'>
                <thead>
                  <tr className='bg-slate-50'>
                    <th className='border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-900'>Type</th>
                    <th className='border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-900'>Username</th>
                    <th className='border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-900'>Requested By</th>
                    <th className='border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-900'>Status</th>
                    <th className='border border-slate-200 px-4 py-3 text-right text-sm font-semibold text-slate-900'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recoveryRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className='border border-slate-200 px-4 py-8 text-center text-slate-600'>No recovery requests found</td>
                    </tr>
                  ) : (
                    recoveryRequests.map((request) => (
                      <tr key={request.id} className='hover:bg-slate-50'>
                        <td className='border border-slate-200 px-4 py-3 text-sm capitalize text-slate-900'>{request.request_type}</td>
                        <td className='border border-slate-200 px-4 py-3 text-sm text-slate-700'>{request.username || request.new_username || '—'}</td>
                        <td className='border border-slate-200 px-4 py-3 text-sm text-slate-700'>{request.requested_by || request.employee_id || '—'}</td>
                        <td className='border border-slate-200 px-4 py-3 text-sm'>
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${request.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : request.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className='border border-slate-200 px-4 py-3 text-right'>
                          {request.status !== 'approved' && request.status !== 'rejected' ? (
                            <div className='flex justify-end gap-2'>
                              <button
                                type='button'
                                onClick={() => handleRecoveryDecision(request.id, 'approved')}
                                disabled={loading}
                                className='rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400'
                              >
                                Approve
                              </button>
                              <button
                                type='button'
                                onClick={() => handleRecoveryDecision(request.id, 'rejected')}
                                disabled={loading}
                                className='rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400'
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className='text-xs text-slate-500'>Reviewed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
          <div className='w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-lg'>
            <h2 className='mb-4 text-2xl font-bold text-slate-900'>Edit User</h2>
            {error && <p className='mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{String(error)}</p>}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const updateData = {
                  username: formData.get('username'),
                  employee_id: formData.get('employee_id') || null,
                  password: formData.get('password') || undefined
                }
                if (isAdmin) {
                  updateData.role = formData.get('role')
                }
                const userRole = updateData.role || editingUser.role
                if (updateData.employee_id && userRole !== 'employee') {
                  setError('Only employee users can be linked to employees')
                  return
                }
                handleEditUser(updateData)
              }}
            >
              <div className='mb-4'>
                <label className='mb-2 block text-sm font-semibold text-slate-700'>Username
                  <input
                    name='username'
                    defaultValue={editingUser.username}
                    required
                    className='mt-1 w-full rounded border border-slate-300 bg-white p-2 outline-none focus:border-slate-700'
                  />
                </label>
              </div>
              {isAdmin && (
                <div className='mb-4'>
                  <label className='mb-2 block text-sm font-semibold text-slate-700'>Role
                    <select
                      name='role'
                      defaultValue={editingUser.role}
                      required
                      className='mt-1 w-full rounded border border-slate-300 bg-white p-2 outline-none focus:border-slate-700'
                    >
                      <option value='admin'>Admin</option>
                      <option value='hr'>HR</option>
                      <option value='employee'>Employee</option>
                    </select>
                  </label>
                </div>
              )}
              <div className='mb-4'>
                <label className='mb-2 block text-sm font-semibold text-slate-700'>Link to Employee (optional)
                  <select
                    name='employee_id'
                    defaultValue={editingUser.employee_id || ''}
                    className='mt-1 w-full rounded border border-slate-300 bg-white p-2 outline-none focus:border-slate-700'
                  >
                    <option value=''>Not linked</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} - {emp.department}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className='mb-6'>
                <label className='mb-2 block text-sm font-semibold text-slate-700'>New Password (optional)
                  <input
                    name='password'
                    type='password'
                    className='mt-1 w-full rounded border border-slate-300 bg-white p-2 outline-none focus:border-slate-700'
                  />
                </label>
              </div>
              <div className='flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingUser(null)
                    setError(null)
                  }}
                  className='rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className='rounded bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400'
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
          <div className='w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-lg'>
            <h2 className='mb-4 text-2xl font-bold text-slate-900'>Confirm Delete</h2>
            <p className='mb-6 text-slate-700'>Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className='flex justify-end gap-3'>
              <button
                type='button'
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletingUserId(null)
                  setError(null)
                }}
                className='rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={handleDeleteUser}
                disabled={loading}
                className='rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400'
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
          <div className='w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-lg'>
            <h2 className='mb-4 text-2xl font-bold text-slate-900'>Create New User</h2>
            {error && <p className='mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{String(error)}</p>}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const createData = {
                  username: formData.get('username'),
                  password: formData.get('password'),
                  role: formData.get('role'),
                  employee_id: formData.get('employee_id') || undefined
                }
                if (!createData.employee_id) {
                  delete createData.employee_id
                }
                if (createData.employee_id && createData.role !== 'employee') {
                  setError('Only employee users can be linked to employees')
                  return
                }
                handleCreateUser(createData)
              }}
            >
              <div className='mb-4'>
                <label className='mb-2 block text-sm font-semibold text-slate-700'>Username
                  <input
                    name='username'
                    required
                    className='mt-1 w-full rounded border border-slate-300 bg-white p-2 outline-none focus:border-slate-700'
                  />
                </label>
              </div>
              <div className='mb-4'>
                <label className='mb-2 block text-sm font-semibold text-slate-700'>Password
                  <input
                    name='password'
                    type='password'
                    required
                    minLength={8}
                    className='mt-1 w-full rounded border border-slate-300 bg-white p-2 outline-none focus:border-slate-700'
                  />
                </label>
              </div>
              {isAdmin && (
                <div className='mb-4'>
                  <label className='mb-2 block text-sm font-semibold text-slate-700'>Role
                    <select
                      name='role'
                      required
                      className='mt-1 w-full rounded border border-slate-300 bg-white p-2 outline-none focus:border-slate-700'
                    >
                      <option value='employee'>Employee</option>
                      <option value='hr'>HR</option>
                      <option value='admin'>Admin</option>
                    </select>
                  </label>
                </div>
              )}
              {!isAdmin && (
                <div className='mb-4'>
                  <label className='mb-2 block text-sm font-semibold text-slate-700'>Role
                    <select
                      name='role'
                      required
                      className='mt-1 w-full rounded border border-slate-300 bg-white p-2 outline-none focus:border-slate-700'
                    >
                      <option value='employee'>Employee</option>
                      <option value='hr'>HR</option>
                    </select>
                  </label>
                </div>
              )}
              <div className='mb-6'>
                <label className='mb-2 block text-sm font-semibold text-slate-700'>Link to Employee (optional)
                  <select
                    name='employee_id'
                    className='mt-1 w-full rounded border border-slate-300 bg-white p-2 outline-none focus:border-slate-700'
                  >
                    <option value=''>Not linked</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} - {emp.department}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className='flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={() => {
                    setShowCreateModal(false)
                    setError(null)
                  }}
                  className='rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className='rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400'
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default UserManagement
