import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  linkedinEmail: string;
  linkedinPassword: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  linkedinEmail: {
    type: String,
    required: true,
    trim: true
  },
  linkedinPassword: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Log before saving
userSchema.pre('save', async function(this: IUser, next) {
  console.log('Attempting to save user:', {
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    linkedinEmail: this.linkedinEmail,
    isNew: this.isNew,
    isModified: this.isModified()
  });

  if (this.isModified('password')) {
    console.log('Hashing password...');
    this.password = await bcrypt.hash(this.password, 10);
    console.log('Password hashed successfully');
  }

  next();
});

// Log after saving
userSchema.post('save', function(doc, next) {
  console.log('User saved successfully:', {
    id: doc._id,
    email: doc.email,
    firstName: doc.firstName,
    lastName: doc.lastName
  });
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(this: IUser, candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema); 