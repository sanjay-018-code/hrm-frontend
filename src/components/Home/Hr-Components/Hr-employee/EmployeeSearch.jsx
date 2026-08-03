import React, { useState } from 'react'

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import EmployeePanel from './EmployeePanel';

const muiSelectSx = {
  '& .MuiOutlinedInput-root': {
    color: '#0f172a',
    '& fieldset': {
      borderColor: '#cbd5e1'
    },
    '&:hover fieldset': {
      borderColor: '#94a3b8'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#334155'
    }
  },
  '& .MuiInputLabel-root': {
    color: '#64748b'
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#334155'
  }
}

const EmployeeSearch = ({ onSearch, onReset, error, employeeDetails, onEmployeeUpdate, onEmployeeDelete, updatePopupKey }) => {
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [order, setOrder] = useState("asc");

     const handleChange = (e) => {
        setSearch(e.target.value);
    };
        const handleSortByChange = (event) => {
        setSortBy(event.target.value);
    }

    const handleOrderChange = (event) => {
        setOrder(event.target.value);
    }

    const handleSearch = () => {
        onSearch(search, sortBy, order);
    }

    const handleReset = () => {
        setSearch("");
        setSortBy("name");
        setOrder("asc");
        onReset();
    }

  return (
    <div className="w-[25%] overflow-y-auto border-r border-slate-200 bg-white p-4 text-slate-900">
                <h1 className="text-2xl font-bold text-slate-900">Search</h1>

                <input
                    type="text"
                    value={search}
                    onChange={handleChange}
                    placeholder="Search employees..."
                    className="mt-5 w-full rounded border border-slate-300 bg-white p-2 font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-700"
                />
                <div className="flex flex-row" >
                <div className=" flex mt-6 mr-5 w-[45%]" >
                <FormControl fullWidth sx={muiSelectSx}>
                    <InputLabel id="demo-simple-select-label">Sort By</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={sortBy}
                        label="Sort By"
                        onChange={handleSortByChange}
                    >
                        <MenuItem value="name">Name</MenuItem>
                        <MenuItem value="department">Department</MenuItem>
                    </Select>
                </FormControl>
                </div>
                <div className="flex mt-6 w-[45%]" >
                <FormControl fullWidth sx={muiSelectSx}>
                    <InputLabel id="demo-simple-select-label-order">Order</InputLabel>
                    <Select
                        labelId="demo-simple-select-label-order"
                        id="demo-simple-select-order"
                        value={order}
                        label="Order"
                        onChange={handleOrderChange}
                    >
                        <MenuItem value="asc">Ascending</MenuItem>
                        <MenuItem value="desc">Descending</MenuItem>
                    </Select>
                </FormControl>
                </div>
                </div>

                <button
                    onClick={handleSearch}
                    className="mt-5 w-full h-10 rounded bg-slate-800 text-white font-bold hover:bg-slate-700"
                >
                    Search
                </button>
                <button
                    onClick={handleReset}
                    className="mt-3 w-full h-10 rounded border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                    Reset
                </button>

                {error && (
                    <p className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        Failed to load employees.
                    </p>
                )}
                <EmployeePanel
                    employeeDetails={employeeDetails}
                    onEmployeeUpdate={onEmployeeUpdate}
                    onEmployeeDelete={onEmployeeDelete}
                    updatePopupKey={updatePopupKey}
                />
                
            </div>
  )
}

export default EmployeeSearch
