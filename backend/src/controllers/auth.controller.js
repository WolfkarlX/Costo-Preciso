import cloudinary from "../lib/cloudinary.js";
import { generateEmailToken, generateToken, sendConfirmationEmail } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        if(!fullName || !email || !password) {
            return res.status(400).json({ message: "Todos los datos son obligatorios"});
        }
        // hash password
        if (password.length < 8) {
            return res.status(400).json({ message: "La contraseña debe contener al menos 8 caracteres"});
        }

        if (!isPasswordSecureHasNumber(password)) {
            return res.status(400).json({ message: "La contraseña debe incluir al menos un número"});
        }

        if (!isPasswordSecureHasLetter(password)) {
            return res.status(400).json({ message: "La contraseña debe incluir al menos una letra mayúscula y una minúscula"});
        }

        if (!isPasswordSecureHasSpecial(password)) {
            return res.status(400).json({ message: "La contraseña debe incluir al menos un caracter especial"});
        }

        if (!isPasswordSecureNoSpaces(password)) {
            return res.status(400).json({ message: "La contraseña NO debe tener espacios"});
        }

        if (!isPasswordSecureNoRepeatCharts(password)) {
            return res.status(400).json({ message: "La contraseña NO debe repetir caracteres (ej. 1111111)"});
        }

        const user = await User.findOne({email});

        if (user) return res.status(400).json({ message: "El correo ya existe" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        if(newUser) {
            // generate jwt token here
            //generateToken(newUser._id, res);
            //await newUser.save();

            const emailToken = generateEmailToken(newUser)
            sendConfirmationEmail(newUser.email, emailToken)

            /*res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });*/

            res.status(201).json(null);
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Reforzamiento de la contraseña

// Debe incluir al menos un número
const isPasswordSecureHasNumber = (password) => {
    const hasNumber = /\d/.test(password);

    return hasNumber;
}

// Debe incluir al menos una letra mayúscula y una minúscula
const isPasswordSecureHasLetter = (password) => {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    
    return hasUpper && hasLower;
}


// Debe incluir al menos un caracter especial
const isPasswordSecureHasSpecial = (password) => {
    const hasSpecial = /[-*?!@#$\/()\{\}=.,;:]/.test(password);
    
    return hasSpecial;
}

// No debe tener espacios
const isPasswordSecureNoSpaces = (password) => {
    const noSpaces = !/\s/.test(password);
    
    return noSpaces;
}

// No repetir caracteres (ej. 1111111)
const isPasswordSecureNoRepeatCharts = (password) => {
    const noRepeatChars = !/(.)\1{2,}/.test(password); // detecta 3 o más repeticiones consecutivas
    
    return noRepeatChars;
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({email});

        if (!user) {
            return res.status(400).json({message:"Datos incorrectos o correo no confirmado (revisar Spam)"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({message:"Datos incorrectos o correo no confirmado (revisar Spam)"});
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const googleLogin = async (req, res) => {
    const { tokenId } = req.body;

    try {
        // Verificar token con Google
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        if (!email) {
            return res.status(400).json({ message: "Google account email not found" });
        }

        // Buscar usuario en BD
        let user = await User.findOne({ email });

        if (!user) {
            // Crear usuario nuevo sin password (porque es Google)
            user = new User({
                email,
                fullName: name,
                password: "",  // o puedes generar un hash random
                profilePic: picture || "",
                googleUser: true,
            });
            await user.save();
        }

        generateToken(user._id, res);

        return res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });

    } catch (error) {
        console.log("Error in googleLogin controller", error);
        return res.status(500).json({ message: "Google login failed" });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge:0});
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic) {
            return res.status(400).json({ message: "Profile pic is required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic:uploadResponse.secure_url}, { new:true });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in update profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const checkEmail = async (req, res) => {
    try {

        if(!req.params){
            return res.redirect('http://localhost:5173/login');
        }

        const { token } = req.params;

        if (!token || typeof token !== "string") {
            return res.redirect('http://localhost:5173/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_EMAIL);

        const { userInfo } = decoded || {};
        const { fullName, email, password } = userInfo || {};

        if (!email) {
            return res.redirect('http://localhost:5173/login');
        }

        // Check if user already exists (someone could try to reuse token)
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // If user already exists and is authenticated, just redirect to login
            if (existingUser.isAuth) return res.redirect('http://localhost:5173/login');

            // else update isAuth to true
            existingUser.isAuth = true;
            await existingUser.save();
            return res.redirect('http://localhost:5173/login');
        }

        // Create new user now, setting isAuth:true
        const user = new User({
            fullName,
            email,
            password,      // hashed password from token
            isAuth: true,
        });

        if(user){
            await user.save();
            return res.redirect('http://localhost:5173/login');
        }

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.redirect('http://localhost:5173/login');
        }

        if (error.name === 'TokenExpiredError') {
            return res.redirect('http://localhost:5173/login');
        }

        console.log("Error in checkEmail Controller", error.message);
        return res.redirect('http://localhost:5173/login');
    }
};
