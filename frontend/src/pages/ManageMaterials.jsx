import React, { useState, useEffect } from "react";
import { useRecipeStore } from "../store/useRecipeStore";
import { toast } from "react-hot-toast";

const ManageMaterials = ({ onClose }) => {
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    price: "",
    unit: "kg",
    totalContent: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState(null);

  const { materials, createMaterial, updateMaterial, deleteMaterial, fetchMaterials } = useRecipeStore();

  useEffect(() => {
    fetchMaterials(); // Cargar los materiales al abrir el modal
  }, [fetchMaterials]);

  const handleNewMaterialChange = (e) => {
    setNewMaterial({ ...newMaterial, [e.target.name]: e.target.value });
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.name || !newMaterial.price || !newMaterial.totalContent) {
      toast.error("Por favor completa todos los campos.");
      return;
    }

    const materialData = {
      name: newMaterial.name,
      price: parseFloat(newMaterial.price),
      unit: newMaterial.unit,
      totalContent: parseFloat(newMaterial.totalContent),
    };

    await createMaterial(materialData, () => {
      toast.success("Nuevo material agregado");
      fetchMaterials(); // Actualizar la lista de materiales
      setNewMaterial({ name: "", price: "", unit: "kg", totalContent: "" }); // Resetear el formulario
    });
  };

  const handleEditMaterial = (materialId) => {
    const materialToEdit = materials.find((m) => m._id === materialId);
    if (materialToEdit) {
      setNewMaterial({
        name: materialToEdit.name,
        price: materialToEdit.price,
        unit: materialToEdit.unit,
        totalContent: materialToEdit.totalContent,
      });
      setMaterialToEdit(materialToEdit);
      setIsEditing(true); // Activar el modo de edición
    }
  };

  const handleUpdateMaterial = async () => {
    if (!newMaterial.name || !newMaterial.price || !newMaterial.totalContent) {
      toast.error("Por favor completa todos los campos.");
      return;
    }

    const updatedMaterialData = {
      name: newMaterial.name,
      price: parseFloat(newMaterial.price),
      unit: newMaterial.unit,
      totalContent: parseFloat(newMaterial.totalContent),
    };

    await updateMaterial(materialToEdit._id, updatedMaterialData, () => {
      toast.success("Material actualizado");
      fetchMaterials(); // Recargar los materiales después de actualizar
      setNewMaterial({ name: "", price: "", unit: "kg", totalContent: "" });
      setIsEditing(false); // Salir del modo edición
      setMaterialToEdit(null); // Limpiar la selección de material a editar
    });
  };

  const handleDeleteMaterial = async (materialId) => {
    await deleteMaterial(materialId, () => {
      toast.success("Material eliminado");
      fetchMaterials(); // Recargar la lista de materiales después de eliminar
    });
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h2 className="text-xl font-bold mb-4">{isEditing ? "Editar Material" : "Añadir Nuevo Material"}</h2>

        {/* Formulario para añadir o editar material */}
        <div className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Nombre del material"
            value={newMaterial.name}
            onChange={handleNewMaterialChange}
            className="input input-bordered w-full"
          />
          <input
            type="number"
            name="price"
            placeholder="Precio por unidad"
            value={newMaterial.price}
            onChange={handleNewMaterialChange}
            className="input input-bordered w-full"
          />
          <input
            type="number"
            name="totalContent"
            placeholder="Contenido total (por unidad)"
            value={newMaterial.totalContent}
            onChange={handleNewMaterialChange}
            className="input input-bordered w-full"
          />
          <select
            name="unit"
            value={newMaterial.unit}
            onChange={handleNewMaterialChange}
            className="select select-bordered w-full"
          >
            <option value="kg">Kg</option>
            <option value="gramos">Gramos</option>
            <option value="L">Litros</option>
            <option value="ml">Mililitros</option>
            <option value="unidades">Unidades</option>
          </select>
        </div>

        {/* Botones para añadir o editar material */}
        <div className="flex gap-4 mt-4">
          {isEditing ? (
            <button
              onClick={handleUpdateMaterial}
              className="btn btn-primary w-full"
            >
              Actualizar Material
            </button>
          ) : (
            <button
              onClick={handleAddMaterial}
              className="btn btn-primary w-full"
            >
              Añadir Material
            </button>
          )}
        </div>

        {/* Botón para cerrar el modal */}
        <div className="modal-action">
          <button
            onClick={() => onClose()}
            className="btn"
          >
            Cerrar
          </button>
        </div>

        {/* Lista de materiales */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Lista de Materiales</h3>
          {materials.map((material) => (
            <div key={material._id} className="flex justify-between items-center mb-2">
              <div>
                <p>{material.name} - ${material.price} por {material.unit}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditMaterial(material._id)}
                  className="btn btn-xs btn-outline btn-info"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteMaterial(material._id)}
                  className="btn btn-xs btn-outline btn-error"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageMaterials;
