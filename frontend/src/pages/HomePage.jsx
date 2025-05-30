import { useState } from "react";
import { Plus } from 'lucide-react';
import SearchBar from "../components/SearchBar";
import SearchResult from "../components/SearchResult";
import "../styles/styles.css";
import Modal from "../components/Modal";

const HomePage = () => {

    const [result, setResult] = useState([])

    const [open, setOpen] = useState(false)

    return (
        <section className="bg-color-primary-light w-full h-screen">
            <div className="mx-4 sm:mx-10 lg:mx-16">
            {/* image */}
                <div className="w-full flex justify-center">
                    <img src="/image-12.png" alt="Imagen decorativa" className="w-full max-w-full h-auto object-contain"
                    />
                </div>
                {/* search bar */}
                <div className="flex flex-row w-full mt-4">
                    <div className="w-full mr-4 sm:mr-10">
                        <SearchBar setResult = {setResult} />
                    </div>
                    <button className="p-2 sm:p-4 shadow-md rounded-[50%] bg-color-primary text-white"
                    onClick={() => setOpen(true)}>
                        <Plus size={28}/>
                    </button>
                    <Modal open={open} onClose={() => setOpen(false)}>
                        <div className="text-center w-56"></div>
                            <h3 className="text-xl font-black text-color-secondary text-center">Nueva receta</h3>
                        <div className="mx-auto my-4 w-48">
                        </div>
                    </Modal>
                </div>
                <SearchResult result = {result} />

            </div>
        </section>
    );
};

export default HomePage;
