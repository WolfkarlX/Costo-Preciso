import React, { useRef, useState, useEffect } from "react";
import { Plus, Loader2, ChevronDown, ImageUp, FileInput, Camera, Ellipsis, Pencil, Trash } from "lucide-react"; // íconos
import SearchBar from "../components/SearchBar";
import SearchResult from "../components/SearchResult";
import "../styles/styles.css";
import Modal from "../components/Modal";
import "../styles/IngredientsPage.css";
import { useIngredientsStore } from "../store/useIngredientsStore";

const IngredientsPage = () => {
    
    // constantes para Search Bar
    const [result, setResult] = useState([])

    // constantes para Modales
    const [open, setOpen] = useState(false)
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRef = useRef(null);
    const [inputValue, setInputValue] = useState('');

    // funcion para cerrar modal cuando das clic fuera
    useEffect(() => {
    const handleClickOutside = (event) => {
        const dropdown = document.getElementById(`dropdown-${openDropdownId}`);
        const button = document.getElementById(`button-${openDropdownId}`);

        if (
        dropdown &&
        !dropdown.contains(event.target) &&
        button &&
        !button.contains(event.target)
        ) {
        setOpenDropdownId(null);
        }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openDropdownId]);


    // constantes para Menú desplegable dentro de Modal
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState();

    // constante para campos de ingredientes
    const [formData, setFormData] = useState({
        name: "",
        Units: "",
        unityOfmeasurement: "",
        totalPrice: "",
        image: "",
    });

    const {
        create,
        updateIngredient,
        deleteIngredient,
        fetchIngredients,
        ingredients,
        isGetting,
        isCreating
    } = useIngredientsStore();

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
            Units: "",
            unityOfmeasurement: "",
            totalPrice: "",
            image: "",
        });
        setSelected(null);
        setIsEditMode(false);
        setSelectedIngredient(null);
    };


    // Visualizar ingredientes del usuario
    useEffect(() => {
        fetchIngredients(); // Obtener ingredientes al cargar el componente
    }, []);

    // editar ingrediente
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState(null);

    const handleEdit = (ingredient) => {
        setFormData({
            name: ingredient.name,
            Units: ingredient.Units,
            unityOfmeasurement: ingredient.unityOfmeasurement,
            totalPrice: ingredient.totalPrice,
            image: ingredient.image,
        });
        setSelected(ingredient.unityOfmeasurement);
        setSelectedIngredient(ingredient);
        setIsEditMode(true);
        setOpen(true);
        setOpenDropdownId(null); // Esto cierra el dropdown si estaba abierto
    };


    // eliminar ingrediente
    const handleDelete = async (id) => {
        await deleteIngredient(id);
    };

    
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
                    <img src="/image-13.png" alt="Imagen decorativa" title="Imagen ilustrativa de ingredientes" className="w-full max-w-full h-auto object-contain"
                    />
                </div>

                {/* search bar */}
                <div className="flex flex-row w-full mt-4">
                    <div className="w-full mr-4 sm:mr-10">
                        <SearchBar setResult={setResult} ingredients={ingredients} setInputValue={setInputValue} />
                    </div>
                    <button title="Agregar un nuevo ingrediente" className="p-2 sm:p-4 shadow-md rounded-[50%] bg-color-primary text-white"
                    onClick={() => {
                        setOpen(true);
                        setIsEditMode(false);
                        setFormData({
                        name: "",
                        Units: "",
                        unityOfmeasurement: "",
                        totalPrice: "",
                        image: "",
                        });
                        setSelected(null);
                    }}>
                        <Plus size={28}/>
                    </button>
                        <Modal open={open} onClose={() => setOpen(false)}>
                        <form onSubmit={handleSubmit}>
                            <div className="text-center w-80"></div>
                                <h3 className="text-xl font-black text-color-secondary text-center">
                                    {isEditMode ? "Editar ingrediente" : "Nuevo ingrediente"}
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
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="form-control">
                                                <label className="label">
                                                <span className="label-text font-medium mt-4 my-2">Cantidad</span>
                                                </label>
                                                <input
                                                type="number"
                                                step="any"
                                                className="input w-full px-10 shadow-md border-none"
                                                value={formData.Units}
                                                onChange={(e) => setFormData({ ...formData, Units: e.target.value })}
                                                />
                                            </div>

                                            <div className="form-control relative">
                                                <label className="label">
                                                <span className="label-text font-medium mt-4 my-2">Unidad de medida</span>
                                                </label>
                                                <button
                                                type="button"
                                                onClick={() => setIsOpen(!isOpen)}
                                                className="input inline-flex justify-between items-center w-full min-h-[40px] px-4 border-none shadow-md text-left"
                                                >
                                                <span>{selected}</span>
                                                <ChevronDown className="ml-2 text-color-secondary" />
                                                </button>
                                                {isOpen && (
                                                <div className="origin-top-right absolute mt-4 w-48 rounded-[20px] shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
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

                                        <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium mt-4 my-2">Precio total</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                            type="number"
                                            step="any"
                                            className="input w-full px-10 shadow-md border-none"
                                            value={formData.totalPrice}
                                            onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
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
                                            Units: "",
                                            unityOfmeasurement: "",
                                            totalPrice: "",
                                            image: null,
                                        });
                                        setSelected(null);
                                        setIsEditMode(false);
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
                {/* <div className="relative">{result.length > 0 && <SearchResult result={result} />}</div> */}


                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
    {isGetting ? (
        <p className="col-span-full text-center"><Loader2 /></p>
    ) : (
        // Check if there are search results (result) or fallback to all ingredients
        (result.length > 0 ? result : ingredients).map((item) => (
            <div key={item._id} className="bg-white rounded-[20px] shadow-md p-6 gap-2">
                <div ref={dropdownRef} className="relative flex justify-end">
                    <button
                        id={`button-${item._id}`}
                        className="bg-white text-color-secondary"
                        onClick={() =>
                            setOpenDropdownId((prev) => (prev === item._id ? null : item._id))
                        }
                    >
                        <Ellipsis />
                    </button>

                    {openDropdownId === item._id && (
                        <div
                            id={`dropdown-${item._id}`}
                            className="absolute mt-6 rounded-[20px] shadow-md bg-color-primary-light z-50"
                        >
                            <div className="text-md text-color-primary font-black flex flex-col">
                                <button
                                    className="flex items-center px-4 py-2 m-2 hover:bg-white rounded-[15px] gap-x-2"
                                    onClick={() => handleEdit(item)}
                                >
                                    <Pencil size={20} /> Editar
                                </button>
                                <button
                                    className="flex items-center px-4 py-2 mx-2 mb-2 hover:bg-white rounded-[15px] gap-x-2"
                                    onClick={() => handleDelete(item._id)}
                                >
                                    <Trash size={20} /> Eliminar
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="img-container">
                    <img id="img-ingredient" src={item.image} alt="imagen del ingrediente" title="Imagen del ingrediente" />
                </div>
                <p className="text-xl font-black text-color-primary my-2">{item.name}</p>
                <p className="font-black text-lg text-color-secondary my-2">
                    Cantidad: <span className="font-normal">{item.Units} {item.unityOfmeasurement}</span>
                </p>
                <p className="font-black text-lg text-color-secondary my-2">
                    Precio total: <span className="font-normal">${item.totalPrice}</span>
                </p>
                <p className="font-black text-lg text-color-secondary my-2">
                    Precio unitario: <span className="font-normal">${item.unityPrice}</span>
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
