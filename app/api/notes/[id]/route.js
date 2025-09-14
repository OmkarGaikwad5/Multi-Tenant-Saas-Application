import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Note from '@/lib/models/Note'
import Tenant from '@/lib/models/Tenant'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

async function getTenant(decoded) {
  const tenantIdOrSlug = decoded.user.tenantId.toString()
  let tenant
  if (mongoose.Types.ObjectId.isValid(tenantIdOrSlug)) {
    tenant = await Tenant.findById(tenantIdOrSlug)
  }
  if (!tenant) {
    tenant = await Tenant.findOne({ slug: tenantIdOrSlug })
  }
  return tenant
}

// ----------------- GET NOTE -----------------
export async function GET(request, { params }) {
  try {
    await connectDB()

    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)

    if (!decoded || !decoded.user || !decoded.user.id || !decoded.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenant = await getTenant(decoded)
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

    const note = await Note.findOne({
      _id: params.id,
      tenantId: tenant._id.toString(),
      userId: decoded.user.id
    })

    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 })

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error fetching note:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ----------------- UPDATE NOTE -----------------
export async function PUT(request, { params }) {
  try {
    await connectDB()

    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)

    if (!decoded || !decoded.user || !decoded.user.id || !decoded.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content } = await request.json()
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const tenant = await getTenant(decoded)
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

    const note = await Note.findOneAndUpdate(
      { _id: params.id, tenantId: tenant._id.toString(), userId: decoded.user.id },
      { title, content, updatedAt: new Date() },
      { new: true }
    )

    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 })

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error updating note:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ----------------- DELETE NOTE -----------------
export async function DELETE(request, { params }) {
  try {
    await connectDB()

    const token = getTokenFromRequest(request)
    const decoded = verifyToken(token)

    if (!decoded || !decoded.user || !decoded.user.id || !decoded.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenant = await getTenant(decoded)
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

    const note = await Note.findOneAndDelete({
      _id: params.id,
      tenantId: tenant._id.toString(),
      userId: decoded.user.id
    })

    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 })

    return NextResponse.json({ message: 'Note deleted successfully' })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ----------------- OPTIONS -----------------
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
