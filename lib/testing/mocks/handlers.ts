/**
 * API Request Handlers
 *
 * This file defines mock API handlers for testing purposes.
 * It intercepts API requests and returns mock responses.
 */

import { rest } from "msw"
import { mockPatients } from "./data/patients"
import { mockAssessments } from "./data/assessments"
import { mockCognitiveScores } from "./data/cognitive-scores"
import { mockGameSessions } from "./data/game-sessions"
import { mockAnomalies } from "./data/anomalies"

export const handlers = [
  // Get patient by ID
  rest.get("/api/patients/:id", (req, res, ctx) => {
    const { id } = req.params
    const patient = mockPatients.find((p) => p.id === id)

    if (!patient) {
      return res(ctx.status(404), ctx.json({ message: "Patient not found" }))
    }

    return res(ctx.status(200), ctx.json(patient))
  }),

  // Get all patients
  rest.get("/api/patients", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockPatients))
  }),

  // Get assessments by patient ID
  rest.get("/api/patients/:id/assessments", (req, res, ctx) => {
    const { id } = req.params
    const patientAssessments = mockAssessments.filter((a) => a.patientId === id)

    return res(ctx.status(200), ctx.json(patientAssessments))
  }),

  // Get cognitive scores by patient ID
  rest.get("/api/patients/:id/cognitive-scores", (req, res, ctx) => {
    const { id } = req.params
    const patientScores = mockCognitiveScores.filter((s) => s.patientId === id)

    return res(ctx.status(200), ctx.json(patientScores))
  }),

  // Get game sessions by patient ID
  rest.get("/api/patients/:id/game-sessions", (req, res, ctx) => {
    const { id } = req.params
    const patientSessions = mockGameSessions.filter((s) => s.patientId === id)

    return res(ctx.status(200), ctx.json(patientSessions))
  }),

  // Get anomalies by patient ID
  rest.get("/api/patients/:id/anomalies", (req, res, ctx) => {
    const { id } = req.params
    const patientAnomalies = mockAnomalies.filter((a) => a.patientId === id)

    return res(ctx.status(200), ctx.json(patientAnomalies))
  }),

  // Create new assessment
  rest.post("/api/assessments", async (req, res, ctx) => {
    const assessment = await req.json()

    return res(
      ctx.status(201),
      ctx.json({
        id: "new-assessment-id",
        createdAt: new Date().toISOString(),
        ...assessment,
      }),
    )
  }),

  // Complete game session
  rest.post("/api/games/sessions/:id/complete", async (req, res, ctx) => {
    const { id } = req.params
    const results = await req.json()

    return res(
      ctx.status(200),
      ctx.json({
        id,
        completedAt: new Date().toISOString(),
        ...results,
      }),
    )
  }),

  // Authentication
  rest.post("/api/auth/login", async (req, res, ctx) => {
    const { email, password } = await req.json()

    if (email === "test@example.com" && password === "password") {
      return res(
        ctx.status(200),
        ctx.json({
          user: {
            id: "user-1",
            name: "Test User",
            email: "test@example.com",
            role: "doctor",
          },
          token: "mock-jwt-token",
        }),
      )
    }

    return res(ctx.status(401), ctx.json({ message: "Invalid credentials" }))
  }),

  // Fallback for unhandled requests
  rest.all("*", (req, res, ctx) => {
    console.error(`Unhandled request: ${req.method} ${req.url.toString()}`)
    return res(ctx.status(500), ctx.json({ message: "Unhandled request in MSW" }))
  }),
]

