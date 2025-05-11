import Material from "../models/material.js";

// Crear material
export const createMaterial = async (req, res) => {
  try {
    const { name, price, totalContent, unit } = req.body;
    const material = new Material({ name, price, totalContent, unit });
    await material.save();
    res.status(201).json(material);
  } catch (error) {
    console.error("Error al crear material:", error.message);
    res.status(400).json({ message: "Error al crear material" });
  }
};

// Obtener todos los materiales
export const getMaterials = async (req, res) => {
  try {
    const materials = await Material.find();
    res.status(200).json(materials);
  } catch (error) {
    console.error("Error al obtener materiales:", error.message);
    res.status(500).json({ message: "Error al obtener materiales" });
  }
};

// Actualizar material
export const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMaterial = await Material.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedMaterial) {
      return res.status(404).json({ message: "Material no encontrado" });
    }
    res.status(200).json(updatedMaterial);
  } catch (error) {
    console.error("Error al actualizar material:", error.message);
    res.status(500).json({ message: "Error al actualizar material" });
  }
};

// Eliminar material
export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findByIdAndDelete(id);
    if (!material) {
      return res.status(404).json({ message: "Material no encontrado" });
    }
    res.status(200).json({ message: "Material eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar material:", error.message);
    res.status(500).json({ message: "Error al eliminar material" });
  }
};
