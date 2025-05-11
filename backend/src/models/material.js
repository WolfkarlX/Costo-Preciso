import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  totalContent: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    enum: ['kg', 'litros', 'mililitros', 'gramos', 'unidades'],
    required: true,
  },
});

const Material = mongoose.model('Material', materialSchema);

export default Material;
