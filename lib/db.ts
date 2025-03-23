import type {
  Patient,
  Doctor,
  Caregiver,
  Admin,
  Appointment,
  CognitiveAssessment,
  CaregiverNote,
} from "@/types/dashboard"

// Simulated database for demo purposes
// In a real application, this would connect to a real database

// Mock data storage
let patients: Patient[] = []
let doctors: Doctor[] = []
let caregivers: Caregiver[] = []
let admins: Admin[] = []
let appointments: Appointment[] = []
let assessments: CognitiveAssessment[] = []
let caregiverNotes: CaregiverNote[] = []

// Initialize with some mock data
const initMockData = () => {
  // Add mock patients
  patients = [
    {
      id: "p1",
      name: "John Doe",
      age: 72,
      diagnosis: "Mild Cognitive Impairment",
      mmseScore: 24,
      lastCheckup: "2023-05-15",
      riskLevel: "medium",
      status: "active",
      cognitiveScores: [
        { date: "2023-01-15", score: 26 },
        { date: "2023-02-15", score: 25 },
        { date: "2023-03-15", score: 25 },
        { date: "2023-04-15", score: 24 },
        { date: "2023-05-15", score: 24 },
      ],
      medications: [
        {
          name: "Donepezil",
          dosage: "5mg",
          frequency: "Once daily",
          startDate: "2023-01-01",
        },
      ],
      appointments: [],
      caregiverNotes: [],
    },
    {
      id: "p2",
      name: "Jane Smith",
      age: 68,
      diagnosis: "Alzheimer's Disease",
      mmseScore: 19,
      lastCheckup: "2023-05-10",
      riskLevel: "high",
      status: "active",
      cognitiveScores: [
        { date: "2023-01-10", score: 22 },
        { date: "2023-02-10", score: 21 },
        { date: "2023-03-10", score: 20 },
        { date: "2023-04-10", score: 19 },
        { date: "2023-05-10", score: 19 },
      ],
      medications: [
        {
          name: "Memantine",
          dosage: "10mg",
          frequency: "Twice daily",
          startDate: "2023-01-01",
        },
        {
          name: "Rivastigmine",
          dosage: "3mg",
          frequency: "Once daily",
          startDate: "2023-03-15",
        },
      ],
      appointments: [],
      caregiverNotes: [],
    },
    {
      id: "p3",
      name: "Bob Johnson",
      age: 65,
      diagnosis: "Mild Cognitive Impairment",
      mmseScore: 26,
      lastCheckup: "2023-05-05",
      riskLevel: "low",
      status: "active",
      cognitiveScores: [
        { date: "2023-01-05", score: 27 },
        { date: "2023-02-05", score: 27 },
        { date: "2023-03-05", score: 26 },
        { date: "2023-04-05", score: 26 },
        { date: "2023-05-05", score: 26 },
      ],
      medications: [
        {
          name: "Donepezil",
          dosage: "5mg",
          frequency: "Once daily",
          startDate: "2023-02-01",
        },
      ],
      appointments: [],
      caregiverNotes: [],
    },
  ]

  // Add mock doctors
  doctors = [
    {
      id: "d1",
      name: "Dr. Sarah Chen",
      specialty: "Neurology",
      patients: ["p1", "p2", "p3"],
      appointments: [],
    },
  ]

  // Add mock caregivers
  caregivers = [
    {
      id: "c1",
      name: "Mary Johnson",
      patients: ["p1"],
      notes: [],
    },
    {
      id: "c2",
      name: "Robert Smith",
      patients: ["p2"],
      notes: [],
    },
  ]

  // Add mock admins
  admins = [
    {
      id: "a1",
      name: "Admin User",
      role: "admin",
      permissions: ["all"],
    },
  ]

  // Add mock appointments
  appointments = [
    {
      id: "apt1",
      patientId: "p1",
      doctorId: "d1",
      date: "2023-06-15",
      time: "10:00",
      type: "cognitive assessment",
      status: "confirmed",
    },
    {
      id: "apt2",
      patientId: "p2",
      doctorId: "d1",
      date: "2023-06-16",
      time: "11:00",
      type: "checkup",
      status: "confirmed",
    },
    {
      id: "apt3",
      patientId: "p3",
      doctorId: "d1",
      date: "2023-06-17",
      time: "14:00",
      type: "therapy",
      status: "pending",
    },
  ]

  // Link appointments to patients
  patients.forEach((patient) => {
    patient.appointments = appointments.filter((apt) => apt.patientId === patient.id)
  })

  // Add mock assessments
  assessments = [
    {
      id: "as1",
      patientId: "p1",
      doctorId: "d1",
      date: "2023-05-15",
      mmseScore: 24,
      cognitiveAreas: {
        memory: 7,
        attention: 6,
        language: 5,
        visualSpatial: 3,
        executiveFunction: 3,
      },
      notes: "Patient shows slight decline in memory function.",
      recommendations: "Continue current medication. Increase cognitive exercises.",
    },
    {
      id: "as2",
      patientId: "p2",
      doctorId: "d1",
      date: "2023-05-10",
      mmseScore: 19,
      cognitiveAreas: {
        memory: 5,
        attention: 4,
        language: 4,
        visualSpatial: 3,
        executiveFunction: 3,
      },
      notes: "Significant memory impairment observed.",
      recommendations: "Adjust medication dosage. Consider caregiver support.",
    },
  ]

  // Add mock caregiver notes
  caregiverNotes = [
    {
      id: "n1",
      patientId: "p1",
      caregiverId: "c1",
      date: "2023-05-20",
      content: "Patient forgot to take morning medication. Reminded and administered.",
      category: "medication",
    },
    {
      id: "n2",
      patientId: "p2",
      caregiverId: "c2",
      date: "2023-05-21",
      content: "Patient showed increased agitation in the evening. Calming techniques applied.",
      category: "behavior",
    },
  ]

  // Link caregiver notes to patients
  patients.forEach((patient) => {
    patient.caregiverNotes = caregiverNotes.filter((note) => note.patientId === patient.id)
  })
}

