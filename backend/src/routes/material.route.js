import express from 'express';
import { createMaterial, getMaterials, updateMaterial, deleteMaterial } from '../controllers/material.controller.js';

const router = express.Router();

// Crear material
router.post("/", createMaterial);

// Obtener todos los materiales
router.get("/", getMaterials);

// Actualizar material
router.put("/:id", updateMaterial);

// Eliminar material
router.delete("/:id", deleteMaterial);

export default router;
