import 'dotenv/config'
import connectDB from './mongodb.js'
import User from './models/User.js'
import Tenant from './models/Tenant.js'
import { hashPassword } from './auth.js'

export async function seedDatabase() {
  await connectDB()

  // Check if data already exists
  const existingTenants = await Tenant.find()
  if (existingTenants.length > 0) {
    console.log('✅ Seed skipped: tenants already exist')
    return
  }

  // Create tenants
  const tenants = [
    { slug: 'acme', name: 'Acme Corporation', subscriptionPlan: 'free' },
    { slug: 'globex', name: 'Globex Corporation', subscriptionPlan: 'free' }
  ]

  const createdTenants = await Tenant.insertMany(tenants)
  console.log('Created tenants:', createdTenants)

  // Create test users
  const hashedPassword = await hashPassword('password')
  
  const users = [
    { email: 'admin@acme.test', passwordHash: hashedPassword, role: 'admin', tenantId: 'acme' },
    { email: 'user@acme.test', passwordHash: hashedPassword, role: 'member', tenantId: 'acme' },
    { email: 'admin@globex.test', passwordHash: hashedPassword, role: 'admin', tenantId: 'globex' },
    { email: 'user@globex.test', passwordHash: hashedPassword, role: 'member', tenantId: 'globex' }
  ]

  const createdUsers = await User.insertMany(users)
  console.log('Created users:', createdUsers)
}

// Runner block for direct execution
if (process.argv[1].includes('seedData.js')) {
  seedDatabase()
    .then(() => {
      console.log('✅ Database seeded successfully')
      process.exit(0)
    })
    .catch((err) => {
      console.error('❌ Seeding failed:', err)
      process.exit(1)
    })
}
