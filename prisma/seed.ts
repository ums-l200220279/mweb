import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@memoright.com" },
    update: {},
    create: {
      email: "admin@memoright.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
      admin: {
        create: {
          permissions: ["all"],
        },
      },
    },
  })

  // Create doctor user
  const doctorPassword = await hash("doctor123", 10)
  const doctor = await prisma.user.upsert({
    where: { email: "sarah.chen@memoright.com" },
    update: {},
    create: {
      email: "sarah.chen@memoright.com",
      name: "Dr. Sarah Chen",
      password: doctorPassword,
      role: "DOCTOR",
      doctor: {
        create: {
          specialty: "Neurology",
        },
      },
    },
  })

  // Create patient users
  const patientPassword = await hash("patient123", 10)

  const patient1 = await prisma.user.upsert({
    where: { email: "john.doe@example.com" },
    update: {},
    create: {
      email: "john.doe@example.com",
      name: "John Doe",
      password: patientPassword,
      role: "PATIENT",
      patient: {
        create: {
          age: 72,
          gender: "Male",
          diagnosis: "Mild Cognitive Impairment",
          mmseScore: 24,
          lastCheckup: new Date("2023-05-15"),
          riskLevel: "medium",
          status: "active",
          doctorId: doctor.doctor?.id,
        },
      },
    },
  })

  const patient2 = await prisma.user.upsert({
    where: { email: "jane.smith@example.com" },
    update: {},
    create: {
      email: "jane.smith@example.com",
      name: "Jane Smith",
      password: patientPassword,
      role: "PATIENT",
      patient: {
        create: {
          age: 68,
          gender: "Female",
          diagnosis: "Alzheimer's Disease",
          mmseScore: 19,
          lastCheckup: new Date("2023-05-10"),
          riskLevel: "high",
          status: "active",
          doctorId: doctor.doctor?.id,
        },
      },
    },
  })

  // Create caregiver user
  const caregiverPassword = await hash("caregiver123", 10)
  const caregiver = await prisma.user.upsert({
    where: { email: "mary.johnson@example.com" },
    update: {},
    create: {
      email: "mary.johnson@example.com",
      name: "Mary Johnson",
      password: caregiverPassword,
      role: "CAREGIVER",
      caregiver: {
        create: {},
      },
    },
  })

  // Connect caregiver to patient
  if (patient1.patient?.id && caregiver.caregiver?.id) {
    await prisma.patient.update({
      where: { id: patient1.patient.id },
      data: {
        caregiverId: caregiver.caregiver.id,
      },
    })
  }

  // Create cognitive scores for patients
  if (patient1.patient?.id) {
    await prisma.cognitiveScore.createMany({
      data: [
        {
          patientId: patient1.patient.id,
          date: new Date("2023-01-15"),
          score: 26,
          category: "MMSE",
        },
        {
          patientId: patient1.patient.id,
          date: new Date("2023-02-15"),
          score: 25,
          category: "MMSE",
        },
        {
          patientId: patient1.patient.id,
          date: new Date("2023-03-15"),
          score: 25,
          category: "MMSE",
        },
        {
          patientId: patient1.patient.id,
          date: new Date("2023-04-15"),
          score: 24,
          category: "MMSE",
        },
        {
          patientId: patient1.patient.id,
          date: new Date("2023-05-15"),
          score: 24,
          category: "MMSE",
        },
      ],
    })
  }

  if (patient2.patient?.id) {
    await prisma.cognitiveScore.createMany({
      data: [
        {
          patientId: patient2.patient.id,
          date: new Date("2023-01-10"),
          score: 22,
          category: "MMSE",
        },
        {
          patientId: patient2.patient.id,
          date: new Date("2023-02-10"),
          score: 21,
          category: "MMSE",
        },
        {
          patientId: patient2.patient.id,
          date: new Date("2023-03-10"),
          score: 20,
          category: "MMSE",
        },
        {
          patientId: patient2.patient.id,
          date: new Date("2023-04-10"),
          score: 19,
          category: "MMSE",
        },
        {
          patientId: patient2.patient.id,
          date: new Date("2023-05-10"),
          score: 19,
          category: "MMSE",
        },
      ],
    })
  }

  // Create medications for patients
  if (patient1.patient?.id) {
    await prisma.medication.create({
      data: {
        patientId: patient1.patient.id,
        name: "Donepezil",
        dosage: "5mg",
        frequency: "Once daily",
        startDate: new Date("2023-01-01"),
        instructions: "Take with evening meal",
      },
    })
  }

  if (patient2.patient?.id) {
    await prisma.medication.createMany({
      data: [
        {
          patientId: patient2.patient.id,
          name: "Memantine",
          dosage: "10mg",
          frequency: "Twice daily",
          startDate: new Date("2023-01-01"),
          instructions: "Take with food",
        },
        {
          patientId: patient2.patient.id,
          name: "Rivastigmine",
          dosage: "3mg",
          frequency: "Once daily",
          startDate: new Date("2023-03-15"),
          instructions: "Take in the morning",
        },
      ],
    })
  }

  // Create appointments
  if (patient1.patient?.id && doctor.doctor?.id) {
    await prisma.appointment.create({
      data: {
        patientId: patient1.patient.id,
        doctorId: doctor.doctor.id,
        date: new Date("2023-06-15"),
        time: "10:00",
        type: "cognitive assessment",
        status: "confirmed",
        notes: "Regular follow-up assessment",
      },
    })
  }

  if (patient2.patient?.id && doctor.doctor?.id) {
    await prisma.appointment.create({
      data: {
        patientId: patient2.patient.id,
        doctorId: doctor.doctor.id,
        date: new Date("2023-06-16"),
        time: "11:00",
        type: "checkup",
        status: "confirmed",
        notes: "Medication review",
      },
    })
  }

  // Create cognitive assessments
  if (patient1.patient?.id && doctor.doctor?.id) {
    await prisma.cognitiveAssessment.create({
      data: {
        patientId: patient1.patient.id,
        doctorId: doctor.doctor.id,
        date: new Date("2023-05-15"),
        mmseScore: 24,
        memory: 7,
        attention: 6,
        language: 5,
        visualSpatial: 3,
        executiveFunction: 3,
        notes: "Patient shows slight decline in memory function.",
        recommendations: "Continue current medication. Increase cognitive exercises.",
      },
    })
  }

  if (patient2.patient?.id && doctor.doctor?.id) {
    await prisma.cognitiveAssessment.create({
      data: {
        patientId: patient2.patient.id,
        doctorId: doctor.doctor.id,
        date: new Date("2023-05-10"),
        mmseScore: 19,
        memory: 5,
        attention: 4,
        language: 4,
        visualSpatial: 3,
        executiveFunction: 3,
        notes: "Significant memory impairment observed.",
        recommendations: "Adjust medication dosage. Consider caregiver support.",
      },
    })
  }

  // Create caregiver notes
  if (patient1.patient?.id && caregiver.caregiver?.id) {
    await prisma.caregiverNote.create({
      data: {
        patientId: patient1.patient.id,
        caregiverId: caregiver.caregiver.id,
        date: new Date("2023-05-20"),
        content: "Patient forgot to take morning medication. Reminded and administered.",
        category: "medication",
      },
    })
  }

  console.log("Database has been seeded.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

