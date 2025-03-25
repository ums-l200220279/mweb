"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Brain, Menu, X, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const navLinks = [
  { name: "Beranda", href: "/" },
  { name: "Fitur", href: "/features" },
  { name: "Harga", href: "/pricing" },
  { name: "Tentang Kami", href: "/about" },
  { name: "Blog", href: "/blog" },
  { name: "Kontak", href: "/contact" },
]

const solutions = [
  { name: "Untuk Pasien", href: "/solutions/patients" },
  { name: "Untuk Pengasuh", href: "/solutions/caregivers" },
  { name: "Untuk Dokter", href: "/solutions/doctors" },
  { name: "Untuk Institusi", href: "/solutions/institutions" },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Close mobile menu when route changes
    setIsOpen(false)
  }, [pathname])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-teal-600" />
              <span className="text-xl font-bold text-slate-900">Memoright</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) =>
              link.name === "Fitur" ? (
                <DropdownMenu key={link.name}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`text-base flex items-center px-3 py-2 rounded-md ${
                        pathname === link.href
                          ? "text-teal-600 bg-teal-50"
                          : "text-slate-700 hover:text-teal-600 hover:bg-slate-100"
                      }`}
                    >
                      Solusi <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56">
                    {solutions.map((solution) => (
                      <DropdownMenuItem key={solution.name} asChild>
                        <Link href={solution.href} className="cursor-pointer w-full">
                          {solution.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-base px-3 py-2 rounded-md ${
                    pathname === link.href
                      ? "text-teal-600 bg-teal-50"
                      : "text-slate-700 hover:text-teal-600 hover:bg-slate-100"
                  }`}
                >
                  {link.name}
                </Link>
              ),
            )}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Masuk</Link>
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700" asChild>
              <Link href="/register">Daftar</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
              {isOpen ? <X className="h-6 w-6 text-slate-700" /> : <Menu className="h-6 w-6 text-slate-700" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === link.href
                      ? "text-teal-600 bg-teal-50"
                      : "text-slate-700 hover:text-teal-600 hover:bg-slate-100"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 pb-2 border-t border-slate-200 mt-4">
                <p className="text-sm text-slate-500 mb-3">Solusi</p>
                {solutions.map((solution) => (
                  <Link
                    key={solution.name}
                    href={solution.href}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-teal-600 hover:bg-slate-100"
                  >
                    {solution.name}
                  </Link>
                ))}
              </div>
              <div className="pt-4 flex flex-col space-y-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">Masuk</Link>
                </Button>
                <Button className="w-full bg-teal-600 hover:bg-teal-700" asChild>
                  <Link href="/register">Daftar</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

