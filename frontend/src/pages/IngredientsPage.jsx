import React, { useRef, useState, useEffect } from "react";
import { Plus, Loader2, ChevronDown, Ellipsis, CircleX, Pencil, Trash, CloudDownload, FileImage   } from "lucide-react";
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
    const [selectedOption, setSelectedOption] = useState(null);
    const toggling = () => setIsOpen(!isOpen);

    // Efecto para cerrar el dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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
        isCreating,
        isUpdating,
        isDeleting,
        deletingId // ID del elemento que se está eliminando    
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
        setSelectedOption(null);
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
            image: ingredient.image || ingredient.imageUrl,
        });
        setSelectedOption(ingredient.unityOfmeasurement);
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
                    "gr",
                    "pz",
                    "oz",
                    "cup",
                ];

    // constantes para subir imagen
    const fileInputRef = useRef(null);
    const [fileName, setFileName] = useState("");

    return (
        <section className="bg-color-primary-light w-full min-h-screen">
            <div className="mx-4 sm:mx-10 lg:mx-16">
                {/* image */}
                <div className="w-full flex justify-center">
                    <img src="/image-13.png" 
                    alt="Imagen decorativa" 
                    title="Imagen ilustrativa de ingredientes" 
                    className="w-full max-w-full h-auto object-contain"
                    />
                </div>

                {/* search bar */}
                <div className="flex flex-row w-full mt-4">
                    <div className="w-full mr-4 sm:mr-10">
                        <SearchBar setResult={setResult} ingredients={ingredients} />
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
                        setSelectedOption(null);
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
                                        <div className="bg-white rounded-[20px] shadow-md w-full flex flex-col justify-center items-center">
                                            {formData.image ? (
                                                <img
                                                className="w-full h-40 object-contain rounded-md"
                                                src={formData.image}
                                                alt="preview"
                                                />
                                            ) : (
                                                <div className="gap-4 w-full h-40 flex flex-col justify-center items-center text-md text-color-primary">
                                                <CloudDownload 
                                                    size={60}
                                                    onClick={() => fileInputRef.current.click()}
                                                    className="cursor-pointer"/>
                                                Cargar imagen
                                                </div>
                                            )}
                                            </div>

                                            <div className="w-full mt-4">
                                                <div className="w-full flex justify-between items-center bg-color-primary input border border-none shadow-md p-4">
                                                    {/* Nombre del archivo */}
                                                    <div className="text-sm text-white truncate max-w-[110px] text-center">
                                                    {fileName || "No seleccionado"}
                                                    </div>

                                                    {/* Botón para limpiar */}
                                                    <CircleX 
                                                    size={20}
                                                    className="text-white cursor-pointer"
                                                    onClick={() => {
                                                        fileInputRef.current.value = "";
                                                        setFormData({ ...formData, image: null });
                                                        setFileName("");
                                                    }}
                                                    />
                                                </div>

                                                {/* Input oculto */}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    ref={fileInputRef}
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setFileName(file.name);
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                        setFormData({ ...formData, image: reader.result });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                    }}
                                                />
                                                 {/* Texto de ayuda */}
                                                <p className="text-xs text-gray-500 text-center mt-2">
                                                    Formatos: JPG, PNG, WEBP<br />
                                                    Máx: 5MB
                                                </p>
                                            </div>
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

                                            <div className="form-control relative z-50">
                                                <label className="label">
                                                    <span className="label-text font-medium mt-4 my-2">Unidad de medida</span>
                                                </label>
                                                <div className="w-[100%] relative inline-flex rounded-[20px] shadow-md input border-none" ref={dropdownRef}>
                                                    <div className="w-[100%]">
                                                        <button
                                                        type="button"
                                                        onClick={toggling}
                                                        className="w-[100%]">
                                                            {selectedOption}
                                                        </button>
                                                    </div>
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            onClick={toggling}
                                                            className="flex items-center justify-center px-3 self-stretch">
                                                                <ChevronDown className="text-color-secondary" />
                                                        </button>
                                                    </div>
                                                    {isOpen && (
                                                        <div className="absolute top-[100%] left-0 right-0 z-[9999] mt-2 w-full px-4 py-2
                                                        origin-top-right rounded-[20px] border border-none bg-white shadow-md">
                                                            <div className="max-h-40 overflow-y-auto"> {/* Contenedor con scroll */}
                                                            {options.map((option) => (
                                                                    <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedOption(option);
                                                                        setFormData({ ...formData, unityOfmeasurement: option });
                                                                        setIsOpen(false);
                                                                    }}
                                                                    className="block w-full px-4 py-2 cursor-pointer font-black 
                                                                        text-color-secondary no-underline rounded-[10px] hover:bg-color-primary-light"                                                                   
                                                                    key={option} >
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
                                            setSelectedOption(null);
                                            setIsEditMode(false);
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary font-bold" 
                                        disabled={isCreating || isUpdating}
                                        >
                                        {isCreating || isUpdating ? (
                                            <Loader2 className="size-5 animate-spin" />
                                        ) : isEditMode ? "Actualizar" : "Guardar"}
                                    </button>
                                </div>
                            </form>
                        </Modal>
                </div>
                <div className="relative">{result.length > 0 && <SearchResult result={result} />}</div>

                {/*Visualización de ingredientes*/}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {isGetting ? (
                    <p className="col-span-full text-center"><Loader2 /></p>
                ) : (
                    ingredients.map((item) => (
                    <div key={item._id} className="relative bg-white rounded-[20px] shadow-md p-4 flex flex-col min-h-[400px]">
                        <div className="absolute top-3 right-3">
                            <button 
                                id={`button-${item._id}`}
                                className="text-color-secondary hover:bg-color-primary-light rounded-full p-2"
                                onClick={() => setOpenDropdownId((prev) => (prev === item._id ? null : item._id))}
                            >
                                <Ellipsis />
                            </button>

                            {openDropdownId === item._id && (
                                <div
                                id={`dropdown-${item._id}`}
                                className="absolute right-0 mt-2 rounded-[20px] shadow-md bg-color-primary-light z-50"
                                role="menu"
                                >
                                <div className="text-md text-color-primary font-black flex flex-col">
                                    <button
                                        className="flex items-center px-4 py-2 m-2 hover:bg-white rounded-[15px] gap-x-2"
                                        onClick={() => handleEdit(item)}
                                        role="menuitem"
                                    >
                                        <Pencil size={20} /> Editar
                                    </button>
                                    <button
                                        className="flex items-center px-4 py-2 mx-2 mb-2 hover:bg-white rounded-[15px] gap-x-2"
                                        onClick={() => handleDelete(item._id)}
                                        disabled={isDeleting}
                                        role="menuitem"
                                    >
                                    {isDeleting && deletingId === item._id ? (
                                        <Loader2 size={20} className="animate-spin mr-2" />
                                    ) : (
                                        <Trash size={20} />
                                    )}
                                    {isDeleting && deletingId === item._id ? "" : "Eliminar"}
                                    </button>
                                </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-grow flex flex-col pt-6 px-4">
                            <img 
                                id="img-ingredient" 
                                src={item.imageUrl || item.image}
                                alt="imagen del ingrediente" 
                                title="Imagen del ingrediente"
                                className="w-24 h-24 object-cover rounded-full border border-none"
                            />
                            <p
                                className="text-xl font-black text-color-primary my-2 break-words"
                                title={item.name}
                            >
                                {item.name}
                            </p>
                            <p className="text-lg text-color-secondary my-1">
                                Cantidad:{" "}
                                <span className="font-black">
                                {item.Units} {item.unityOfmeasurement}
                                </span>
                            </p>
                            <p className="text-lg text-color-secondary my-1">
                                Precio total: <span className="font-black">${item.totalPrice}</span>
                            </p>
                            <p className="text-lg text-color-secondary my-1 break-words">
                                Precio unitario:{" "}
                                <span className="font-black">${item.unityPrice}</span>
                            </p>
                        </div>
                    </div>
                    ))
                )}
                </div>
            </div> 
        </section>
    );
};

export default IngredientsPage;