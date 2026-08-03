import { apiClient } from '../utils/api-client'

export async function get_all_attendance(page = 1, limit = 20, employeeId = null, order = 'desc') {
  const params = { page, limit, order }
  if (employeeId) {
    params.employee_id = employeeId
  }
  const { data } = await apiClient.get('/attendance/', { params })
  return data
}

export async function get_today_attendance_stats() {
  const { data } = await apiClient.get('/dashboard/chart')
  return data
}

export async function mark_attendance(payload) {
  const { data } = await apiClient.post('/attendance/', payload)
  return data
}

export async function update_attendance(attendanceId, payload) {
  const { data } = await apiClient.patch(`/attendance/${attendanceId}`, payload)
  return data
}

export async function delete_attendance(attendanceId) {
  const { data } = await apiClient.delete(`/attendance/${attendanceId}`)
  return data
}
