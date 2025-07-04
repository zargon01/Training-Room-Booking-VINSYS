import mongoose from 'mongoose';
import bcrypt from 'bcrypt';



const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true },

  email: { 
    type: String, 
    required: true, 
    unique: true },

  passwordHash: { 
    type: String, 
    required: true },

  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user',
    required: false },

  createdAt: { 
    type: Date, 
    default: Date.now }

}, { timestamps: true });

userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.model('User', userSchema);

export default User;
