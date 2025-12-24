import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { storage } from '@/lib/storage'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const photoUrl = `/uploads/recipes/${filename}`
    await storage.delete(photoUrl)

    return NextResponse.json({ message: 'Photo deleted' })
  } catch (error) {
    console.error('Photo delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}
