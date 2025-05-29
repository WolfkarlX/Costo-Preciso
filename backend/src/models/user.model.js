import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: function () {
        // Solo requerido para usuarios locales
        return this.authType === "local";
      },
      validate: {
        validator: function (v) {
          // Validar longitud solo para usuarios locales
          if (this.authType === "local") {
            return v && v.length >= 6;
          }
          // Para usuarios google, no validar
          return true;
        },
        message: "La contraseña debe tener al menos 6 caracteres.",
      },
    },
    authType: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    isAuth: {
      type: Boolean,
      required: true,
      default: false,
    },
    profilePic: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
