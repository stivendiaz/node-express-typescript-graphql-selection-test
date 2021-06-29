import mongoose from 'mongoose';

/**
 * provides the User interface for typescript
 */
export interface User extends mongoose.Document {
  username: string;
  name: string;
  age: number;
}

/**
 * schema that represents the User database model
 */
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
});

export const UserModel = mongoose.model<User>('users', UserSchema);
