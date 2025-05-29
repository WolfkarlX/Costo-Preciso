import { useState, useEffect } from "react";
import { Plus, X, ChevronDown, Loader2 } from 'lucide-react';
import SearchBar from "../components/SearchBar";
import SearchResult from "../components/SearchResult";
import "../styles/styles.css";
import Modal from "../components/Modal";
import { useRecipesStore } from "../store/useRecipesStore";

const HomePage = () => {
    // constantes para Search Bar
    const [result, setResult] = useState([]);

    // constantes para Modales
    const [open, setOpen] = useState(false);

    const [isEditMode, setIsEditMode] = useState(false);

    // constante para campos de recetas
        const [formData, setFormData] = useState({
            name: "",
        });

    const {
            isCreating
        } = useRecipesStore();
    
    // Agregar un nuevo ingrediente
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isEditMode && selectedIngredient) {
            await updateIngredient(selectedIngredient._id, formData);
        } else {
            await create(formData);
        }

        await fetchIngredients();
        setOpen(false);
        setFormData({
            name: "",
            
        });
        setSelected(null);
        setIsEditMode(false);
        setSelectedIngredient(null);
    };

    return (
        <section className="bg-color-primary-light w-full h-screen">
            <div className="mx-4 sm:mx-10 lg:mx-16">
                {/* image */}
                <div className="w-full flex justify-center">
                    <img
                        src="/image-12.png"
                        alt="Imagen decorativa"
                        className="w-full max-w-full h-auto object-contain"
                    />
                </div>

                {/* search bar */}
                <div className="flex flex-row w-full mt-4">
                    <div className="w-full mr-4 sm:mr-10">
                        <SearchBar setResult={setResult} />
                    </div>

                    <button
                        className="p-2 sm:p-4 shadow-md rounded-[50%] bg-color-primary text-white"
                        onClick={() => setOpen(true)}
                    >
                        <Plus size={28} />
                    </button>
                    <Modal open={open} onClose={() => setOpen(false)}>
                        <form onSubmit={handleSubmit}>
                        <div className="text-center w-80"></div>
                            <h3 className="text-xl font-black text-color-secondary text-center">
                                {isEditMode ? "Editar receta" : "Nueva receta"}
                            </h3>

                        <div className="md:flex md:gap-6 md:items-start">
                            {/* Sección de imagen */}
                            <div className="form-control w-full md:w-1/3">
                                <label className="label">
                                    <span className="label-text font-medium mt-4 my-2">Imagen</span>
                                </label>
                            </div>

                            {/* Sección de campos de texto */}
                            <div className="w-full md:w-2/3 space-y-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium mt-4 my-2">Nombre</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="input w-full pl-10 shadow-md border-none"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, name: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>

                                </div>
</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 mb-2">
                                <button
                                    type="button"
                                    className="border sm:p-2 border-color-secondary rounded-[15px] font-bold text-color-secondary shadow-md"
                                    onClick={() => {
                                        setOpen(false);
                                        setFormData({
                                            name: "",
                                            
                                        });
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary font-bold" disabled={isCreating}>
                                    {isCreating ? <Loader2 className="size-5 animate-spin" /> : isEditMode ? "Actualizar" : "Guardar"}
                                </button>
                                </div>
                                </form>
                    </Modal>
                </div>

                <SearchResult result={result} />
            </div>
        </section>
    );
};

export default HomePage;
