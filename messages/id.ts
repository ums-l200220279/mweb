import type { Messages } from "@/lib/i18n/config"

const messages: Messages = {
  common: {
    welcome: "Selamat Datang di Memoright",
    login: "Masuk",
    signup: "Daftar",
    logout: "Keluar",
    settings: "Pengaturan",
    profile: "Profil",
    dashboard: "Dasbor",
  },
  games: {
    memoryMatrix: "Matriks Memori",
    numberRecall: "Ingat Angka",
    wordAssociation: "Asosiasi Kata",
    start: "Mulai Permainan",
    pause: "Jeda",
    resume: "Lanjutkan",
    quit: "Keluar Permainan",
    score: "Skor Anda: {score}",
    highScore: "Skor Tertinggi: {score}",
    level: "Level {level}",
  },
  errors: {
    general: "Terjadi kesalahan. Silakan coba lagi.",
    network: "Kesalahan jaringan. Periksa koneksi Anda.",
    auth: "Kesalahan autentikasi. Silakan masuk kembali.",
  },
  accessibility: {
    highContrast: "Mode Kontras Tinggi",
    textSize: "Ukuran Teks",
    soundEffects: "Efek Suara",
    voiceOver: "Suara Narator",
  },
}

export default messages

