import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Tenant from '@/lib/models/Tenant'
import { verifyPassword, generateToken } from '@/lib/auth'
import { seedDatabase } from '@/lib/seedData'

export async function POST(request) {
  try {
    await connectDB()
    await seedDatabase() // Ensure test data exists

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // ✅ FIX: match tenant slug properly (your seed data uses lowercase slugs)
    const tenant = await Tenant.findOne({ slug: user.tenantId.toLowerCase() })
    
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    const userPayload = {
      id: user._id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tenantSlug: tenant.slug,
      tenantName: tenant.name,
      subscriptionPlan: tenant.subscriptionPlan
    }

    const token = generateToken({ user: userPayload })

    return NextResponse.json({
      user: userPayload,
      token
    })
  } catch (error) {
    // ✅ Better error logging for debugging
    console.error('Login error details:', error.message, error.stack)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
