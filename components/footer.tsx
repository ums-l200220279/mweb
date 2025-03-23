import Link from "next/link"
import { Mail, Phone, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import { Container } from "@/components/layout/container"

export default function Footer() {
  return (
    <footer className="w-full border-t bg-muted/40">
      <Container size="xl" className="py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-bold">Memoright</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered cognitive health platform for dementia screening and therapy.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookie-policy"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/gdpr" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  GDPR Compliance
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold">Contact</h3>
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">support@memoright.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">+1 (555) 123-4567</span>
            </div>
            <p className="text-sm text-muted-foreground">123 AI Avenue, Silicon Valley, CA 94000</p>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Memoright. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  )
}

