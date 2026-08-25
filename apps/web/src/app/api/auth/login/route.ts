import { NextResponse } from 'next/server';
import { prisma } from '@instaclone/db';
import crypto from 'crypto';

// In-memory fallback if database isn't initialized yet
const inMemoryUsers: Record<string, any> = {};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const sessionToken = crypto.randomBytes(32).toString('hex');

    let user;
    try {
      user = await prisma.healthUser.create({
        data: {
          name: trimmedName,
          token: sessionToken,
        },
      });
    } catch (dbErr) {
      // Fallback for standalone/in-memory mode if DB isn't running
      const id = 'usr_' + crypto.randomBytes(8).toString('hex');
      user = {
        id,
        name: trimmedName,
        token: sessionToken,
        createdAt: new Date().toISOString(),
      };
      inMemoryUsers[id] = user;
    }

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        token: user.token,
      },
    });

    res.cookies.set('health_token', user.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365, // 1 year session cookie
      path: '/',
    });

    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 500 });
  }
}
