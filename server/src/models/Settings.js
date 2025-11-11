import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: 'BuildMart Hardware Store',
      trim: true,
    },
    siteDescription: {
      type: String,
      default: 'Quality hardware and tools for professionals',
    },
    contactEmail: {
      type: String,
      default: 'ugwanezav@gmail.com',
    },
    contactPhone: {
      type: String,
      default: '+250 788 123 456',
    },
    address: {
      type: String,
      default: 'Kigali, Rwanda',
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'RWF', 'EUR'],
    },
    currencySymbol: {
      type: String,
      default: '$',
    },
    taxRate: {
      type: Number,
      default: 18,
      min: 0,
      max: 100,
    },
    shippingFee: {
      type: Number,
      default: 5000,
      min: 0,
    },
    freeShippingThreshold: {
      type: Number,
      default: 50000,
      min: 0,
    },
    emailFrom: {
      type: String,
      default: 'noreply@hardwarestore.com',
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    // Singleton pattern - only one settings document
    isSingleton: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
settingsSchema.index({ isSingleton: 1 }, { unique: true });

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
