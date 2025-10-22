import React, { useRef, useState, useEffect } from "react";
import { Plus, X, ChevronDown, Ellipsis, Pencil, Trash, Loader2, CloudDownload, FileImage, CircleX} from 'lucide-react';
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import "../styles/styles.css";
import { useRecipesStore } from "../store/useRecipesStore";
import { toast } from "react-hot-toast";

const HomePage = () => {
    const [result, setResult] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const plusDropdownRef = useRef(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpen2, setIsOpen2] = useState(false);
    const [selected, setSelected] = useState("");
    const [selectedIngredients, setSelectedIngredients] = useState([]); // Para ingredientes
    const [editingRecipe, setEditingRecipe] = useState(null); // Para receta en edición
    const [open, setOpen] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRef = useRef(null);
    //const [inputValue, setInputValue] = useState('');
    const [recipeData, setRecipeData] = useState({});


    useEffect(() => {
        const handleClickOutside = (event) => {
            const dropdown = document.getElementById(`dropdown-${openDropdownId}`);
            const button = document.getElementById(`button-${openDropdownId}`);
            if (dropdown && !dropdown.contains(event.target) && button && !button.contains(event.target)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openDropdownId]);

    const [formData, setFormData] = useState({
        name: "",
        ingredients: [],
        portionsPerrecipe: "",
        quantityPermeasure: "",
        aditionalCostpercentages: "",
        profitPercentage: "",
        UnitOfmeasure: "",
        recipeunitOfmeasure: "",
        image: "",
    });

    // Referencias para los dropdowns de unidad de medida
    const unitDropdownRefs = useRef([]);
    const portionUnitDropdownRef = useRef(null);

    // Efecto para cerrar dropdowns al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Para el dropdown del botón Plus
            if (openDropdown && plusDropdownRef.current && !plusDropdownRef.current.contains(event.target)) {
                const plusButton = document.querySelector('button[title="Agregar una nueva receta"]');
                if (plusButton && !plusButton.contains(event.target)) {
                    setOpenDropdown(false);
                }
            }

            // Para los dropdowns de unidad de medida de ingredientes
            selectedIngredients.forEach((ingredient, index) => {
                if (ingredient.dropdownOpen && unitDropdownRefs.current[index] && 
                    !unitDropdownRefs.current[index].contains(event.target)) {
                    const updated = [...selectedIngredients];
                    updated[index].dropdownOpen = false;
                    setSelectedIngredients(updated);
                }
            });

            // Para el dropdown de unidad de medida por porción
            if (isOpen && portionUnitDropdownRef.current && !portionUnitDropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }

            // Para los dropdowns de las recetas
            const dropdown = document.getElementById(`dropdown-${openDropdownId}`);
            const button = document.getElementById(`button-${openDropdownId}`);
            if (dropdown && !dropdown.contains(event.target) && button && !button.contains(event.target)) {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openDropdown, openDropdownId, selectedIngredients, isOpen]); // Agregar dependencias

    const {
        isCreating,
        isUpdating,
        isDeleting,
        deletingId,   
        fetchIngredients,
        updateRecipe,
        fetchRecipes,
        deleteRecipes,
        recipes,
        isGetting,
        ingredients,
        create,
    } = useRecipesStore();

    const options = ["L", "ml", "kg", "g", "pz", "oz", "cup"];

    const handleSubmit = async (e) => {
        e.preventDefault();

        const hasInvalidIngredients = selectedIngredients.some(ing =>
            isNaN(parseFloat(ing.units)) || !ing.UnitOfmeasure
        );

        if (hasInvalidIngredients) {
            toast.error("Por favor completa todos los campos de ingredientes");
            return;
        }

        // Construcción del objeto receta
        const recipeData = {
            name: formData.name,
            portionsPerrecipe: formData.portionsPerrecipe,
            quantityPermeasure: formData.quantityPermeasure,
            profitPercentage: formData.profitPercentage,
            recipeunitOfmeasure: formData.recipeunitOfmeasure,
            aditionalCostpercentages: formData.aditionalCostpercentages,
            ingredients: selectedIngredients.map(({ materialId, units, UnitOfmeasure }) => ({
            materialId,
            units: units.toString(),
            UnitOfmeasure
            })),
        };

        // Si hay imagen nueva en Base64
        if (formData.image && formData.image.startsWith("data:image")) {
            recipeData.image = formData.image;
        }
        // Si estamos editando y mantenemos la URL existente
        else if (editingRecipe && formData.image) {
            recipeData.imageUrl = formData.image;
        }
        // Si el usuario quitó la imagen
        else {
            recipeData.image = null; // fuerza el borrado
            recipeData.imageUrl = null;
        }

        try {
            if (isEditMode && editingRecipe) {
            await updateRecipe(editingRecipe._id, recipeData);
            } else {
            await create({
                ...recipeData,
                totalCost: "0",
                netProfit: "0",
                costPerunity: "0",
                favorite: false,
                userId: "user-id-placeholder",
                additionalCost: "0",
                materialCostTotal: "0",
                grossProfit: "0",
                unitSalePrice: "0",
            });
            }

            // Resetear y cerrar modal después del éxito
            const currentModalState = useRecipesStore.getState().openModal;//gets the openModal State updated(from IngredientsStore)
            
            if (!currentModalState) {
                setFormData({
                name: "",
                ingredients: [],
                portionsPerrecipe: "",
                quantityPermeasure: "",
                aditionalCostpercentages: "",
                profitPercentage: "",
                UnitOfmeasure: "",
                recipeunitOfmeasure: "",
                image: ""
                });
                
                setSelectedIngredients([]);
                setSelected("");
                setIsOpen(false);
                setOpen(false);  // Cierra el modal
                setIsEditMode(false);
                setEditingRecipe(null);
                fetchRecipes(); //se atraen las recetas despues de crear receta
            }
        } catch (error) {
            console.error("Error al guardar receta:", error);
        }
    };
    useEffect(() => {
        fetchRecipes();
    }, []);

    const handleDropdownToggle = async () => {
        if (!openDropdown) {
            await fetchIngredients();
        }
        setOpenDropdown(!openDropdown);
    };

    // Función para agregar ingrediente y cerrar el dropdown
    const handleAddIngredient = (ingredient) => {
        if (!selectedIngredients.find(item => item.materialId === ingredient._id)) {
            setSelectedIngredients([
                ...selectedIngredients,
                {
                    materialId: ingredient._id,
                    name: ingredient.name,
                    units: "",
                    UnitOfmeasure: "",
                    dropdownOpen: false
                }
            ]);
        }
        setOpenDropdown(false); // Cerrar el dropdown después de seleccionar
    };

    const [selectedRecipe, setSelectedRecipes] = useState(null);

    // editar receta
    const handleEdit = (recipe) => {
        setEditingRecipe(recipe);

        setFormData({
            name: recipe.name,
            portionsPerrecipe: recipe.portionsPerrecipe,
            quantityPermeasure: recipe.quantityPermeasure,
            aditionalCostpercentages: recipe.aditionalCostpercentages,
            profitPercentage: recipe.profitPercentage,
            recipeunitOfmeasure: recipe.recipeunitOfmeasure,
            image: recipe.imageUrl || "",
        });

        setSelected(recipe.recipeunitOfmeasure);
        setIsEditMode(true);
        setOpen(true);
        setOpenDropdownId(null);

        // Si no hay ingredientes en el store, los traemos
        if (ingredients.length === 0) {
            fetchIngredients();
        }
    };

    useEffect(() => {
        if (!editingRecipe || ingredients.length === 0) return;

        const enrichedIngredients = editingRecipe.ingredients.map((ingredient) => {
            const fullIngredient = ingredients.find(ing => ing._id === ingredient.materialId) || {};
            return {
                ...ingredient,
                name: fullIngredient.name || "Desconocido",
                dropdownOpen: false,
            };
        });

        setSelectedIngredients(enrichedIngredients);
    }, [ingredients, editingRecipe]);

    const handleDelete = async (id) => {
        await deleteRecipes(id);
    };
// helpers (fuera del return)
const isEmpty = v => v === undefined || v === null || String(v).trim() === "";
const isPosNumber = v => Number.isFinite(Number(v)) && Number(v) > 0;

const hasAllIngredients =
  selectedIngredients.length > 0 &&
  selectedIngredients.every(ing =>
    ing?.materialId &&
    isPosNumber(ing?.units) &&
    !isEmpty(ing?.UnitOfmeasure)
  );

// Validar que el formulario esté completo
const isFormComplete =
  !isEmpty(formData.name) &&
  hasAllIngredients &&
  isPosNumber(formData.portionsPerrecipe) &&
  isPosNumber(formData.quantityPermeasure) &&
  isPosNumber(formData.profitPercentage) &&
  isPosNumber(formData.aditionalCostpercentages) &&
  !isEmpty(formData.recipeunitOfmeasure) &&
  // estos porcentajes pueden ser 0, por eso validamos número >= 0
  Number.isFinite(Number(formData.profitPercentage)) && Number(formData.profitPercentage) >= 0 &&
  Number.isFinite(Number(formData.aditionalCostpercentages)) && Number(formData.aditionalCostpercentages) >= 0;

// Validar que en los campos numéricos ingresen números positivos aceptando decimales
// No uso el atributo min="0" porque no acepta decimales
const validatePositiveNumber = (e) => {
  const { name, value } = e.target;
  const numValue = parseFloat(value);
  
  // Si el campo está vacío, no hacer nada  de nada
  if (value.trim() === '') return;
  
  if (isNaN(numValue)) {
    // Usar toast en lugar de alert para no bloquear, porque el alert bloquea la navegación y se ve menos estético
    toast.error("Por favor ingrese un número válido");
    setFormData(prev => ({ ...prev, [name]: "" }));
    return;
  }

  if (numValue < 0) {
    // Usar toast sin bloquear la interfaz
    toast.error("El número debe ser positivo");
    // Resetear el valor sin forzar el foco
    setFormData(prev => ({ ...prev, [name]: "" }));
  }
};

// constantes para subir imagen
    const fileInputRef = useRef(null);
    const [fileName, setFileName] = useState("");

    return (
        <section className="bg-color-primary-light w-full min-h-screen">
            <div className="mx-4 sm:mx-10 lg:mx-16">
                <div className="w-full flex justify-center">
                    <img
                        src="/image-12.png"
                        alt="Imagen decorativa"
                        title="Imagen ilustrativa de recetas"
                        className="w-full max-w-full h-auto object-contain"
                    />
                </div>
            
            <div className="flex flex-row w-full mt-4">
                <div className="w-full mr-4 sm:mr-10">
                    <SearchBar setResult={setResult} ingredients={recipes}/>
                </div>
            <button
                title="Agregar una nueva receta"
                className="p-2 sm:p-4 shadow-md rounded-full bg-color-primary text-white"
                onClick={() => {
                    setFormData({
                        name: "",
                        ingredients: [],
                        portionsPerrecipe: "",
                        quantityPermeasure: "",
                        aditionalCostpercentages: "",
                        profitPercentage: "",
                        UnitOfmeasure: "",
                        recipeunitOfmeasure: "",
                        image: "",
                    });
                    setSelectedIngredients([]);
                    setSelected("");
                    setEditingRecipe(null);
                    setIsEditMode(false);
                    setOpen(true);
                }}
            >
                <Plus size={28} />
            </button>
            </div>

            {/* Modal para crear / editar */}
            <Modal open={open} onClose={() => setOpen(false)}>
            <form onSubmit={handleSubmit}>
                <h3 className="text-xl font-black text-color-secondary text-center mb-4">
                {isEditMode ? "Editar receta" : "Nueva receta"}
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
                                <div className="text-sm text-white truncate max-w-[110px]">
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
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setFormData({ ...formData, image: reader.result }); // reader.result ya incluye data:image/png;base64,...
                                    };
                                    reader.readAsDataURL(file);
                                }
                                }}
                            />
                                {/* Texto de ayuda */}
                            <p className="text-xs text-gray-500 text-center mt-2">
                                Formatos: JPG, PNG, GPEG, GIF, WEBP<br />
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

                        <div className="form-control">
                            <div className="flex justify-between items-center mt-6 my-2">
                                <label className="label">
                                <span className="label-text font-medium">Ingredientes</span>
                                </label>

                                <div className="relative">
                                <button
                                    type="button"
                                    className="p-2 shadow-md rounded-full bg-color-primary text-white"
                                    onClick={handleDropdownToggle}
                                >
                                    <Plus size={20} />
                                </button>

                                {openDropdown && (
                                    <div ref={plusDropdownRef}
                                        className="absolute top-[100%] right-0 z-50 mt-2 w-fit px-4 py-2
                                        origin-top-left rounded-[20px] border border-none bg-white shadow-md">
                                        <div className="max-h-40 overflow-y-auto"> {/* Contenedor con scroll */}
                                            {ingredients.length > 0 ? (
                                                ingredients.map((ingredient) => (
                                                <button
                                                    type="button"
                                                    key={ingredient._id}
                                                    className="block w-full px-4 py-2 cursor-pointer font-black text-color-secondary no-underline rounded-[10px] hover:bg-color-primary-light"
                                                    onClick={() => handleAddIngredient(ingredient)}
                                                >
                                                    {ingredient.name}
                                                </button>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-500 px-4 py-2">No hay ingredientes disponibles.</span>
                                            )}
                                            </div>
                                    </div>
                                )}
                                </div>
                            </div>
                        </div>

                        {/* muestreo de ingredientes */}
                        {selectedIngredients.map((ingredient, index) => (
                            <div key={ingredient.materialId} className="p-4 rounded-[20px] shadow-md bg-white">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-black text-color-secondary">{ingredient.name}</span>
                                <button
                                className="text-color-secondary"
                                type="button"
                                onClick={() =>
                                    setSelectedIngredients(
                                    selectedIngredients.filter(item => item.materialId !== ingredient.materialId)
                                    )
                                }
                                >
                                <CircleX size={20} className="cursor-pointer" />
                                </button>
                                </div>

                                <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    placeholder="Unidades"
                                    onBlur={validatePositiveNumber} // Validar campo numérico
                                    className="input w-full px-10 shadow-md border-none bg-color-primary-light font-black text-color-secondary"
                                    value={ingredient.units}
                                    onChange={(e) => {
                                    const updated = [...selectedIngredients];
                                    updated[index].units = e.target.value;
                                    setSelectedIngredients(updated);
                                    }}
                                />

                                <div id="unidad-medida" className="relative">
                                    <button
                                        type="button"
                                        onClick={() => {
                                        const updated = [...selectedIngredients];
                                        updated[index].dropdownOpen = !ingredient.dropdownOpen;
                                        setSelectedIngredients(updated);
                                        }}
                                        className="input w-24 px-4 flex justify-between items-center bg-color-primary-light shadow-md border-none"
                                    >
                                        <span>{ingredient.UnitOfmeasure}</span>
                                        <ChevronDown className="text-color-secondary" />
                                    </button>

                                    {ingredient.dropdownOpen && (
                                        <div
                                            ref={el => unitDropdownRefs.current[index] = el}
                                            className="absolute top-[100%] right-0 z-50 mt-2 w-full px-4 py-2
                                            origin-top-right rounded-[20px] border border-none bg-white shadow-md">
                                            <div className="max-h-40 overflow-y-auto"> {/* Contenedor con scroll */}
                                        {options.map((option) => (
                                            <button
                                            key={option}
                                            type="button"
                                            className="block w-full px-4 py-2 cursor-pointer font-black 
                                                text-color-secondary no-underline rounded-[10px] hover:bg-color-primary-light"
                                            onClick={() => {
                                                const updated = [...selectedIngredients];
                                                updated[index].UnitOfmeasure = option;
                                                updated[index].dropdownOpen = false;
                                                setSelectedIngredients(updated);
                                            }}
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
                        
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Porciones */}
                    <div className="form-control">
                        <label className="label block mb-2 mt-4">
                        <span className="label-text font-medium">Porciones</span>
                        </label>
                        <input
                            name="portionsPerrecipe" // Nombre del input
                            type="number"
                            onBlur={validatePositiveNumber} // Validar campo numérico
                            placeholder="Eje:10"
                            className="input w-full shadow-md px-10 border-none"
                            value={formData.portionsPerrecipe}
                            onChange={(e) => setFormData({ ...formData, portionsPerrecipe: e.target.value })}
                        />
                    </div>

                    {/* Cantidad por porción */}
                    <div className="form-control">
                        <label className="label block mb-2 mt-4">
                            <span className="label-text font-medium">Cantidad por porción</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input
                                name="quantityPermeasure" // Nombre del input
                                type="number"
                                onBlur={validatePositiveNumber} // Validar campo numérico
                                placeholder="Eje:100"
                                className="input w-full shadow-md px-10 border-none"
                                value={formData.quantityPermeasure}
                                onChange={(e) => setFormData({ ...formData, quantityPermeasure: e.target.value })}
                            />
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="input flex justify-between items-center w-full px-6 border-none shadow-md"
                                >
                                    <span>{formData.recipeunitOfmeasure}</span>
                                    <ChevronDown className="ml-2 text-color-secondary" />
                                </button>
                                {isOpen && (
                                    <div 
                                        ref={portionUnitDropdownRef}
                                        className="absolute top-[100%] right-0 z-50 mt-2 w-full px-4 py-2
                                                    origin-top-right rounded-[20px] border border-none bg-white shadow-md"
                                    >
                                        <div className="max-h-40 overflow-y-auto">
                                            {options.map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    className="block w-full px-4 py-2 cursor-pointer font-black 
                                                                text-color-secondary no-underline rounded-[10px] hover:bg-color-primary-light"
                                                    onClick={() => {
                                                        setFormData({ ...formData, recipeunitOfmeasure: option });
                                                        setIsOpen(false);
                                                    }}
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
                </div>
                                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Porcentaje de ganancia esperada */}
                    <div className="form-control">
                        <label className="label block mb-2 mt-4">
                        <span className="label-text font-medium">Porcentaje de ganancia esperada</span>
                        </label>
                        <input
                        type="number"
                        onBlur={validatePositiveNumber} // Validar campo numérico
                        placeholder="Ejemplo: 20"
                        className="input w-full shadow-md px-10 border-none"
                        value={formData.profitPercentage}
                        onChange={(e) => setFormData({ ...formData, profitPercentage: e.target.value })}
                        />
                    </div>

                    {/* Porcentaje de costo adicional */}
                    <div className="form-control">
                        <label className="label block mb-2 mt-4">
                        <span className="label-text font-medium">Porcentaje de costo adicional</span>
                        </label>
                        <input
                        type="number"
                        onBlur={validatePositiveNumber} // Validar campo numérico
                        placeholder="Agua, luz, mano de obra, etc."
                        className="input w-full shadow-md px-10 border-none"
                        value={formData.aditionalCostpercentages}
                        onChange={(e) => setFormData({ ...formData, aditionalCostpercentages: e.target.value })}
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
                                ingredients: [],
                                portionsPerrecipe: "",
                                quantityPermeasure: "",
                                aditionalCostpercentages: "",
                                profitPercentage: "",
                                UnitOfmeasure: "",
                                image: null,
                            });
                            setSelected(null);
                            setIsEditMode(false);
                        }}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary font-bold bg-color-primary rounded-[15px] shadow-md
                            hover:bg-color-primary hover:text-black disabled:bg-gray-300 disabled:text-gray-500" 
                        disabled={isCreating || isUpdating || !isFormComplete}
                        >
                        {isCreating || isUpdating ? (
                            <Loader2 className="size-5 animate-spin" />
                        ) : isEditMode ? "Actualizar" : "Guardar"}
                    </button>
                </div>
                </form>
                </Modal>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {isGetting ? (
                        <p className="col-span-full text-center"><Loader2 /></p>
                    ) : (
                        (result.length > 0 ? result : recipes).map((item) => (
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
                                            disabled={isDeleting} // Deshabilitar durante eliminación
                                        >
                                            {/* Mostrar loader si este ingrediente se está eliminando */}
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
                                    id="img-recipe" 
                                    src={item.imageUrl}
                                    alt="imagen de la receta" 
                                    title="Imagen de la receta"
                                    className="w-24 h-24 object-cover rounded-full border border-none"
                                />
                                <p className="text-xl font-black text-color-primary my-2">{item.name}</p>
                                <p className="text-lg font-black text-color-secondary my-2">
                                Precio de venta: <span className="font-normal">${item.unitSalePrice}</span>
                                </p>
                                <p id="netProfit_item" className="text-lg font-black text-color-secondary my-2">
                                Ganancia neta: <span className="font-normal">${item.netProfit}</span></p>
                                <p className="text-lg font-black text-color-secondary my-2">
                                En hacerla se gasta: <span className="font-normal">${item.totalCost}</span>
                                </p>
                                <button
                                    onClick={() => {
                                    setSelectedRecipes(item);
                                    setIsOpen2(true);
                                    }}
                                    className="px-4 py-2 rounded-[15px] bg-color-primary text-black font-black"
                                >
                                    Ver detalles
                                </button>
                            </div>
                        </div>
                        ))
                    )}
                </div>
            </div>

            <Modal open={isOpen2} onClose={() => setIsOpen2(false)}>
            {selectedRecipe && (
                <div id="datos-finales">
                <h2 className="text-xl font-black text-color-secondary mb-4">{selectedRecipe.name}</h2>

                <p><strong>Ganancia esperada............</strong> {selectedRecipe.profitPercentage}%</p>
                <p><strong>Costos adicionales.............</strong> {selectedRecipe.aditionalCostpercentages}%</p>
                <p><strong>Unidades obtenidas...........</strong> {selectedRecipe.portionsPerrecipe}</p>
                <h1>-----------------------------------------</h1>
                
                <p><strong>Costo de los materiales.....</strong> ${selectedRecipe.materialCostTotal}</p>
                <p><strong>Costos adicionales.............</strong> ${selectedRecipe.additionalCost}</p>
                <p><strong>Costo total de la receta.....</strong> ${selectedRecipe.totalCost}</p>
                <p><strong>Costo unitario....................</strong> ${selectedRecipe.costPerunity}</p>
                <p><strong>Valor de venta unitario.....</strong> ${selectedRecipe.unitSalePrice}</p>
                <p><strong>Ganancia bruta..................</strong> ${selectedRecipe.grossProfit}</p>
                <p><strong>Ganancia neta....................</strong> ${selectedRecipe.netProfit}</p>

                </div>
            )}
            </Modal>

        </section>
    );
};

export default HomePage;