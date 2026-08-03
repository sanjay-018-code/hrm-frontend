import React, { useEffect, useState } from "react";

import { get_all_employees, add_employee, delete_employee } from "../../../../services/employeeServices";
import { get_all_departments } from "../../../../services/departmentServices";
import EmployeeCard from "./EmployeeCard";
import EmployeeSearch from "./EmployeeSearch";
import Navbar from "../../../Navbar/Navbar";

const initialFormData = {
    name: "",
    department: "",
    designation: "",
    joining_date: new Date().toISOString().split("T")[0],
    salary: "",
    phone: "",
    email: "",
};

const EmployeeList = ({ workspaceLabel = 'HR Workspace' }) => {
    const [employees, setEmployees] = useState([]);
    const [employeeDetails, setEmployeeDetails] = useState(null);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState("name")
    const [order, setOrder] = useState("asc")
    const [addStatus, setAddStatus] = useState(false)
    const [formData, setFormData] = useState(initialFormData)
    const [formError, setFormError] = useState("")
    const [updatePopupKey, setUpdatePopupKey] = useState(0)
    const [departments, setDepartments] = useState([])

    useEffect(() => {
        fetchEmployees();
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const data = await get_all_departments();
            setDepartments(data || []);
        } catch (err) {
            console.error("Failed to fetch departments:", err);
        }
    };

    const fetchEmployees = async (searchText = "", sortByValue = sortBy, orderValue = order) => {
        try {
            const data = await get_all_employees(
                1,
                10,
                searchText,
                sortByValue,
                orderValue
            );

            setEmployees(data);
        } catch (err) {
            setError(err);
            console.error(err);
        }
    };

    const handleSearch = (searchText, sortByValue, orderValue) => {
        setEmployeeDetails(null);
        setSortBy(sortByValue);
        setOrder(orderValue);
        fetchEmployees(searchText, sortByValue, orderValue);
    };

    const handleReset = () => {
        setEmployeeDetails(null);
        setSortBy("name");
        setOrder("asc");
        fetchEmployees("");
    };

    const handleEmployeeUpdate = (updatedEmployee) => {
        setEmployeeDetails(updatedEmployee);
        fetchEmployees();
    };

    const handleEmployeeDelete = () => {
        setEmployeeDetails(null);
        fetchEmployees();
    };

    const handleEmployeeCardUpdate = (selectedEmployee) => {
        setEmployeeDetails(selectedEmployee);
        setUpdatePopupKey((currentKey) => currentKey + 1);
    };

    const handleEmployeeCardDelete = async (employeeId) => {
        if (!window.confirm("Are you sure you want to delete this employee?")) {
            return;
        }

        try {
            await delete_employee(employeeId);
            if (employeeDetails?.id === employeeId) {
                setEmployeeDetails(null);
            }
            fetchEmployees();
        } catch (err) {
            setError(err);
            console.error(err);
        }
    };

    const handleAddEmployee = () => {
        setAddStatus(!addStatus);
    }

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "salary" ? Number(value) : value,
        }));
    };

    const handleAddSubmit = async (e) => {
    e.preventDefault();

    const confirmed = window.confirm("Are you sure you want to add this employee?");
    if (!confirmed) return;

    setFormError("");

    if (!formData.name || !formData.department || !formData.designation || !formData.joining_date || !formData.salary || !formData.phone || !formData.email) {
        setFormError("Please fill in all fields");
        return;
    }

    try {
        const payload = {
            ...formData,
            salary: Number(formData.salary),
            phone: String(formData.phone),
        };

        await add_employee(payload);
        setAddStatus(false);
        setFormData(initialFormData);
        fetchEmployees();
    } catch (err) {
        setFormError(err.message || "Failed to add employee");
        console.error(err);
    }
};

    return (
        <>
        <Navbar title="Employee Management" showBackButton={true} />
        <main className="flex min-h-screen bg-slate-100 text-slate-900">
            <EmployeeSearch 
                onSearch={handleSearch}
                onReset={handleReset}
                error={error}
                employeeDetails={employeeDetails}
                onEmployeeUpdate={handleEmployeeUpdate}
                onEmployeeDelete={handleEmployeeDelete}
                updatePopupKey={updatePopupKey}
            />
            <div className="w-[75%] overflow-y-auto p-4 md:p-8" >
                <div className="mb-6 flex flex-row items-center justify-between" >
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{workspaceLabel}</p>
                        <h1 className="text-3xl font-bold">Employees</h1>
                    </div>
                    <button onClick={handleAddEmployee} className="rounded bg-slate-800 px-4 py-2 font-semibold text-white hover:bg-slate-700">Add Employee</button>
                </div>
                {
                    addStatus === true && 
                    <div>
                        <form onSubmit={handleAddSubmit} className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="font-semibold text-slate-700">Name</label>
                                    <input onChange={handleFormChange} className="h-11 rounded border border-slate-300 p-2 outline-none focus:border-slate-700" name="name" type="text" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="font-semibold text-slate-700">Department</label>
                                    <select onChange={handleFormChange} className="h-11 rounded border border-slate-300 p-2 outline-none focus:border-slate-700 bg-white" name="department" required>
                                        <option value="">Select Department</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="font-semibold text-slate-700">Designation</label>
                                    <input onChange={handleFormChange} className="h-11 rounded border border-slate-300 p-2 outline-none focus:border-slate-700" name="designation" type="text" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="font-semibold text-slate-700">Salary</label>
                                    <input onChange={handleFormChange} className="h-11 rounded border border-slate-300 p-2 outline-none focus:border-slate-700" name="salary" type="number" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="font-semibold text-slate-700">Phone</label>
                                    <input onChange={handleFormChange} className="h-11 rounded border border-slate-300 p-2 outline-none focus:border-slate-700" name="phone" type="number" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="font-semibold text-slate-700">Email</label>
                                    <input onChange={handleFormChange} className="h-11 rounded border border-slate-300 p-2 outline-none focus:border-slate-700" name="email" type="text" />
                                </div>
                            </div>
                            {formError && (
                                <p className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{String(formError)}</p>
                            )}
                            <div className="mt-4 flex justify-end">
                                <button type="submit" className="rounded bg-slate-800 px-4 py-2 font-semibold text-white hover:bg-slate-700">
                                    Save Employee
                                </button>
                            </div>
                        </form>
                    </div>
                }
                <EmployeeCard
                    details={employees}
                    onEmployeeSelect={setEmployeeDetails}
                    onEmployeeUpdateClick={handleEmployeeCardUpdate}
                    onEmployeeDeleteClick={handleEmployeeCardDelete}
                />
            </div>
        </main>
        </>
    );
};

export default EmployeeList;
