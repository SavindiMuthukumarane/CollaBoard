import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, default: '', trim: true, maxlength: 300 },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

boardSchema.index({ memberIds: 1, updatedAt: -1 });
boardSchema.set('toJSON', {
  transform(_document, value) {
    value.id = value._id.toString();
    value.ownerId = value.ownerId?.toString();
    value.memberIds = (value.memberIds || []).map(String);
    delete value._id;
    delete value.__v;
    return value;
  }
});

export const BoardModel = mongoose.models.Board || mongoose.model('Board', boardSchema);