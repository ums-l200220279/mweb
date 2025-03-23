import Link from "next/link"
import { Mail, Phone } from "lucide-react"

export default function DoctorFooter() {
  return (
    <footer className="w-full border-t bg-white">
      <div className="container py-4 md:py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <Link href="/doctor" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Dashboard
            </Link>
            <Link href="/doctor/patients" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Patients
            </Link>
            <Link href="/doctor/reports" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Reports
            </Link>
            <Link href="/doctor/support" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Contact Support
            </Link>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>support@memoright.com</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>WhatsApp Support</span>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>HIPAA & GDPR Compliant. All patient data is encrypted and securely stored.</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Memoright. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

