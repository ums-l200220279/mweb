"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db-client"
import { z } from "zod"

// Create appointment schema
const appointmentSchema = z.object({
  patientId: z.string(),
  date: z.string(),
  time: z.string(),
  type: z.string(),
  notes: z.string().optional(),
})

export async function createAppointment(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Unauthorized")
  }

  // Get doctor ID if the user is a doctor
  let doctorId: string | undefined

  if (session.user.role === "DOCTOR") {
    const doctor = await prisma.doctor.findFirst({
      where: { userId: session.user.id },
    })
    doctorId = doctor?.id
  } else {
    throw new Error("Only doctors can create appointments")
  }

  if (!doctorId) {
    throw new Error("Doctor not found")
  }

  // Validate form data
  const validatedFields = appointmentSchema.safeParse({
    patientId: formData.get("patientId"),
    date: formData.get("date"),
    time: formData.get("time"),
    type: formData.get("type"),
    notes: formData.get("notes"),
  })

  if (!validatedFields.success) {
    throw new Error("Invalid form data")
  }

  const { patientId, date, time, type, notes } = validatedFields.data

  // Create appointment
  await prisma.appointment.create({
    data: {
      patientId,
      doctorId,
      date: new Date(date),
      time,
      type,
      status: "pending",
      notes: notes || "",
    },
  })

  revalidatePath("/dashboard/doctor")
  redirect("/dashboard/doctor/appointments")
}

// Create assessment schema
const assessmentSchema = z.object({
  patientId: z.string(),
  mmseScore: z.number().min(0).max(30),
  memory: z.number().min(0).max(10).optional(),
  attention: z.number().min(0).max(10).optional(),
  language: z.number().min(0).max(10).optional(),
  visualSpatial: z.number().min(0).max(10).optional(),
  executiveFunction: z.number().min(0).max(10).optional(),
  notes: z.string().optional(),
  recommendations: z.string().optional(),
})

export async function createAssessment(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Unauthorized")
  }

  // Get doctor ID if the user is a doctor
  let doctorId: string | undefined

  if (session.user.role === "DOCTOR") {
    const doctor = await prisma.doctor.findFirst({
      where: { userId: session.user.id },
    })
    doctorId = doctor?.id
  } else {
    throw new Error("Only doctors can create assessments")
  }

  if (!doctorId) {
    throw new Error("Doctor not found")
  }

  // Validate form data
  const validatedFields = assessmentSchema.safeParse({
    patientId: formData.get("patientId"),
    mmseScore: Number.parseInt(formData.get("mmseScore") as string),
    memory: formData.get("memory") ? Number.parseInt(formData.get("memory") as string) : undefined,
    attention: formData.get("attention") ? Number.parseInt(formData.get("attention") as string) : undefined,
    language: formData.get("language") ? Number.parseInt(formData.get("language") as string) : undefined,
    visualSpatial: formData.get("visualSpatial") ? Number.parseInt(formData.get("visualSpatial") as string) : undefined,
    executiveFunction: formData.get("executiveFunction")
      ? Number.parseInt(formData.get("executiveFunction") as string)
      : undefined,
    notes: formData.get("notes") as string,
    recommendations: formData.get("recommendations") as string,
  })

  if (!validatedFields.success) {
    throw new Error("Invalid form data")
  }

  const {
    patientId,
    mmseScore,
    memory,
    attention,
    language,
    visualSpatial,
    executiveFunction,
    notes,
    recommendations,
  } = validatedFields.data

  // Create assessment
  await prisma.cognitiveAssessment.create({
    data: {
      patientId,
      doctorId,
      date: new Date(),
      mmseScore,
      memory,
      attention,
      language,
      visualSpatial,
      executiveFunction,
      notes: notes || "",
      recommendations: recommendations || "",
    },
  })

  // Update patient's MMSE score
  await prisma.patient.update({
    where: { id: patientId },
    data: { mmseScore },
  })

  // Add to cognitive scores
  await prisma.cognitiveScore.create({
    data: {
      patientId,
      date: new Date(),
      score: mmseScore,
      category: "MMSE",
    },
  })

  revalidatePath("/dashboard/doctor")
  redirect(`/dashboard/doctor/patients/${patientId}`)
}

// Schema for caregiver note creation
const caregiverNoteSchema = z.object({
  patientId: z.string(),
  content: z.string(),
  category: z.string(),
})

export async function createCaregiverNote(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Unauthorized")
  }

  const validatedFields = caregiverNoteSchema.safeParse({
    patientId: formData.get("patientId"),
    content: formData.get("content"),
    category: formData.get("category"),
  })

  if (!validatedFields.success) {
    throw new Error("Invalid form data")
  }

  const { patientId, content, category } = validatedFields.data

  try {
    // Get caregiver ID
    const caregiver = await prisma.caregiver.findFirst({
      where: {
        userId: session.user.id,
      },
    })

    if (!caregiver) {
      throw new Error("Caregiver not found")
    }

    // Create caregiver note
    await prisma.caregiverNote.create({
      data: {
        patientId,
        caregiverId: caregiver.id,
        date: new Date(),
        content,
        category,
      },
    })

    revalidatePath("/dashboard/caregiver")
    redirect("/dashboard/caregiver")
  } catch (error) {
    console.error("Error creating caregiver note:", error)
    throw new Error("Failed to create caregiver note")
  }
}

