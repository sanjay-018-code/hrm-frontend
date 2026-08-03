import { apiClient } from './../utils/api-client';

export async function getAllPayroll(){
    const response = await apiClient.get("/payroll")
    return response.data
}

export async function generatePayroll(employee_id, month, year){
    const response = await apiClient.post("/payroll", {
        employee_id,
        month,
        year,
    })
    return response.data
}

export async function getEmployeePayroll(employee_id){
    const response = await apiClient.get(`/payroll/employee/${employee_id}`)
    return response.data
}

export async function getPayrollById(payroll_id){
    const response = await apiClient.get(`/payroll/details/${payroll_id}`)
    return response.data
}

export async function deletePayroll(payroll_id){
    const response = await apiClient.delete(`/payroll/${payroll_id}`)
    return response.data
}