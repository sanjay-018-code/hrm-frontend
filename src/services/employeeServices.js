import { apiClient } from "../utils/api-client";

export async function get_all_employees(
    page = 1,
    limit = 50,
    search = "",
    sort_by = "name",
    order = "asc"
) {
    const safePage = Math.max(Number(page) || 1, 1)
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 50)

    const { data } = await apiClient.get("/employees/", {
        params: {
            page: safePage,
            limit: safeLimit,
            search,
            sort_by,
            order,
        },
    });

    return data;
}

export async function get_employee_by_id(employee_id){
    const { data } = await apiClient.get(`/employees/${employee_id}`)
    return data
}

export async function add_employee(form_data){
    const { data } = await apiClient.post("/employees/", form_data)
    return data
}

export async function update_employee(employee_id, form_data){
    const { data } = await apiClient.patch(`/employees/${employee_id}`, form_data)
    return data
}

export async function delete_employee(employee_id){
    const { data } = await apiClient.delete(`/employees/${employee_id}`)
    return data
}
