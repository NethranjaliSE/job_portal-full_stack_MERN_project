import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Verified: This accepts your Clerk ID
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    resume: { type: String }, // Optional: If not provided, it won't crash
    image: { type: String, required: true },
  },
  { minimize: false } // Optional: prevents empty objects from being removed
)

const User = mongoose.model("User", userSchema)

export default User
