import { render, screen, fireEvent, waitFor } from "@/lib/testing/test-utils"
import { AssessmentForm } from "@/components/forms/assessment-form"
import { server } from "@/lib/testing/mocks/server"
import { rest } from "msw"

describe("AssessmentForm", () => {
  it("renders the form correctly", () => {
    render(<AssessmentForm patientId="test-patient-id" />)

    // Verifikasi elemen form
    expect(screen.getByText("Cognitive Assessment")).toBeInTheDocument()
    expect(screen.getByText("MMSE (Mini-Mental State Examination)")).toBeInTheDocument()
    expect(screen.getByText("Orientation (1/3)")).toBeInTheDocument()
  })

  it("navigates through questions correctly", () => {
    render(<AssessmentForm patientId="test-patient-id" />)

    // Verifikasi pertanyaan pertama
    expect(screen.getByText("What is today's date?")).toBeInTheDocument()

    // Klik tombol Next
    fireEvent.click(screen.getByText("Next"))

    // Verifikasi pertanyaan kedua
    expect(screen.getByText("Where are we right now?")).toBeInTheDocument()

    // Klik tombol Previous
    fireEvent.click(screen.getByText("Previous"))

    // Verifikasi kembali ke pertanyaan pertama
    expect(screen.getByText("What is today's date?")).toBeInTheDocument()
  })

  it("captures user responses correctly", () => {
    render(<AssessmentForm patientId="test-patient-id" />)

    // Isi pertanyaan pertama
    const dateInput = screen.getByLabelText("What is today's date?")
    fireEvent.change(dateInput, { target: { value: "2023-01-01" } })

    // Klik tombol Next
    fireEvent.click(screen.getByText("Next"))

    // Isi pertanyaan kedua
    const placeInput = screen.getByLabelText("Where are we right now?")
    fireEvent.change(placeInput, { target: { value: "Hospital" } })

    // Klik tombol Next
    fireEvent.click(screen.getByText("Next"))

    // Pilih opsi pada pertanyaan ketiga
    const appleCheckbox = screen.getByLabelText("Apple")
    const tableCheckbox = screen.getByLabelText("Table")

    fireEvent.click(appleCheckbox)
    fireEvent.click(tableCheckbox)

    // Verifikasi checkbox dipilih
    expect(appleCheckbox).toBeChecked()
    expect(tableCheckbox).toBeChecked()
  })

  it("submits the form successfully", async () => {
    // Mock API response
    server.use(
      rest.post("/api/cognitive-assessment", (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            success: true,
            assessmentId: "new-assessment-id",
            score: {
              totalScore: 28,
              categoryScores: {},
              interpretation: "Normal cognitive function",
            },
          }),
        )
      }),
    )

    // Mock window.location.href
    const mockAssign = jest.fn()
    Object.defineProperty(window, "location", {
      value: { href: mockAssign },
      writable: true,
    })

    render(<AssessmentForm patientId="test-patient-id" />)

    // Isi semua pertanyaan dan navigasi ke akhir
    // Pertanyaan 1
    const dateInput = screen.getByLabelText("What is today's date?")
    fireEvent.change(dateInput, { target: { value: "2023-01-01" } })
    fireEvent.click(screen.getByText("Next"))

    // Pertanyaan 2
    const placeInput = screen.getByLabelText("Where are we right now?")
    fireEvent.change(placeInput, { target: { value: "Hospital" } })
    fireEvent.click(screen.getByText("Next"))

    // Pertanyaan 3
    const appleCheckbox = screen.getByLabelText("Apple")
    const tableCheckbox = screen.getByLabelText("Table")
    const pennyCheckbox = screen.getByLabelText("Penny")

    fireEvent.click(appleCheckbox)
    fireEvent.click(tableCheckbox)
    fireEvent.click(pennyCheckbox)

    // Submit form
    fireEvent.click(screen.getByText("Complete Assessment"))

    // Verifikasi form submission
    await waitFor(() => {
      expect(mockAssign).toHaveBeenCalledWith("/assessments/results/new-assessment-id")
    })
  })

  it("displays validation errors", async () => {
    // Mock API response dengan error validasi
    server.use(
      rest.post("/api/cognitive-assessment", (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({
            error: "Validation Error",
            code: "VALIDATION_ERROR",
            details: {
              "responses.orientation_time": "This field is required",
            },
          }),
        )
      }),
    )

    render(<AssessmentForm patientId="test-patient-id" />)

    // Navigasi langsung ke akhir tanpa mengisi
    fireEvent.click(screen.getByText("Next"))
    fireEvent.click(screen.getByText("Next"))

    // Submit form tanpa data lengkap
    fireEvent.click(screen.getByText("Complete Assessment"))

    // Verifikasi pesan error
    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument()
    })
  })
})

