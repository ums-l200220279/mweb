import type { Messages } from "@/lib/i18n/config"

const messages: Messages = {
  common: {
    welcome: "Welcome to Memoright",
    login: "Log In",
    signup: "Sign Up",
    logout: "Log Out",
    settings: "Settings",
    profile: "Profile",
    dashboard: "Dashboard",
  },
  games: {
    memoryMatrix: "Memory Matrix",
    numberRecall: "Number Recall",
    wordAssociation: "Word Association",
    start: "Start Game",
    pause: "Pause",
    resume: "Resume",
    quit: "Quit Game",
    score: "Your Score: {score}",
    highScore: "High Score: {score}",
    level: "Level {level}",
  },
  errors: {
    general: "Something went wrong. Please try again.",
    network: "Network error. Please check your connection.",
    auth: "Authentication error. Please log in again.",
  },
  accessibility: {
    highContrast: "High Contrast Mode",
    textSize: "Text Size",
    soundEffects: "Sound Effects",
    voiceOver: "Voice Over",
  },
}

export default messages

