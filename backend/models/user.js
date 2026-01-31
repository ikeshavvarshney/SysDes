import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER'
  },
  designs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Design'
  }]
}, { timestamps: true });

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Assuming you're using bcrypt
  const bcrypt = await import('bcrypt');
  return bcrypt.compare(candidatePassword, this.passwordHash);
};




export default mongoose.model('User', userSchema);
