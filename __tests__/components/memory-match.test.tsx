import { render, screen, fireEvent, act } from "@testing-library/react"
import MemoryMatch from "@/components/games/memory-match"

// Mock canvas-confetti
jest.mock("canvas-confetti", () => ({
  __esModule: true,
  default: jest.fn(),
}))

describe("MemoryMatch Component", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("renders difficulty selection screen initially", () => {
    render(<MemoryMatch />)

    expect(screen.getByText("Memory Match Game")).toBeInTheDocument()
    expect(screen.getByText("Select Difficulty")).toBeInTheDocument()
    expect(screen.getByText("Easy")).toBeInTheDocument()
    expect(screen.getByText("Medium")).toBeInTheDocument()
    expect(screen.getByText("Hard")).toBeInTheDocument()
    expect(screen.getByText("Start Game")).toBeInTheDocument()
  })

  it("starts game when Start Game button is clicked", async () => {
    render(<MemoryMatch />)

    fireEvent.click(screen.getByText("Start Game"))

    // Wait for game initialization
    await screen.findByText("Moves: 0")

    expect(screen.getByText("Moves: 0")).toBeInTheDocument()
    expect(screen.getByText("Pairs: 0/6")).toBeInTheDocument()
    expect(screen.getByText("Time: 60s")).toBeInTheDocument()
    expect(screen.getByText("Score: 0")).toBeInTheDocument()
  })

  it("decrements timer every second", async () => {
    render(<MemoryMatch />)

    fireEvent.click(screen.getByText("Start Game"))

    // Wait for game initialization
    await screen.findByText("Time: 60s")

    // Advance timer by 1 second
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(screen.getByText("Time: 59s")).toBeInTheDocument()
  })

  // Add more tests for card flipping, matching, game over, etc.
})

