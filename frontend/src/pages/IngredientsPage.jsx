import { useState } from "react";
import { Plus, Trash, Egg } from "lucide-react"; // íconos
import SearchBar from "../components/SearchBar";
import SearchResult from "../components/SearchResult";
import "../styles/styles.css";
import Modal from "../components/Modal";
import "../styles/IngredientsPage.css";

const IngredientsPage = () => {
    const [ingredients, setIngredients] = useState([]);
    const [newIngredient, setNewIngredient] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const handleAddIngredient = () => {
        if (newIngredient) {
            setIngredients([...ingredients, newIngredient]);
            setNewIngredient("");
        }
    };

    const handleRemoveIngredient = (index) => {
        const updatedIngredients = ingredients.filter((_, i) => i !== index);
        setIngredients(updatedIngredients);
    };

    const [result, setResult] = useState([])

    const [open, setOpen] = useState(false)

    return (
        <section className="bg-color-primary-light w-full h-screen">
            <div className="mx-4 sm:mx-10 lg:mx-16">
                {/* image */}
                <div className="w-full flex justify-center">
                    <img src="/image-13.png" alt="Imagen decorativa" className="w-full max-w-full h-auto object-contain"
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
                        <div className="text-center w-80"></div>
                            <h3 className="text-xl font-black text-color-secondary text-center">Nuevo ingrediente</h3>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium mt-4 my-2">Nombre</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className={`input w-full pl-10 shadow-md border-none`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium mt-4 my-2">Cantidad</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={"text"}
                                            className="input w-full pl-10 shadow-md border-none"
                                        />
                                    </div>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium mt-4 my-2">Unidad de medida</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={"text"}
                                            className="input w-full pl-10 shadow-md border-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium mt-4 my-2">Precio total</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className={`input w-full pl-10 shadow-md border-none`}
                                    />
                                </div>
                            </div>
                    </Modal>
                </div>
                <SearchResult result = {result} />
            </div> 
        </section>
    );
};

export default IngredientsPage;
