import mongoose from 'mongoose'

const TenantSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  subscriptionPlan: {
    type: String,
    required: true,
    enum: ['free', 'pro'],
    default: 'free'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema)