import { NextResponse } from 'next/server';
import { prisma } from '@instaclone/db';
import { inMemoryDiseases } from '../disease/store';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { diseaseId, userId, authorName, text } = body;

    if (!diseaseId || !userId || !authorName || !text || !text.trim()) {
      return NextResponse.json({ error: 'Missing required comment fields' }, { status: 400 });
    }

    let comment;
    try {
      comment = await prisma.healthComment.create({
        data: {
          diseaseId,
          userId,
          authorName,
          text: text.trim(),
        },
        include: {
          replies: true,
        },
      });
    } catch (dbErr) {
      comment = {
        id: 'comment_' + crypto.randomBytes(8).toString('hex'),
        diseaseId,
        userId,
        authorName,
        text: text.trim(),
        createdAt: new Date().toISOString(),
        replies: [],
      };

      const diseaseObj = inMemoryDiseases.find((d) => d.id === diseaseId);
      if (diseaseObj) {
        diseaseObj.comments.push(comment);
      }
    }

    return NextResponse.json({ success: true, comment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to post comment' }, { status: 500 });
  }
}
