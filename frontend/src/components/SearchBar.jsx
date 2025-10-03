import React, { useState } from "react";
import { Search } from 'lucide-react';

const SearchBar = ({ setResult, ingredients }) => {
    const [input, setInput] = useState("");

    const handleChange = (value) => {
        setInput(value);

        // Si el input está vacío, limpiamos los resultados
        if (value.trim() === "") {
            setResult([]);
            return;
        }

        const filtered = ingredients.filter(item =>
            item.name.toLowerCase().includes(value.toLowerCase())
        );

        setResult(filtered);
    };

    return (
        <div className="bg-[#ffffff] w-full rounded-[20px] p-2 sm:p-4 shadow-lg items-center flex">
            <Search className="text-color-primary" />
            <input
                type="text"
                className="bg-transparent border-none outline-none text-xl ml-4 text-color-primary w-full"
                onChange={(e) => handleChange(e.target.value)}
                value={input}
            />
        </div>
    );
};

export default SearchBar;