import React, { useRef, useState, useEffect } from "react";
import { Plus, X, ChevronDown, Ellipsis, Pencil, Trash, Loader2} from 'lucide-react';
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import "../styles/styles.css";
import { useRecipesStore } from "../store/useRecipesStore";
import { toast } from "react-hot-toast";

const HomePage = () => {
    const [result, setResult] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpen2, setIsOpen2] = useState(false);
    const [selected, setSelected] = useState("");
    const [selectedIngredients, setSelectedIngredients] = useState([]); // Para ingredientes
const [editingRecipe, setEditingRecipe] = useState(null); // Para receta en edición
    const [open, setOpen] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRef = useRef(null);

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
        recipeunitOfmeasure: ""  // Nombre consistente con el modelo
    });

    const {
        isCreating,
        fetchIngredients,
        updateRecipe,
        fetchRecipes,
        deleteRecipes,
        recipes,
        isGetting,
        ingredients,
        create,
    } = useRecipesStore();

    const options = ["l", "ml", "kg", "g", "pz", "oz", "cup"];

    const handleSubmit = async (e) => {
  e.preventDefault();

  const hasInvalidIngredients = selectedIngredients.some(ing =>
    isNaN(parseFloat(ing.units)) || !ing.UnitOfmeasure
  );

  if (hasInvalidIngredients) {
    toast.error("Por favor completa todos los campos de ingredientes");
    return;
  }

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
    setFormData({
      name: "",
      ingredients: [],
      portionsPerrecipe: "",
      quantityPermeasure: "",
      aditionalCostpercentages: "",
      profitPercentage: "",
      UnitOfmeasure: "",
      recipeunitOfmeasure: ""
    });
    setSelectedIngredients([]);
    setSelected("");
    setIsOpen(false);
    setOpen(false);  // Cierra el modal
    setIsEditMode(false);
    setEditingRecipe(null);
    fetchRecipes(); //se atraen las recetas despues de crear receta
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

    const [selectedRecipe, setSelectedRecipes] = useState(null);

    const handleEdit = (recipe) => { //se modifico funcio para tomar valor de save
    fetchIngredients().then((loadedIngredients) => {
        const enrichedIngredients = recipe.ingredients.map((ingredient) => {
        const fullIngredient = loadedIngredients.find(ing => ing._id === ingredient.materialId);
        return {
            ...ingredient,
            name: fullIngredient ? fullIngredient.name : "Desconocido",
            dropdownOpen: false,
        };
        });

        setEditingRecipe(recipe);
        setFormData({
        name: recipe.name,
        portionsPerrecipe: recipe.portionsPerrecipe,
        quantityPermeasure: recipe.quantityPermeasure,
        aditionalCostpercentages: recipe.aditionalCostpercentages,
        profitPercentage: recipe.profitPercentage,
        recipeunitOfmeasure: recipe.recipeunitOfmeasure,
        });
        setSelectedIngredients(enrichedIngredients);
        setSelected(recipe.recipeunitOfmeasure);
        setIsEditMode(true);
        setOpen(true);  // Aquí se abre el modal
        setOpenDropdownId(null);
    });
    };

    const handleDelete = async (id) => {
        await deleteRecipes(id);
    };

  return (
    <section className="bg-color-primary-light w-full min-h-screen">
      <div className="mx-4 sm:mx-10 lg:mx-16">
        <div className="w-full flex justify-center">
          <img
            src="/image-12.png"
            alt="Imagen decorativa"
            className="w-full max-w-full h-auto object-contain"
          />
        </div>

        <div className="flex flex-row w-full mt-4">
          <div className="w-full mr-4 sm:mr-10">
            <SearchBar setResult={setResult} />
          </div>
          <button
            className="p-2 sm:p-4 shadow-md rounded-full bg-color-primary text-white"
            onClick={() => setOpen(true)}
          >
            <Plus size={28} />
          </button>
        </div>

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

                    <div className="form-control mb-4">
                        <div className="flex justify-between items-center">
                            <label className="label">
                            <span className="label-text font-medium mt-4 my-2">Ingredientes</span>
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
                                <div className="absolute right-0 mt-2 rounded-[20px] shadow-md bg-white z-50">
                                {ingredients.length > 0 ? (
                                    ingredients.map((ingredient) => (
                                    <button
                                        type="button"
                                        key={ingredient._id}
                                        className="flex items-center px-4 py-2 m-2 hover:bg-color-primary-light text-color-secondary font-black rounded-[10px] gap-x-2"
                                        onClick={() => {
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
                                        }}
                                    >
                                        {ingredient.name}
                                    </button>
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-500 px-4 py-2">No hay ingredientes disponibles.</span>
                                )}
                                </div>
                            )}
                            </div>
                        </div>
                    </div>

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
                            <X size={16} />
                            </button>
                            </div>

                            <div className="flex items-center gap-4">
                            <input
                                type="number"
                                placeholder="Unidades"
                                className="input w-full px-10 shadow-md border-none bg-color-primary-light font-black text-color-secondary"
                                value={ingredient.units}
                                onChange={(e) => {
                                const updated = [...selectedIngredients];
                                updated[index].units = e.target.value;
                                setSelectedIngredients(updated);
                                }}
                            />

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                    const updated = [...selectedIngredients];
                                    updated[index].dropdownOpen = !ingredient.dropdownOpen;
                                    setSelectedIngredients(updated);
                                    }}
                                    className="input w-full flex justify-between items-center bg-color-primary-light shadow-md border-none"
                                >
                                    <span>{ingredient.UnitOfmeasure}</span>
                                    <ChevronDown className="ml-2 text-color-secondary" />
                                </button>

                                {ingredient.dropdownOpen && (
                                    <div className="absolute flex flex-col mt-2 p-2 bg-white rounded-[20px] shadow-md z-50 text-color-primary">
                                    {options.map((option) => (
                                        <button
                                        key={option}
                                        type="button"
                                        className="px-8 py-2 hover:bg-color-primary-light rounded-[10px]"
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
                                )}
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className="label-text font-medium my-2">De esta receta se obtienen</span>
              <input
                type="number"
                className="input w-24 px-5 shadow-md border-none"
                value={formData.portionsPerrecipe}
                onChange={(e) => setFormData({ ...formData, portionsPerrecipe: e.target.value })}
              />
              <span className="label-text font-medium my-2">unidades de</span>
              <input
                type="number"
                className="input w-24 px-5 shadow-md border-none"
                value={formData.quantityPermeasure}
                onChange={(e) => setFormData({ ...formData, quantityPermeasure: e.target.value })}
              />
              <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="input flex justify-between items-center w-24 border-none shadow-md"
                >
                    <span>{formData.recipeunitOfmeasure}</span>
                    <ChevronDown className="ml-2 text-color-secondary" />
                </button>
                {isOpen && (
                    <div className="absolute flex flex-col mt-2 p-2 bg-white rounded-[20px] shadow-md z-50 text-color-primary">
                    {options.map((option) => (
                        <button
                        key={option}
                        type="button"
                        className="px-8 py-2 hover:bg-color-primary-light rounded-[10px]"
                        onClick={() => {
                            setFormData({ ...formData, recipeunitOfmeasure: option });
                            setIsOpen(false);
                        }}
                        >
                        {option}
                        </button>
                    ))}
                    </div>
                )}
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
                            UnitOfmeasure: ""
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
        <div className="relative">{result.length > 0 && <SearchResult result={result} />}</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {isGetting ? (
                    <p className="col-span-full text-center"><Loader2 /></p>
                ) : (
                    recipes.map((item) => (
                    <div key={item._id} className="bg-white rounded-[20px] shadow-md p-6 gap-2">
                        <div ref={dropdownRef} className="relative inline-block flex justify-end">
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

                        <img src={item.image} alt="imagen de la receta" />
                        <p className="text-xl font-black text-color-primary my-2">{item.name}</p>
                        <p className="text-lg text-color-secondary my-2">
                        Precio de venta: <span className="font-black">{item.unitSalePrice}</span>
                        </p>
                        <p className="text-lg text-color-secondary my-2">
                        Costo total: <span className="font-black">{item.totalCost}</span>
                        </p>
                        <button
                            onClick={() => {
                            setSelectedRecipes(item);
                            setIsOpen2(true);
                            }}
                            className="px-4 py-2 rounded-[15px] bg-color-primary text-white font-black"
                        >
                            Ver detalles
                        </button>
                    </div>
                    ))
                )}
            </div>
        </div>

        <Modal open={isOpen2} onClose={() => setIsOpen2(false)}>
        {selectedRecipe && (
            <div>
            <h2 className="text-xl font-black text-color-secondary mb-4">{selectedRecipe.name}</h2>
            <p><strong>Porcentaje de ganancia:</strong> {selectedRecipe.profitPercentage}</p>
            <p><strong>Costos adicionales:</strong> {selectedRecipe.aditionalCostpercentages}</p>
            <p><strong>Unidades obtenidas:</strong> {selectedRecipe.portionsPerrecipe}</p>

            <p><strong>Costo de los materiales:</strong> {selectedRecipe.materialCostTotal}</p>
            <p><strong>Costos adicionales:</strong> {selectedRecipe.additionalCost}</p>
            <p><strong>Costo total de la receta:</strong> {selectedRecipe.totalCost}</p>
            <p><strong>Costo unitario:</strong> {selectedRecipe.costPerunity}</p>
            <p><strong>Ganancia bruta:</strong> {selectedRecipe.grossProfit}</p>
            <p><strong>Valor de venta unitario:</strong> {selectedRecipe.unitSalePrice}</p>
            <p><strong>Ganancia neta:</strong> {selectedRecipe.netProfit}</p>
            </div>
        )}
        </Modal>

    </section>
  );
};

export default HomePage;
