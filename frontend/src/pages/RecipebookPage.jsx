import React, { useRef, useState, useEffect } from "react";
import { Plus, X, ChevronDown, Ellipsis, Pencil, Trash, Loader2} from 'lucide-react';
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import "../styles/styles.css";
import { useRecipesStore } from "../store/useRecipesStore";
import { toast } from "react-hot-toast";

const RecipebookPage = () => {
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
    const [inputValue, setInputValue] = useState('');

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

    const handleEdit = (recipe) => { //se modifico funcion para tomar valor de save

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

// Validar que en los campos numéricos ingresen números positivos aceptando decimales
// No uso el atributo min="0" porque no acepta decimales
const validatePositiveNumber = (e) => {
  const { name, value } = e.target;
  const numValue = parseFloat(value);
  
  // Si el campo está vacío, no hacer nada  de nada
  if (value.trim() === '') return;
  
  if (isNaN(numValue)) {
    // Usar toast en lugar de alert para no bloquear, porque el alert bloqueaba la navegación y se ve menos estético
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

    return (
        <section className="bg-color-primary-light w-full min-h-screen">
            <div className="mx-4 sm:mx-10 lg:mx-16">
                <div className="w-full flex justify-center">
                    <img
                        src="/recipeBook_banner.png"
                        alt="Imagen decorativa"
                        title="Imagen ilustrativa de recetario"
                        className="w-full max-w-full h-auto object-contain"
                    />
                </div>

            <div className="flex flex-row w-full mt-4">
            <div className="w-full mr-4 sm:mr-10">
                <SearchBar setResult={setResult} ingredients={recipes}/>
            </div>
            <button
                title="Agregar una nueva categoría"
                className="p-2 sm:p-4 shadow-md rounded-full bg-color-primary text-white"
                onClick={() => setOpen(true)}
            >
                <Plus size={28} />
            </button>
            </div>
            </div>

           
        </section>
    );
};
export default RecipebookPage;
