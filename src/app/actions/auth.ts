"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { signIn } from "next-auth/react"

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function signUp(data: { email: string; password: string }) {
  try {
    const validated = signUpSchema.parse(data)

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return { error: "Email already exists" }
    }

    const passwordHash = await bcrypt.hash(validated.password, 10)

    const user = await prisma.user.create({
      data: {
        email: validated.email,
        passwordHash,
      },
    })

    // Create initial level progress
    await prisma.levelProgress.create({
      data: {
        userId: user.id,
        totalXp: 0,
        level: 1,
      },
    })

    return { success: true, userId: user.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Failed to create account" }
  }
}

