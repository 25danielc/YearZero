"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Category, FrequencyType } from "@/lib/enums"

const createResolutionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.nativeEnum(Category),
  frequencyType: z.nativeEnum(FrequencyType),
  targetPerPeriod: z.number().int().positive(),
  startDate: z.string(),
})

const updateResolutionSchema = createResolutionSchema.partial().extend({
  id: z.string(),
})

export async function createResolution(
  userId: string,
  data: z.infer<typeof createResolutionSchema>
) {
  try {
    const validated = createResolutionSchema.parse(data)

    const resolution = await prisma.resolution.create({
      data: {
        userId,
        ...validated,
        startDate: new Date(validated.startDate),
      },
    })

    return { success: true, resolution }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Failed to create resolution" }
  }
}

export async function updateResolution(
  userId: string,
  data: z.infer<typeof updateResolutionSchema>
) {
  try {
    const { id, ...updateData } = updateResolutionSchema.parse(data)

    // Verify ownership
    const existing = await prisma.resolution.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return { error: "Resolution not found" }
    }

    const resolution = await prisma.resolution.update({
      where: { id },
      data: updateData.startDate
        ? { ...updateData, startDate: new Date(updateData.startDate) }
        : updateData,
    })

    return { success: true, resolution }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Failed to update resolution" }
  }
}

export async function archiveResolution(userId: string, id: string) {
  try {
    const resolution = await prisma.resolution.findFirst({
      where: { id, userId },
    })

    if (!resolution) {
      return { error: "Resolution not found" }
    }

    await prisma.resolution.update({
      where: { id },
      data: { isArchived: !resolution.isArchived },
    })

    return { success: true }
  } catch (error) {
    return { error: "Failed to archive resolution" }
  }
}

export async function deleteResolution(userId: string, id: string) {
  try {
    const resolution = await prisma.resolution.findFirst({
      where: { id, userId },
    })

    if (!resolution) {
      return { error: "Resolution not found" }
    }

    await prisma.resolution.delete({
      where: { id },
    })

    return { success: true }
  } catch (error) {
    return { error: "Failed to delete resolution" }
  }
}

