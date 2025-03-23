describe("Brain Training Flow", () => {
  beforeEach(() => {
    // Mock user authentication
    cy.intercept("POST", "/api/auth/session", {
      statusCode: 200,
      body: {
        user: {
          id: "test-user-id",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    }).as("getSession")

    // Mock game data
    cy.intercept("GET", "/api/games", {
      statusCode: 200,
      body: [
        {
          id: "memory-match",
          name: "Memory Match",
          description: "Test your memory by matching pairs of cards.",
          thumbnail: "/placeholder.svg?height=200&width=200",
          category: "memory",
          difficulty: ["easy", "medium", "hard"],
        },
        {
          id: "pattern-recognition",
          name: "Pattern Recognition",
          description: "Identify patterns and sequences to improve your cognitive abilities.",
          thumbnail: "/placeholder.svg?height=200&width=200",
          category: "attention",
          difficulty: ["easy", "medium", "hard"],
        },
      ],
    }).as("getGames")

    // Mock leaderboard data
    cy.intercept("GET", "/api/leaderboard/global", {
      statusCode: 200,
      body: [
        { userId: "user1", name: "User One", score: 9500 },
        { userId: "test-user-id", name: "Test User", score: 9200 },
        { userId: "user2", name: "User Two", score: 8900 },
      ],
    }).as("getLeaderboard")

    // Mock progress data
    cy.intercept("GET", "/api/progress/test-user-id", {
      statusCode: 200,
      body: {
        cognitiveScore: {
          overall: 78,
          memory: 82,
          attention: 75,
          processingSpeed: 80,
          problemSolving: 76,
        },
        recentGames: [
          { id: "game1", type: "memory-match", score: 950, date: new Date().toISOString() },
          {
            id: "game2",
            type: "pattern-recognition",
            score: 850,
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        achievements: [
          { id: "achievement1", name: "Memory Master", description: "Complete 10 memory games", unlocked: true },
          {
            id: "achievement2",
            name: "Perfect Score",
            description: "Get a perfect score in any game",
            unlocked: false,
          },
        ],
      },
    }).as("getProgress")

    // Mock game session creation
    cy.intercept("POST", "/api/games/sessions/start", {
      statusCode: 200,
      body: {
        sessionId: "test-session-id",
        gameId: "memory-match",
        startTime: new Date().toISOString(),
      },
    }).as("startGameSession")

    // Mock game session completion
    cy.intercept("POST", "/api/games/sessions/*/complete", {
      statusCode: 200,
      body: {
        sessionId: "test-session-id",
        gameId: "memory-match",
        score: 950,
        completed: true,
      },
    }).as("completeGameSession")

    // Visit the brain training page
    cy.visit("/brain-training")
  })

  it("should display available games", () => {
    cy.wait("@getGames")

    cy.contains("h1", "Brain Training")
    cy.contains("Memory Match")
    cy.contains("Pattern Recognition")

    // Check that game cards are rendered
    cy.get('[data-testid="game-card"]').should("have.length", 2)
  })

  it("should navigate to game details when clicking a game", () => {
    cy.wait("@getGames")

    // Click on Memory Match game
    cy.contains("Memory Match").click()

    // Should navigate to game details page
    cy.url().should("include", "/brain-training/games/memory-match")

    // Should display game details
    cy.contains("h1", "Memory Match")
    cy.contains("Test your memory by matching pairs of cards.")

    // Should display difficulty selection
    cy.contains("Select Difficulty")
    cy.contains("button", "Easy")
    cy.contains("button", "Medium")
    cy.contains("button", "Hard")
  })

  it("should start a game with selected difficulty", () => {
    cy.wait("@getGames")

    // Navigate to Memory Match game
    cy.contains("Memory Match").click()

    // Select Medium difficulty
    cy.contains("button", "Medium").click()

    // Start the game
    cy.contains("button", "Start Game").click()

    cy.wait("@startGameSession")

    // Should navigate to game play page
    cy.url().should("include", "/brain-training/games/memory-match/play")

    // Game should be rendered
    cy.contains("Memory Match")
    cy.contains("Time:")
    cy.contains("Score:")

    // Game cards should be rendered
    cy.get('[data-testid="memory-card"]').should("have.length.at.least", 12)
  })

  it("should complete a game and show results", () => {
    cy.wait("@getGames")

    // Navigate to Memory Match game
    cy.contains("Memory Match").click()

    // Select Easy difficulty
    cy.contains("button", "Easy").click()

    // Start the game
    cy.contains("button", "Start Game").click()

    cy.wait("@startGameSession")

    // Mock game completion (since we can't easily play through the actual game in a test)
    // In a real scenario, we would interact with the game
    cy.window().then((win) => {
      win.dispatchEvent(
        new CustomEvent("gameCompleted", {
          detail: {
            score: 950,
            timeElapsed: 45,
            matchedPairs: 6,
            totalPairs: 6,
          },
        }),
      )
    })

    cy.wait("@completeGameSession")

    // Should show results
    cy.contains("Game Complete!")
    cy.contains("Your Score: 950")

    // Should have options to play again or return to games
    cy.contains("button", "Play Again")
    cy.contains("button", "Back to Games")
  })

  it("should navigate to leaderboard and show rankings", () => {
    // Navigate to leaderboard
    cy.contains("Leaderboard").click()

    cy.wait("@getLeaderboard")

    // Should display leaderboard
    cy.contains("h1", "Leaderboard")

    // Should show rankings
    cy.contains("User One")
    cy.contains("9,500")

    // Current user should be highlighted
    cy.contains("Test User").parent().should("have.class", "bg-primary/10")
  })

  it("should navigate to progress page and show cognitive scores", () => {
    // Navigate to progress
    cy.contains("Progress").click()

    cy.wait("@getProgress")

    // Should display progress page
    cy.contains("h1", "Your Progress")

    // Should show cognitive scores
    cy.contains("Cognitive Score")
    cy.contains("Memory: 82")
    cy.contains("Attention: 75")

    // Should show recent games
    cy.contains("Recent Games")
    cy.contains("Memory Match")
    cy.contains("950")

    // Should show achievements
    cy.contains("Achievements")
    cy.contains("Memory Master")
  })

  it("should filter games by category", () => {
    cy.wait("@getGames")

    // Click on Memory category filter
    cy.contains("button", "Memory").click()

    // Should only show Memory Match game
    cy.get('[data-testid="game-card"]').should("have.length", 1)
    cy.contains("Memory Match")
    cy.contains("Pattern Recognition").should("not.exist")

    // Click on All category to reset filter
    cy.contains("button", "All").click()

    // Should show all games again
    cy.get('[data-testid="game-card"]').should("have.length", 2)
  })

  it("should search for games", () => {
    cy.wait("@getGames")

    // Type in search box
    cy.get('input[placeholder*="Search"]').type("pattern")

    // Should filter to show only Pattern Recognition
    cy.get('[data-testid="game-card"]').should("have.length", 1)
    cy.contains("Pattern Recognition")
    cy.contains("Memory Match").should("not.exist")

    // Clear search
    cy.get('input[placeholder*="Search"]').clear()

    // Should show all games again
    cy.get('[data-testid="game-card"]').should("have.length", 2)
  })
})

