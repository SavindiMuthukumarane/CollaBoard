import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 160 },
  passwordHash: { type: String, required: true, select: false }
}, { timestamps: true });

userSchema.set('toJSON', {
  transform(_document, value) {
    value.id = value._id.toString();
    delete value._id;
    delete value.__v;
    delete value.passwordHash;
    return value;
  }
});

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);