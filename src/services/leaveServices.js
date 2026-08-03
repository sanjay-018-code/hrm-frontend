import { apiClient } from "../utils/api-client";

export async function get_all_leaves(){
    const { data } = await apiClient.get("/leave/")
    return data
}

export async function get_leaves_for_date(date) {
    const { data } = await apiClient.get(`/leave/approved/${date}`)
    return data
}

export async function create_leave(payload) {
    const { data } = await apiClient.post("/leave/", payload)
    return data
}

export async function update_leave_status(leaveId, status, leave_type, paid_status){
    const payload = {}
    if (status) payload.status = status
    if (leave_type) payload.leave_type = leave_type
    if (paid_status) payload.paid_status = paid_status
    const { data } = await apiClient.patch(`/leave/${leaveId}`, payload)
    return data
}
