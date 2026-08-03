import { apiClient } from './../utils/api-client';

export async function get_all_departments() {
    const data =await apiClient.get("/department")
    return data.data
    
}

export async function get_department_by_id(department_id){
    const data = await apiClient.get(`/department/${department_id}`)
    return data.data
}

export async function get_dep_emp(department_id){
    const data = await apiClient.get(`/department/${department_id}/employees`)
    return data.data
}

export async function update_department(department_id, name){
    const { data } = await apiClient.patch(`/department/${department_id}`, null, {
        params: { name }
    })
    return data
}

export async function delete_department(department_id){
    const { data } = await apiClient.delete(`/department/delete/${department_id}`)
    return data
}