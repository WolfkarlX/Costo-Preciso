import React, { useState } from "react";
import { Search } from 'lucide-react';

const SearchBar = ({ setResult, ingredients, isSearching }) => {
    const [input, setInput] = useState("");

    //function which normalizes the input
    const normalizeString = (str) => {
        const stopwords = ["de", "la", "el", "en"];

        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")  // accents
            .toLowerCase()
            .replace(/[_-]/g, " ")            // hyphens/underscores → spaces
            .replace(/[^a-z0-9\s]/gi, "")     // remove other symbols
            .split(/\s+/)                     // tokenize
            .filter(word => word && !stopwords.includes(word))
            .map(word => word.endsWith("s") ? word.slice(0, -1) : word) // plurals
            .join(" ");                       // join tokens back with spaces
    };

    //Function to handle the input
    const handleChange = (value) => {
        setInput(value);

        if (value.trim() === "") { //if searchBar is empty returns the items
            setResult([]);
            isSearching(false)
            return;
        }

        const filtered = ingredients.filter(item => {
        const itemTokens = normalizeString(item.name).split(" ");
        const searchTokens = normalizeString(value).split(" ");

            // every search word must appear somewhere in the item tokens
            return searchTokens.every(token =>
                itemTokens.some(t => t.includes(token))
            );
        });

        isSearching(true)
        setResult(filtered);
    };

    return (
        <div className="bg-[#ffffff] w-full rounded-2xl p-2 sm:p-4 shadow-lg items-center flex">
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