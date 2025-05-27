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
      required: function() {
        return !this.googleUser;
        //required: true,
        //minlength: 8,
    },
        
    validate: {
      validator: function(v) {
        if (this.googleUser) return true;
        return v && v.length >= 8;
      },
        message: 'Password must be at least 8 characters',
      },
    },
          
    isAuth: {
      type: Boolean,
      required: true,
      default: false
    },
      
    profilePic: {
      type: String,
      default: "",
    },

    profilePic: {
      type: String,
      default: "",
    },
      
    googleUser: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
