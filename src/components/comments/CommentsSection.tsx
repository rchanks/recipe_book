'use client'

import { useState } from 'react'
import type { Comment } from '@/types'
import type { Role } from '@prisma/client'
import { CommentForm } from './CommentForm'
import { CommentList } from './CommentList'

interface CommentsSectionProps {
  recipeId: string
  userId: string
  userRole: Role
}

export function CommentsSection({
  recipeId,
  userId,
  userRole,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])

  function handleCommentAdded(comment: Comment) {
    setComments((prev) => [...prev, comment])
  }

  return (
    <section className="mt-8 space-y-6 border-t border-gray-200 pt-8 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Comments
      </h2>

      <CommentForm recipeId={recipeId} onCommentAdded={handleCommentAdded} />

      <CommentList
        recipeId={recipeId}
        userId={userId}
        userRole={userRole}
        initialComments={comments}
      />
    </section>
  )
}
