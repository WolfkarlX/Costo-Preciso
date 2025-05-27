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
      },
      validate: {
        validator: function(v) {
          if (this.googleUser) return true;
          return v && v.length >= 6;
        },
        message: 'Password must be at least 6 characters',
      },
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
