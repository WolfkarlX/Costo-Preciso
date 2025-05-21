import React, { useState } from "react";
import { Search } from 'lucide-react';
import axios from "axios";


const SearchBar = ({setResult}) => {

    const [input, setInput] = useState("")

    const API_URL = "https://jsonplaceholder.typicode.com/users"

    const userData = (value) => {
        axios(API_URL)
            .then(res => {
                const result = res.data.filter(user => {
                    return user && user.name && user.name.toLowerCase().includes(value)
                })
                setResult(result)
                console.log(result);
            }).catch(err => console.log(err))
    }

    const handleChange = (value) => {
        setInput(value)
        console.log(value)
        userData(value)
    }

    return (
        <div className="bg-[#ffffff] w-full rounded-[20px] h-[12] p-4 shadow-lg items-center flex">
            <Search className="text-color-primary cursor-pointer"/>
            <input type="text" className="bg-transparent border-none outline-none text-xl ml-4 text-color-primary w-full"
            onChange={(e) => handleChange(e.target.value)}/>
        </div>
    )
}

export default SearchBar;