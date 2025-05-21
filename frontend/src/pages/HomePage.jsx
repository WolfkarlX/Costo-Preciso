import { useState } from "react";
import SearchBar from "../components/SearchBar";
import SearchResult from "../components/SearchResult";
import "../styles/styles.css";

const HomePage = () => {

    const [result, setResult] = useState([])

    return (
        <section className="bg-color-primary-light">
            <div className="mx-[10vh]">
                {/* image */}
                <div className="w-full flex justify-center">
                    <img src="/image-12.png" alt="Imagen decorativa" className="w-full max-w-full h-auto object-contain"
                    />
                </div>
                {/* search bar */}
                <div className="flex flex-col w-full mt-4">
                    <div className="w-full">
                        <SearchBar setResult = {setResult} />
                        <SearchResult result = {result} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomePage;
