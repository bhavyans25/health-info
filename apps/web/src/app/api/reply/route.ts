import { NextResponse } from 'next/server';
import { prisma } from '@instaclone/db';
import { inMemoryDiseases } from '../disease/store';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { commentId, userId, authorName, text } = body;

    if (!commentId || !userId || !authorName || !text || !text.trim()) {
      return NextResponse.json({ error: 'Missing required reply fields' }, { status: 400 });
    }

    let reply;
    try {
      reply = await prisma.healthReply.create({
        data: {
          commentId,
          userId,
          authorName,
          text: text.trim(),
        },
      });
    } catch (dbErr) {
      reply = {
        id: 'reply_' + crypto.randomBytes(8).toString('hex'),
        commentId,
        userId,
        authorName,
        text: text.trim(),
        createdAt: new Date().toISOString(),
      };

      for (const d of inMemoryDiseases) {
        const targetComment = d.comments.find((c) => c.id === commentId);
        if (targetComment) {
          targetComment.replies.push(reply);
          break;
        }
      }
    }

    return NextResponse.json({ success: true, reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to post reply' }, { status: 500 });
  }
}
