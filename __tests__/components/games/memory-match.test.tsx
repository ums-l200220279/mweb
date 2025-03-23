import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryMatchGame } from "@/components/games/memory-match"
import { useToast } from "@/hooks/use-toast"
import { trackEvent } from "@/lib/analytics"

// Mock dependencies
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}))

jest.mock("@/lib/analytics", () => ({
  trackEvent: jest.fn(),
}))

describe("MemoryMatchGame", () => {
  const mockToast = {
    toast: jest.fn(),
  }

  beforeEach(() => {
    ;(useToast as jest.Mock).mockReturnValue(mockToast)
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("renders the game with correct initial state", () => {
    render(<MemoryMatchGame difficulty="medium" onComplete={jest.fn()} userId="test-user" />)

    // Check for game title
    expect(screen.getByText("Memory Match")).toBeInTheDocument()

    // Check for game instructions
    expect(screen.getByText(/Match pairs of cards/i)).toBeInTheDocument()

    // Check for timer
    expect(screen.getByText(/Time:/i)).toBeInTheDocument()

    // Check for score
    expect(screen.getByText(/Score:/i)).toBeInTheDocument()

    // Check for cards (medium difficulty should have 16 cards)
    const cards = screen.getAllByTestId("memory-card")
    expect(cards).toHaveLength(16)

    // All cards should be face down initially
    cards.forEach((card) => {
      expect(card).toHaveAttribute("data-flipped", "false")
    })
  })

  it("flips cards when clicked", () => {
    render(<MemoryMatchGame difficulty="easy" onComplete={jest.fn()} userId="test-user" />)

    const cards = screen.getAllByTestId("memory-card")

    // Click the first card
    fireEvent.click(cards[0])
    expect(cards[0]).toHaveAttribute("data-flipped", "true")

    // Click the second card
    fireEvent.click(cards[1])
    expect(cards[1]).toHaveAttribute("data-flipped", "true")
  })

  it("keeps matched cards flipped", async () => {
    // Mock the card values to ensure we have a match
    jest.spyOn(global.Math, "random").mockReturnValue(0.1)

    render(<MemoryMatchGame difficulty="easy" onComplete={jest.fn()} userId="test-user" />)

    const cards = screen.getAllByTestId("memory-card")

    // Click the first card (index 0)
    fireEvent.click(cards[0])

    // Click the matching card (index 1 in this mock setup)
    fireEvent.click(cards[1])

    // Advance timers to allow for the match check
    jest.advanceTimersByTime(1000)

    // Both cards should still be flipped
    expect(cards[0]).toHaveAttribute("data-flipped", "true")
    expect(cards[1]).toHaveAttribute("data-flipped", "true")

    // And they should be marked as matched
    expect(cards[0]).toHaveAttribute("data-matched", "true")
    expect(cards[1]).toHaveAttribute("data-matched", "true")

    // Restore Math.random
    ;(global.Math.random as jest.Mock).mockRestore()
  })

  it("flips non-matching cards back", async () => {
    // Mock the card values to ensure we don't have a match
    jest
      .spyOn(global.Math, "random")
      .mockReturnValueOnce(0.1) // First card
      .mockReturnValueOnce(0.9) // Second card (different value)

    render(<MemoryMatchGame difficulty="easy" onComplete={jest.fn()} userId="test-user" />)

    const cards = screen.getAllByTestId("memory-card")

    // Click the first card
    fireEvent.click(cards[0])
    expect(cards[0]).toHaveAttribute("data-flipped", "true")

    // Click a non-matching card
    fireEvent.click(cards[2])
    expect(cards[2]).toHaveAttribute("data-flipped", "true")

    // Advance timers to allow for the match check and flip back
    jest.advanceTimersByTime(1500)

    // Both cards should be flipped back
    expect(cards[0]).toHaveAttribute("data-flipped", "false")
    expect(cards[2]).toHaveAttribute("data-flipped", "false")

    // Restore Math.random
    ;(global.Math.random as jest.Mock).mockRestore()
  })

  it("calls onComplete when all pairs are matched", async () => {
    // Mock a small game with just 2 pairs for easier testing
    const onCompleteMock = jest.fn()

    // Mock to ensure all cards match easily
    jest
      .spyOn(global.Math, "random")
      .mockReturnValueOnce(0.1) // Card 1
      .mockReturnValueOnce(0.1) // Card 2 (match with 1)
      .mockReturnValueOnce(0.2) // Card 3
      .mockReturnValueOnce(0.2) // Card 4 (match with 3)

    const { rerender } = render(
      <MemoryMatchGame
        difficulty="custom"
        customConfig={{ pairs: 2, timeLimit: 60 }}
        onComplete={onCompleteMock}
        userId="test-user"
      />,
    )

    const cards = screen.getAllByTestId("memory-card")
    expect(cards).toHaveLength(4) // 2 pairs = 4 cards

    // Match the first pair
    fireEvent.click(cards[0])
    fireEvent.click(cards[1])

    // Advance timers
    jest.advanceTimersByTime(1000)

    // Match the second pair
    fireEvent.click(cards[2])
    fireEvent.click(cards[3])

    // Advance timers
    jest.advanceTimersByTime(1000)

    // onComplete should be called
    expect(onCompleteMock).toHaveBeenCalled()

    // Check that analytics was tracked
    expect(trackEvent).toHaveBeenCalledWith("game_completed", {
      userId: "test-user",
      gameType: "memory_match",
      difficulty: "custom",
      score: expect.any(Number),
      timeElapsed: expect.any(Number),
    })

    // Restore Math.random
    ;(global.Math.random as jest.Mock).mockRestore()
  })

  it("ends the game when time runs out", () => {
    const onCompleteMock = jest.fn()

    render(<MemoryMatchGame difficulty="easy" onComplete={onCompleteMock} userId="test-user" />)

    // Advance timers to exceed the time limit
    jest.advanceTimersByTime(60 * 1000 + 100) // Easy mode has 60 second time limit

    // onComplete should be called
    expect(onCompleteMock).toHaveBeenCalled()

    // Toast should show time's up message
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: "Time's Up!",
      description: expect.stringContaining("You've run out of time"),
      variant: "destructive",
    })
  })

  it("adjusts difficulty based on the selected level", () => {
    // Test easy difficulty
    const { rerender } = render(<MemoryMatchGame difficulty="easy" onComplete={jest.fn()} userId="test-user" />)

    let cards = screen.getAllByTestId("memory-card")
    expect(cards).toHaveLength(12) // Easy mode has 6 pairs = 12 cards

    // Test medium difficulty
    rerender(<MemoryMatchGame difficulty="medium" onComplete={jest.fn()} userId="test-user" />)

    cards = screen.getAllByTestId("memory-card")
    expect(cards).toHaveLength(16) // Medium mode has 8 pairs = 16 cards

    // Test hard difficulty
    rerender(<MemoryMatchGame difficulty="hard" onComplete={jest.fn()} userId="test-user" />)

    cards = screen.getAllByTestId("memory-card")
    expect(cards).toHaveLength(24) // Hard mode has 12 pairs = 24 cards
  })

  it("calculates score correctly based on matches and time", async () => {
    const onCompleteMock = jest.fn()

    // Mock all cards to match easily
    jest.spyOn(global.Math, "random").mockReturnValue(0.1)

    render(
      <MemoryMatchGame
        difficulty="custom"
        customConfig={{ pairs: 2, timeLimit: 60 }}
        onComplete={onCompleteMock}
        userId="test-user"
      />,
    )

    const cards = screen.getAllByTestId("memory-card")

    // Match all pairs quickly
    fireEvent.click(cards[0])
    fireEvent.click(cards[1])

    jest.advanceTimersByTime(1000)

    fireEvent.click(cards[2])
    fireEvent.click(cards[3])

    jest.advanceTimersByTime(1000)

    // Check that onComplete was called with a high score (since we completed quickly)
    expect(onCompleteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        score: expect.any(Number),
        timeElapsed: expect.any(Number),
        matchedPairs: 2,
        totalPairs: 2,
      }),
    )

    // Restore Math.random
    ;(global.Math.random as jest.Mock).mockRestore()
  })

  it("disables interaction during card flipping animation", () => {
    render(<MemoryMatchGame difficulty="easy" onComplete={jest.fn()} userId="test-user" />)

    const cards = screen.getAllByTestId("memory-card")

    // Click the first card
    fireEvent.click(cards[0])

    // Try to click the same card again immediately (should be ignored)
    fireEvent.click(cards[0])

    // Try to click a third card while two are being compared (should be ignored)
    fireEvent.click(cards[1])
    fireEvent.click(cards[2])

    // Only the first two cards should be flipped
    expect(cards[0]).toHaveAttribute("data-flipped", "true")
    expect(cards[1]).toHaveAttribute("data-flipped", "true")
    expect(cards[2]).toHaveAttribute("data-flipped", "false")
  })
})

