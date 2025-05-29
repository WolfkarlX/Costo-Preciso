import React from "react";

const SearchResult = ({result}) => {
    return (
        <div className="absolute z-50 w-full bg-white flex flex-col shadow-lg rounded-[20px] mt-4 max-h[300px]
        overflow-y-scroll p-2 gap-2 scrollbar scrollbar-thumb-slate-400
        scrollbar-track-slate-200">
            {
                result.map((result, idx) => {
                    return (
                        <div key={idx}>
                            <p className="text-color-primary text-lg cursor-pointer hover:bg-color-primary-light rounded-[10px] p-2">{result.name}</p>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default SearchResult;