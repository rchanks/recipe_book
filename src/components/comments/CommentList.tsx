'use client'

import { useState, useEffect } from 'react'
import type { Comment } from '@/types'
import type { Role } from '@prisma/client'
import { CommentItem } from './CommentItem'

interface CommentListProps {
  recipeId: string
  userId: string
  userRole: Role
  initialComments?: Comment[]
}

export function CommentList({
  recipeId,
  userId,
  userRole,
  initialComments = [],
}: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [loading, setLoading] = useState(!initialComments.length)
  const [error, setError] = useState<string | null>(null)

  async function fetchComments() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/recipes/${recipeId}/comments`)
      if (!res.ok) throw new Error('Failed to load comments')

      const data = await res.json()
      setComments(data.comments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialComments.length === 0) {
      fetchComments()
    }
  }, [recipeId])

  async function handleUpdate(id: string, text: string) {
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!res.ok) throw new Error('Failed to update comment')

      const updated = await res.json()
      setComments((prev) => prev.map((c) => (c.id === id ? updated : c)))
    } catch (err) {
      throw err
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete comment')

      setComments((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      throw err
    }
  }

  if (loading) {
    return <div className="text-gray-500 dark:text-gray-400">Loading comments...</div>
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900 dark:text-red-200">
        Error: {error}
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400">
        No comments yet. Be the first to comment!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          canEdit={comment.userId === userId || userRole === 'ADMIN'}
          canDelete={comment.userId === userId || userRole === 'ADMIN'}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
