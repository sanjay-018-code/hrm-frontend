import { apiClient } from './../utils/api-client'


// CREATE DEPARTMENT
export async function create_department(name) {

    const response = await apiClient.post(
        "/department/",
        {
            name: name.trim()
        }
    )

    return response.data
}


// GET ALL DEPARTMENTS
export async function get_all_departments() {

    const response = await apiClient.get(
        "/department"
    )

    return response.data
}


// GET DEPARTMENT BY ID
export async function get_department_by_id(department_id) {

    const response = await apiClient.get(
        `/department/${department_id}`
    )

    return response.data
}


// GET EMPLOYEES BY DEPARTMENT
export async function get_dep_emp(department_id) {

    const response = await apiClient.get(
        `/department/${department_id}/employees`
    )

    return response.data
}


// UPDATE DEPARTMENT
export async function update_department(
    department_id,
    name
) {

    const response = await apiClient.patch(
        `/department/${department_id}`,
        {
            name: name.trim()
        }
    )

    return response.data
}


// DELETE DEPARTMENT
export async function delete_department(
    department_id
) {

    const response = await apiClient.delete(
        `/department/${department_id}`
    )

    return response.data
}
