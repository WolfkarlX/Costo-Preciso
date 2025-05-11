import React, { useEffect, useState } from "react";
import { useRecipeStore } from "../store/useRecipeStore";
import { toast } from "react-hot-toast";

const AddRecipe = ({ onSuccess }) => {
  const [form, setForm] = useState({
    title: "",
  });

  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [materialQuantity, setMaterialQuantity] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [materialToEdit, setMaterialToEdit] = useState(null);

  const { fetchMaterials, materials, createRecipe } = useRecipeStore();

  useEffect(() => {
    fetchMaterials(); // Obtener los materiales desde la base de datos
  }, [fetchMaterials]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMaterialSelect = (materialId) => {
    const material = materials.find((m) => m._id === materialId);
    if (material) {
      setMaterialToEdit(material);
      setMaterialQuantity(0); // Reiniciar la cantidad a 0
      setSelectedUnit(""); // Reiniciar la unidad
      setIsMaterialModalOpen(true);
    }
  };

  const handleRemoveMaterial = (materialId) => {
    setSelectedMaterials(selectedMaterials.filter((m) => m._id !== materialId));
  };

  const handleQuantityChange = (e) => {
    setMaterialQuantity(e.target.value);
  };

  const handleUnitChange = (e) => {
    setSelectedUnit(e.target.value);
  };

  const handleQuantitySubmit = () => {
    let convertedQuantity = materialQuantity;
    if (selectedUnit === "gramos") {
      convertedQuantity = materialQuantity / 1000;
    } else if (selectedUnit === "mililitros") {
      convertedQuantity = materialQuantity / 1000;
    }

    const updatedMaterial = {
      ...materialToEdit,
      quantity: convertedQuantity,
      unit: selectedUnit,
    };

    const existingMaterialIndex = selectedMaterials.findIndex((m) => m._id === materialToEdit._id);
    if (existingMaterialIndex !== -1) {
      const updatedMaterials = [...selectedMaterials];
      updatedMaterials[existingMaterialIndex] = updatedMaterial;
      setSelectedMaterials(updatedMaterials);
    } else {
      setSelectedMaterials([...selectedMaterials, updatedMaterial]);
    }
    setIsMaterialModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Calculamos el costo total de la receta con los materiales seleccionados
    const totalCost = selectedMaterials.reduce((acc, material) => {
      const costPerUnit = material.price / material.totalContent;
      const materialCost = costPerUnit * material.quantity;
      return acc + materialCost;
    }, 0);

    if (totalCost <= 0) {
      toast.error("El costo total de la receta no puede ser cero");
      return;
    }

    const data = {
      title: form.title,
      materials: selectedMaterials.map((material) => ({
        materialId: material._id,
        quantity: material.quantity,
        unit: material.unit,
      })),
      cost: totalCost,
    };

    // Crear la receta con los materiales y el costo calculado
    createRecipe(data, () => {
      setForm({ title: "" });
      setSelectedMaterials([]);
      if (onSuccess) onSuccess();
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-center">Agregar Receta</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          placeholder="Título de la receta"
          value={form.title}
          onChange={handleChange}
          className="input input-bordered w-full"
        />

        <button
          type="button"
          onClick={() => setIsMaterialModalOpen(true)}
          className="btn btn-secondary w-full"
        >
          Seleccionar Materiales
        </button>

        <div className="mt-2">
          <strong>Materiales Seleccionados:</strong>
          {selectedMaterials.map((material) => (
            <div key={material._id} className="inline-block bg-base-200 px-2 py-1 rounded mr-2 mt-1">
              {material.name} - {material.quantity} {material.unit}
              <button
                type="button"
                onClick={() => handleRemoveMaterial(material._id)}
                className="ml-1 text-red-500"
                title="Eliminar material"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-primary w-full">
          Crear Receta
        </button>
      </form>

      {/* Modal de selección de materiales */}
      {isMaterialModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="text-xl font-bold mb-4">Selecciona Materiales</h2>
            <div className="space-y-4">
              {materials.map((material) => (
                <div key={material._id} className="flex justify-between items-center">
                  <div>
                    <p><strong>{material.name}</strong></p>
                    <p>Precio: {material.price} por {material.unit}</p>
                  </div>
                  <button
                    onClick={() => handleMaterialSelect(material._id)}
                    className="btn btn-sm btn-primary"
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            <div className="modal-action">
              <button
                onClick={() => setIsMaterialModalOpen(false)}
                className="btn"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddRecipe;
//Hola