// Initialize mock data
initMockData()

// Database operations
export const db = {
  // Patient operations
  getPatients: async () => {
    return patients
  },

  getPatientById: async (id: string) => {
    return patients.find((p) => p.id === id)
  },

  getPatientsByDoctorId: async (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId)
    if (!doctor) return []
    return patients.filter((p) => doctor.patients.includes(p.id))
  },

  updatePatient: async (id: string, data: Partial<Patient>) => {
    const index = patients.findIndex((p) => p.id === id)
    if (index === -1) return null

    patients[index] = { ...patients[index], ...data }
    return patients[index]
  },

  // Doctor operations
  getDoctors: async () => {
    return doctors
  },

  getDoctorById: async (id: string) => {
    return doctors.find((d) => d.id === id)
  },

  // Caregiver operations
  getCaregivers: async () => {
    return caregivers
  },

  getCaregiverById: async (id: string) => {
    return caregivers.find((c) => c.id === id)
  },

  // Admin operations
  getAdmins: async () => {
    return admins
  },

  getAdminById: async (id: string) => {
    return admins.find((a) => a.id === id)
  },

  // Appointment operations
  getAppointments: async () => {
    return appointments
  },

  getAppointmentById: async (id: string) => {
    return appointments.find((a) => a.id === id)
  },

  getAppointmentsByPatientId: async (patientId: string) => {
    return appointments.filter((a) => a.patientId === patientId)
  },

  getAppointmentsByDoctorId: async (doctorId: string) => {
    return appointments.filter((a) => a.doctorId === doctorId)
  },

  createAppointment: async (data: Omit<Appointment, "id">) => {
    const id = `apt${appointments.length + 1}`
    const newAppointment = { id, ...data }
    appointments.push(newAppointment)

    // Update patient's appointments
    const patient = patients.find((p) => p.id === data.patientId)
    if (patient) {
      patient.appointments.push(newAppointment)
    }

    return newAppointment
  },

  updateAppointment: async (id: string, data: Partial<Appointment>) => {
    const index = appointments.findIndex((a) => a.id === id)
    if (index === -1) return null

    appointments[index] = { ...appointments[index], ...data }

    // Update in patient's appointments
    const patient = patients.find((p) => p.id === appointments[index].patientId)
    if (patient) {
      const aptIndex = patient.appointments.findIndex((a) => a.id === id)
      if (aptIndex !== -1) {
        patient.appointments[aptIndex] = appointments[index]
      }
    }

    return appointments[index]
  },

  // Assessment operations
  getAssessments: async () => {
    return assessments
  },

  getAssessmentById: async (id: string) => {
    return assessments.find((a) => a.id === id)
  },

  getAssessmentsByPatientId: async (patientId: string) => {
    return assessments.filter((a) => a.patientId === patientId)
  },

  createAssessment: async (data: Omit<CognitiveAssessment, "id">) => {
    const id = `as${assessments.length + 1}`
    const newAssessment = { id, ...data }
    assessments.push(newAssessment)

    // Update patient's MMSE score
    const patient = patients.find((p) => p.id === data.patientId)
    if (patient) {
      patient.mmseScore = data.mmseScore
      patient.cognitiveScores.push({
        date: data.date,
        score: data.mmseScore,
      })
    }

    return newAssessment
  },

  // Caregiver notes operations
  getCaregiverNotes: async () => {
    return caregiverNotes
  },

  getCaregiverNotesByPatientId: async (patientId: string) => {
    return caregiverNotes.filter((n) => n.patientId === patientId)
  },

  createCaregiverNote: async (data: Omit<CaregiverNote, "id">) => {
    const id = `n${caregiverNotes.length + 1}`
    const newNote = { id, ...data }
    caregiverNotes.push(newNote)

    // Add to patient's caregiver notes
    const patient = patients.find((p) => p.id === data.patientId)
    if (patient) {
      patient.caregiverNotes.push(newNote)
    }

    return newNote
  },

  // Dashboard metrics
  getDashboardMetrics: async () => {
    const totalPatients = patients.length
    const activePatients = patients.filter((p) => p.status === "active").length
    const highRiskPatients = patients.filter((p) => p.riskLevel === "high").length

    const today = new Date().toISOString().split("T")[0]
    const appointmentsToday = appointments.filter((a) => a.date === today).length

    const totalMmseScore = patients.reduce((sum, p) => sum + p.mmseScore, 0)
    const averageMmseScore = totalPatients > 0 ? totalMmseScore / totalPatients : 0

    const pendingAssessments = appointments.filter(
      (a) => a.type === "cognitive assessment" && a.status === "pending",
    ).length

    return {
      totalPatients,
      activePatients,
      highRiskPatients,
      appointmentsToday,
      averageMmseScore,
      pendingAssessments,
    }
  },
}

