import cloudinary from "../lib/cloudinary.js";
import { generateEmailToken, generateToken, sendConfirmationEmail } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        if(!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required"});
        }
        // hash password
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters"});
        }

        const user = await User.findOne({email});

        if (user) return res.status(400).json({ message: "Email already exists" });

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

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({email});

        if (!user) {
            return res.status(400).json({message:"Los datos ingresados son incorrectos o el correo no ha sido confirmado (El correo puede estar en Spam)"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({message:"Los datos ingresados son incorrectos o el correo no ha sido confirmado (En correo puede estar en Spam)"});
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
}

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