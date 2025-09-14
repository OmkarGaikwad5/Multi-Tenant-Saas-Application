import mongoose from 'mongoose' // ✅ Added for ObjectId check
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Note from '@/lib/models/Note'
import Tenant from '@/lib/models/Tenant'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

export async function GET(request) {
  try {
    await connectDB()

    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)

    if (!decoded || !decoded.user || !decoded.user.tenantId || !decoded.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const tenantIdOrSlug = decoded.user.tenantId.toString()
    const userId = decoded.user.id.toString()

    // ✅ Lookup tenant safely
    let tenant
    if (mongoose.Types.ObjectId.isValid(tenantIdOrSlug)) {
      tenant = await Tenant.findById(tenantIdOrSlug)
    }
    if (!tenant) {
      tenant = await Tenant.findOne({ slug: tenantIdOrSlug })
    }
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const notes = await Note.find({ tenantId: tenant._id.toString(), userId })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)

    if (!decoded || !decoded.user || !decoded.user.tenantId || !decoded.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, content } = await request.json()
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const tenantIdOrSlug = decoded.user.tenantId.toString()
    const userId = decoded.user.id.toString()

    // ✅ Lookup tenant safely
    let tenant
    if (mongoose.Types.ObjectId.isValid(tenantIdOrSlug)) {
      tenant = await Tenant.findById(tenantIdOrSlug)
    }
    if (!tenant) {
      tenant = await Tenant.findOne({ slug: tenantIdOrSlug })
    }
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    if (tenant.subscriptionPlan === 'free') {
      const noteCount = await Note.countDocuments({ tenantId: tenant._id.toString() })
      if (noteCount >= 3) {
        return NextResponse.json(
          { error: 'Free plan limit reached. Upgrade to Pro for unlimited notes.' },
          { status: 403 }
        )
      }
    }

    const note = new Note({
      title,
      content,
      userId,
      tenantId: tenant._id.toString() // always store ObjectId as string
    })

    await note.save()

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('Error creating note:', error)
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
