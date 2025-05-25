import React, { useState, useEffect } from "react";
import { Plus, Loader2, ChevronDown } from "lucide-react"; // íconos
import SearchBar from "../components/SearchBar";
import SearchResult from "../components/SearchResult";
import "../styles/styles.css";
import Modal from "../components/Modal";
import "../styles/IngredientsPage.css";
import { useIngredientsStore } from "../store/useIngredientsStore";
import Cards from "../components/cards";

const IngredientsPage = () => {
    
    // constantes para Search Bar
    const [result, setResult] = useState([])
    const [open, setOpen] = useState(false)

    // constantes para Menú desplegable dentro de Modal
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState();

    // constante para campos de ingredientes
    const [formData, setFormData] = useState({
        name: "",
        Units: "",
        unityOfmeasurement: "",
        totalPrice: "",
    });

    const { create, isCreating } = useIngredientsStore();
    const { fetchIngredients, ingredients, isGetting } = useIngredientsStore();

    // Agregar un nuevo ingrediente
    const handleSubmit = async (e) => {
        e.preventDefault();
        await create(formData);
        await fetchIngredients();
        setOpen(false);
        setFormData({
            name: "",
            Units: "",
            unityOfmeasurement: "",
            totalPrice: "",
        });
    };

    // Visualizar ingredientes del usuario
    useEffect(() => {
        fetchIngredients(); // Obtener ingredientes al cargar el componente
    }, []);
    
    // Array de unidades de medida
    const options = ["L",
                    "ml",
                    "kg",
                    "g",
                    "pz",
                    "oz",
                    "cup",
                ];

    return (
        <section className="bg-color-primary-light bg-screen">
            <div className="mx-4 sm:mx-10 lg:mx-16">
                {/* image */}
                <div className="w-full flex justify-center">
                    <img src="/image-13.png" alt="Imagen decorativa" className="w-full max-w-full h-auto object-contain"
                    />
                </div>

                {/* search bar */}
                <div className="flex flex-row w-full mt-4">
                    <div className="w-full mr-4 sm:mr-10">
                        <SearchBar setResult={setResult} ingredients={ingredients} />
                    </div>
                    <button className="p-2 sm:p-4 shadow-md rounded-[50%] bg-color-primary text-white"
                    onClick={() => setOpen(true)}>
                        <Plus size={28}/>
                    </button>
                        <Modal open={open} onClose={() => setOpen(false)}>
                        <form onSubmit={handleSubmit}>
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
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                                type={"number"}
                                                step={"any"}
                                                className="input w-full px-10 shadow-md border-none"
                                                value={formData.Units}
                                                onChange={(e) => setFormData({ ...formData, Units: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium mt-4 my-2">Unidad de medida</span>
                                        </label>
                                        <div className="relative z-50">
                                            <div>
                                            <button
                                                type="button"
                                                onClick={() => setIsOpen(!isOpen)}
                                                className="input inline-flex justify-between items-center w-full min-h-[40px] px-4 border-none shadow-md text-left"
                                                >
                                                <span>{selected}</span>
                                                <ChevronDown className="ml-2 text-color-secondary" />
                                                </button>
                                            </div>
                                            {isOpen && (
                                                <div className="origin-top-right absolute mt-4 w-48 rounded-[20px] shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                                    <div className="p-2">
                                                        {options.map((option, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => {
                                                                    setSelected(option);
                                                                    setFormData({ ...formData, unityOfmeasurement: option });
                                                                    setIsOpen(false);
                                                                }}
                                                                className="w-full text-left p-2 text-sm text-color-primary cursor-pointer hover:bg-color-primary-light rounded-[10px]"
                                                            >
                                                                {option}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="form-control">
                                    <label className="label relative flex md:mx-14">
                                        <span className="label-text font-medium mt-4 my-2 w-full">Precio total</span>
                                    </label>
                                    <div className="relative flex justify-center">
                                        <input
                                            type="number"
                                            step="any"
                                            className="input w-full max-w-sm px-10 shadow-md border-none"
                                            value={formData.totalPrice}
                                            onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                                        />
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
                                                Units: "",
                                                unityOfmeasurement: "",
                                                totalPrice: "",
                                            });
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-primary font-bold" disabled={isCreating}>
                                        {isCreating ? <Loader2 className="size-5 animate-spin" /> : "Guardar"}
                                    </button>
                                </div>
                            </form>
                        </Modal>
                </div>
                <div className="relative">{result.length > 0 && <SearchResult result={result} />}</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {isGetting ? (
                        <p className="col-span-full text-center"><Loader2></Loader2></p>
                    ) : (
                        ingredients.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-[20px] shadow-md p-6 gap-2">
                            <p className="text-xl font-black text-color-primary my-2">{item.name}</p>
                            <p className="text-lg text-color-secondary my-2">
                            Cantidad: <span className="font-black text-color-secondary">{item.Units} {item.unityOfmeasurement}</span>
                            </p>
                            <p className="text-lg text-color-secondary my-2">
                            Precio: <span className="font-black text-color-secondary">${item.totalPrice}</span>
                            </p>
                        </div>
                        ))
                    )}
                </div>
            </div> 
        </section>
    );
};

export default IngredientsPage;
