describe("Patient Dashboard", () => {
  beforeEach(() => {
    // Mock authentication
    cy.intercept("GET", "/api/auth/session", {
      statusCode: 200,
      body: {
        user: {
          id: "test-doctor-id",
          name: "Test Doctor",
          email: "doctor@example.com",
          role: "doctor",
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    }).as("getSession")

    // Mock patient data
    cy.intercept("GET", "/api/patients/test-patient-id", {
      statusCode: 200,
      body: {
        id: "test-patient-id",
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1950-01-01",
        gender: "male",
        email: "john.doe@example.com",
        phone: "123-456-7890",
        address: "123 Main St, Anytown, USA",
        medicalHistory: ["Hypertension", "Diabetes"],
        medications: ["Metformin", "Lisinopril"],
        doctorId: "test-doctor-id",
        createdAt: "2023-01-01T00:00:00.000Z",
        updatedAt: "2023-01-01T00:00:00.000Z",
      },
    }).as("getPatient")

    // Mock cognitive scores
    cy.intercept("GET", "/api/patients/test-patient-id/cognitive-scores", {
      statusCode: 200,
      body: [
        {
          id: "score-1",
          patientId: "test-patient-id",
          date: "2023-01-01T00:00:00.000Z",
          mmseScore: 28,
          memoryScore: 85,
          attentionScore: 90,
          languageScore: 95,
          visuospatialScore: 80,
          executiveFunctionScore: 85,
          notes: "Initial assessment",
        },
        {
          id: "score-2",
          patientId: "test-patient-id",
          date: "2023-02-01T00:00:00.000Z",
          mmseScore: 27,
          memoryScore: 80,
          attentionScore: 85,
          languageScore: 90,
          visuospatialScore: 75,
          executiveFunctionScore: 80,
          notes: "Follow-up assessment",
        },
        {
          id: "score-3",
          patientId: "test-patient-id",
          date: "2023-03-01T00:00:00.000Z",
          mmseScore: 29,
          memoryScore: 90,
          attentionScore: 95,
          languageScore: 95,
          visuospatialScore: 85,
          executiveFunctionScore: 90,
          notes: "Improvement noted",
        },
      ],
    }).as("getCognitiveScores")

    // Mock game sessions
    cy.intercept("GET", "/api/patients/test-patient-id/game-sessions", {
      statusCode: 200,
      body: [
        {
          id: "session-1",
          patientId: "test-patient-id",
          gameId: "number-memory",
          score: 85,
          duration: 300,
          difficulty: "medium",
          metrics: {
            correctAnswers: 17,
            totalQuestions: 20,
            averageResponseTime: 2.5,
          },
          completedAt: "2023-01-15T00:00:00.000Z",
          status: "completed",
        },
        {
          id: "session-2",
          patientId: "test-patient-id",
          gameId: "word-association",
          score: 90,
          duration: 240,
          difficulty: "medium",
          metrics: {
            correctAnswers: 18,
            totalQuestions: 20,
            averageResponseTime: 2.2,
          },
          completedAt: "2023-02-15T00:00:00.000Z",
          status: "completed",
        },
        {
          id: "session-3",
          patientId: "test-patient-id",
          gameId: "pattern-recognition",
          score: 80,
          duration: 360,
          difficulty: "medium",
          metrics: {
            correctAnswers: 16,
            totalQuestions: 20,
            averageResponseTime: 2.8,
          },
          completedAt: "2023-03-15T00:00:00.000Z",
          status: "completed",
        },
      ],
    }).as("getGameSessions")

    // Mock anomalies
    cy.intercept("GET", "/api/patients/test-patient-id/anomalies", {
      statusCode: 200,
      body: [
        {
          id: "anomaly-1",
          patientId: "test-patient-id",
          type: "cognitive-decline",
          severity: "moderate",
          affectedDomain: "memory",
          description: "Significant decrease in memory performance",
          confidence: 0.85,
          detectedAt: "2023-02-01T00:00:00.000Z",
          source: "mmse",
          sourceId: "score-2",
        },
      ],
    }).as("getAnomalies")

    // Visit the patient dashboard
    cy.visit("/dashboard/patient/test-patient-id")
    cy.wait(["@getSession", "@getPatient", "@getCognitiveScores", "@getGameSessions", "@getAnomalies"])
  })

  it("should display patient information correctly", () => {
    cy.get("h1").should("contain", "John Doe")
    cy.get('[data-testid="patient-age"]').should("exist")
    cy.get('[data-testid="patient-gender"]').should("contain", "Male")
    cy.get('[data-testid="patient-email"]').should("contain", "john.doe@example.com")
    cy.get('[data-testid="patient-phone"]').should("contain", "123-456-7890")
  })

  it("should display cognitive charts", () => {
    cy.get('[data-testid="cognitive-chart"]').should("exist")
    cy.get('[data-testid="cognitive-chart"] [role="tablist"]').should("exist")
    cy.get('[data-testid="cognitive-chart"] [role="tab"]').should("have.length", 2)

    // Check MMSE tab
    cy.get('[data-testid="cognitive-chart"] [role="tab"]').first().click()
    cy.get('[data-testid="cognitive-chart"] .recharts-surface').should("exist")

    // Check Cognitive Domains tab
    cy.get('[data-testid="cognitive-chart"] [role="tab"]').last().click()
    cy.get('[data-testid="cognitive-chart"] .recharts-surface').should("exist")
    cy.get('[data-testid="cognitive-chart"] .recharts-legend-item').should("have.length.at.least", 5)
  })

  it("should display game performance", () => {
    cy.get('[data-testid="game-performance"]').should("exist")
    cy.get('[data-testid="game-performance"] .recharts-surface').should("exist")
  })

  it("should display anomalies if present", () => {
    cy.get('[data-testid="anomalies-section"]').should("exist")
    cy.get('[data-testid="anomaly-card"]').should("have.length", 1)
    cy.get('[data-testid="anomaly-card"]').should("contain", "Significant decrease in memory performance")
  })

  it("should allow changing date range", () => {
    cy.get('[data-testid="date-range-picker"]').should("exist")
    cy.get('[data-testid="date-range-picker"]').click()

    // Select last 90 days
    cy.get('[data-testid="date-range-90"]').click()

    // Verify that API calls were made with the new date range
    cy.wait(["@getCognitiveScores", "@getGameSessions", "@getAnomalies"])
  })

  it("should navigate between tabs", () => {
    cy.get('[data-testid="dashboard-tabs"] [role="tab"]').should("have.length", 5)

    // Check Overview tab (default)
    cy.get('[data-testid="overview-tab-content"]').should("be.visible")

    // Navigate to Cognitive Domains tab
    cy.get('[data-testid="dashboard-tabs"] [role="tab"]').eq(1).click()
    cy.get('[data-testid="cognitive-domains-tab-content"]').should("be.visible")

    // Navigate to Assessments tab
    cy.get('[data-testid="dashboard-tabs"] [role="tab"]').eq(2).click()
    cy.get('[data-testid="assessments-tab-content"]').should("be.visible")

    // Navigate to Predictions tab
    cy.get('[data-testid="dashboard-tabs"] [role="tab"]').eq(3).click()
    cy.get('[data-testid="predictions-tab-content"]').should("be.visible")

    // Navigate to Anomalies tab
    cy.get('[data-testid="dashboard-tabs"] [role="tab"]').eq(4).click()
    cy.get('[data-testid="anomalies-tab-content"]').should("be.visible")
  })
})

