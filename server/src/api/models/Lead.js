import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'lost'],
    default: 'new',
  },
  source: String,
  notes: String,
}, {
  timestamps: true,
});

export const Lead = mongoose.model('Lead', leadSchema);