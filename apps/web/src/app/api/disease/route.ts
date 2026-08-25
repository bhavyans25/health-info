import { NextResponse } from 'next/server';
import { prisma } from '@instaclone/db';
import crypto from 'crypto';
import { inMemoryDiseases } from './store';

export async function GET() {
  try {
    let diseases;
    try {
      diseases = await prisma.healthDisease.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          comments: {
            orderBy: { createdAt: 'asc' },
            include: {
              replies: {
                orderBy: { createdAt: 'asc' },
              },
            },
          },
        },
      });

      if (!diseases || diseases.length === 0) {
        return NextResponse.json({ success: true, diseases: inMemoryDiseases });
      }

      return NextResponse.json({ success: true, diseases });
    } catch (dbErr) {
      return NextResponse.json({ success: true, diseases: inMemoryDiseases });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch diseases' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, mediaUrls, userId, authorName } = body;

    if (!title || !description || !userId || !authorName) {
      return NextResponse.json({ error: 'Title, description, and author info are required' }, { status: 400 });
    }

    const now = new Date();
    const twoYearsLater = new Date(now.getTime() + 2 * 365 * 24 * 60 * 60 * 1000);
    const mediaList = Array.isArray(mediaUrls) ? mediaUrls : [];

    let newDisease;
    try {
      newDisease = await prisma.healthDisease.create({
        data: {
          title,
          description,
          mediaUrls: mediaList,
          authorId: userId,
          authorName: authorName,
          createdAt: now,
          expiresAt: twoYearsLater,
        },
        include: {
          comments: {
            include: {
              replies: true,
            },
          },
        },
      });
    } catch (dbErr) {
      newDisease = {
        id: 'disease_' + crypto.randomBytes(8).toString('hex'),
        title,
        description,
        mediaUrls: mediaList,
        authorId: userId,
        authorName: authorName,
        createdAt: now.toISOString(),
        expiresAt: twoYearsLater.toISOString(),
        comments: [],
      };
      inMemoryDiseases.unshift(newDisease);
    }

    return NextResponse.json({ success: true, disease: newDisease });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit disease entry' }, { status: 500 });
  }
}
