import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
}, {
  timestamps: true,
});

export const Category = mongoose.model('Category', categorySchema);