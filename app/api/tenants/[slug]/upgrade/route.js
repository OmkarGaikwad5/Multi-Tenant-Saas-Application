import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Tenant from '@/lib/models/Tenant'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

export async function POST(request, { params }) {
  try {
    await connectDB()

    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (decoded.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can upgrade subscriptions' },
        { status: 403 }
      )
    }

    // Check if user belongs to the tenant being upgraded
    if (decoded.user.tenantId !== params.slug) {
      return NextResponse.json(
        { error: 'Cannot upgrade other tenants' },
        { status: 403 }
      )
    }

    const tenant = await Tenant.findOneAndUpdate(
      { slug: params.slug },
      { subscriptionPlan: 'pro' },
      { new: true }
    )

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Subscription upgraded to Pro successfully',
      tenant: {
        slug: tenant.slug,
        name: tenant.name,
        subscriptionPlan: tenant.subscriptionPlan
      }
    })
  } catch (error) {
    console.error('Error upgrading subscription:', error)
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