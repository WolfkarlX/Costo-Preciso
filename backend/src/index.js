import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import recipeRoutes from "./routes/recipe.route.js";
//import ingredientRoutes from "./routes/ingredient.route.js"; // ✅ ruta correcta ahora
import materialRoutes from "./routes/material.route.js"; // ✅ Nueva importación para los materiales

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin: "http://localhost:5173", // Asegúrate de que la URL del cliente sea la correcta
        credentials: true,
    })
);

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
//app.use("/api/ingredients", ingredientRoutes); // ✅ ya apunta a la ruta correcta
app.use("/api/materials", materialRoutes); // Cambia esto


app.listen(PORT, () => {
    console.log("Server is running on PORT:" + PORT);
    connectDB();
});
