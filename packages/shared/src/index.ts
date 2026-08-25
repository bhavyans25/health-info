import { z } from 'zod';

// Authentication & Onboarding
export const RegisterSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(30, { message: "Username must be at most 30 characters" })
    .regex(/^[a-zA-Z0-9_.]+$/, { message: "Username can only contain letters, numbers, underscores, and dots" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
});

export const LoginSchema = z.object({
  usernameOrEmail: z.string().min(1, { message: "Username or Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// Profile Management
export const ProfileUpdateSchema = z.object({
  displayName: z.string()
    .max(50, { message: "Display name cannot exceed 50 characters" })
    .optional(),
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(30, { message: "Username must be at most 30 characters" })
    .regex(/^[a-zA-Z0-9_.]+$/, { message: "Username can only contain letters, numbers, underscores, and dots" })
    .optional(),
  bio: z.string()
    .max(150, { message: "Bio cannot exceed 150 characters" })
    .optional(),
  avatarUrl: z.string().url({ message: "Invalid avatar URL" }).optional().or(z.literal('')),
  externalLink: z.string().url({ message: "Invalid external link URL" }).optional().or(z.literal('')),
});

// Posts
export const PostCreateSchema = z.object({
  caption: z.string().max(2200, { message: "Caption cannot exceed 2200 characters" }).optional(),
  mediaUrls: z.array(z.string().url({ message: "Invalid media URL" }))
    .min(1, { message: "At least one image is required" }),
});

export const CommentCreateSchema = z.object({
  text: z.string()
    .min(1, { message: "Comment cannot be empty" })
    .max(1000, { message: "Comment cannot exceed 1000 characters" }),
});

// E2EE Direct Messages
export const MessageSendSchema = z.object({
  conversationId: z.string().uuid({ message: "Invalid conversation ID" }),
  ciphertext: z.string().min(1, { message: "Ciphertext is required" }),
  nonce: z.string().min(1, { message: "Nonce is required" }),
});

// Types from schemas
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
export type PostCreateInput = z.infer<typeof PostCreateSchema>;
export type CommentCreateInput = z.infer<typeof CommentCreateSchema>;
export type MessageSendInput = z.infer<typeof MessageSendSchema>;
