describe("Cognitive Assessment Flow", () => {
  beforeEach(() => {
    // Login dan navigasi ke halaman penilaian
    cy.login("doctor@example.com", "password")
    cy.visit("/patients/test-patient-id/assessments/new")
  })

  it("completes full MMSE assessment flow", () => {
    // Verifikasi halaman penilaian
    cy.contains("Cognitive Assessment")
    cy.contains("MMSE (Mini-Mental State Examination)")

    // Jawab pertanyaan orientasi waktu
    cy.get('input[type="date"]').type("2023-01-01")
    cy.contains("Next").click()

    // Jawab pertanyaan orientasi tempat
    cy.get('input[type="text"]').type("Hospital")
    cy.contains("Next").click()

    // Jawab pertanyaan registrasi
    cy.contains("Apple").click()
    cy.contains("Table").click()
    cy.contains("Penny").click()

    // Lanjutkan melalui semua pertanyaan
    // Navigasi melalui semua pertanyaan yang tersisa
    cy.contains("Next").click()

    // Selesaikan penilaian
    cy.contains("Complete Assessment").click()

    // Verifikasi halaman hasil
    cy.url().should("include", "/assessments/results")
    cy.contains("Assessment Results")
    cy.contains("Total Score")

    // Verifikasi skor
    cy.get('[data-testid="total-score"]').should("contain", "28")

    // Verifikasi interpretasi
    cy.contains("Normal cognitive function")

    // Verifikasi rekomendasi
    cy.contains("Recommendations")
  })

  it("validates required fields", () => {
    // Lewati pertanyaan tanpa menjawab
    cy.contains("Next").click()
    cy.contains("Next").click()
    cy.contains("Next").click()

    // Coba selesaikan tanpa menjawab semua pertanyaan
    cy.contains("Complete Assessment").click()

    // Verifikasi pesan error validasi
    cy.contains("Please correct the errors before proceeding")
  })
})

