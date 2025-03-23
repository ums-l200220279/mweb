"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2, User, Users, Stethoscope } from "lucide-react"
import Image from "next/image"

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") || "patient"
  const [role, setRole] = useState(defaultRole)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Here you would typically handle the actual registration logic
    // For now, we'll just simulate a delay and redirect
    setTimeout(() => {
      setIsLoading(false)
      router.push("/login")
    }, 1500)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="border-0 shadow-none">
        <CardContent className="p-0">
          <Tabs defaultValue={role} onValueChange={setRole} className="mb-6">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="patient" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Patient</span>
              </TabsTrigger>
              <TabsTrigger value="caregiver" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Caregiver</span>
              </TabsTrigger>
              <TabsTrigger value="doctor" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                <span>Provider</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="patient">
              <p className="text-sm text-gray-600 mb-4">
                Create a patient account to access personalized cognitive assessments, brain training exercises, and
                track your progress.
              </p>
            </TabsContent>
            <TabsContent value="caregiver">
              <p className="text-sm text-gray-600 mb-4">
                Create a caregiver account to monitor your loved one's cognitive health, manage medications, and
                coordinate care.
              </p>
            </TabsContent>
            <TabsContent value="doctor">
              <p className="text-sm text-gray-600 mb-4">
                Create a healthcare provider account to access patient data, monitor cognitive health, and provide
                remote care.
              </p>
            </TabsContent>
          </Tabs>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-11"
              />
            </div>

            {role === "doctor" && (
              <div className="space-y-2">
                <Label htmlFor="specialty" className="text-sm font-medium text-gray-700">
                  Specialty
                </Label>
                <Select>
                  <SelectTrigger id="specialty" className="h-11">
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="psychiatry">Psychiatry</SelectItem>
                    <SelectItem value="geriatrics">Geriatrics</SelectItem>
                    <SelectItem value="primary-care">Primary Care</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters with a number and a special character
              </p>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{" "}
                <Link href="/terms" className="text-turquoise-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-turquoise-600 hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-turquoise-600 hover:bg-turquoise-700 text-white font-medium"
              disabled={isLoading || !agreeTerms}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-50 px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button type="button" variant="outline" className="h-11">
                <Image src="/placeholder.svg?height=20&width=20" alt="Google" width={20} height={20} className="mr-2" />
                Google
              </Button>
              <Button type="button" variant="outline" className="h-11">
                <Image src="/placeholder.svg?height=20&width=20" alt="Apple" width={20} height={20} className="mr-2" />
                Apple
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

