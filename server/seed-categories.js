import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';

dotenv.config();

const categories = [
  { name: 'Power Tools', description: 'Drills, saws, sanders, and more' },
  { name: 'Hand Tools', description: 'Hammers, wrenches, screwdrivers' },
  { name: 'Measuring Tools', description: 'Levels, tape measures, gauges' },
  { name: 'Safety Equipment', description: 'Helmets, gloves, goggles' },
  { name: 'Plumbing', description: 'Pipes, faucets, valves' },
  { name: 'Electrical', description: 'Wires, switches, outlets' },
  { name: 'Paint & Finishes', description: 'Paints, stains, varnishes' },
  { name: 'Building Materials', description: 'Cement, bricks, timber' },
  { name: 'Fasteners', description: 'Nails, screws, bolts' },
  { name: 'Garden Tools', description: 'Hoes, shovels, rakes' },
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const cat of categories) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
        console.log(`Created: ${cat.name}`);
      } else {
        console.log(`Exists: ${cat.name}`);
      }
    }

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

seedCategories();