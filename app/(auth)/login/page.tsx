import Image from "next/image"
import LoginForm from "@/components/auth/login-form"
import { Shield, Lock } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white border-b py-4">
        <div className="container flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/placeholder.svg?height=40&width=40" alt="Memoright Logo" width={40} height={40} />
            <span className="text-xl font-bold text-turquoise-600">Memoright</span>
          </Link>
          <Link href="/register" className="text-sm font-medium text-turquoise-600 hover:text-turquoise-700">
            Need an account? Sign up
          </Link>
        </div>
      </header>

      <main className="flex-1 container py-12">
        <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto items-center gap-12">
          <div className="w-full lg:w-1/2 order-2 lg:order-1">
            <div className="max-w-md mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
              <p className="text-gray-600 mb-8">Log in to access your personalized cognitive health dashboard</p>

              <LoginForm />

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <Shield className="h-4 w-4" />
                  <span>HIPAA Compliant</span>
                  <span className="mx-2">•</span>
                  <Lock className="h-4 w-4" />
                  <span>Secure Connection</span>
                </div>
                <p className="text-xs text-center text-gray-500">
                  By logging in, you agree to our{" "}
                  <Link href="/terms" className="text-turquoise-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-turquoise-600 hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 order-1 lg:order-2">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3"
                alt="Healthcare professional with patient using digital tablet"
                width={600}
                height={400}
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-turquoise-900/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Advanced Cognitive Care</h2>
                <p className="text-white/90">
                  Access your personalized cognitive health dashboard, track your progress, and connect with healthcare
                  providers
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full bg-white border-t py-4">
        <div className="container">
          <p className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} Memoright. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

