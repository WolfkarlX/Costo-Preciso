import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import ingredientRoutes from "./routes/ingredient.route.js";
import recipeRoutes from "./routes/recipe.route.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

//In here are all the routes from the app
app.use("/api/auth", authRoutes);
app.use("/api/ingredient", ingredientRoutes);
app.use("/api/recipe", recipeRoutes);

app.listen(PORT, () => {
    console.log("Server is running on PORT:" + PORT);
    connectDB();
});