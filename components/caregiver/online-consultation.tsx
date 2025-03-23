import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, Star } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const specialists = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Neurologist",
    image: "/placeholder.svg?height=80&width=80",
    rating: 4.9,
    reviews: 124,
    nextAvailable: "Today, 4:00 PM",
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Geriatric Psychiatrist",
    image: "/placeholder.svg?height=80&width=80",
    rating: 4.8,
    reviews: 98,
    nextAvailable: "Tomorrow, 10:00 AM",
  },
  {
    id: 3,
    name: "Dr. Emily Williams",
    specialty: "Geriatrician",
    image: "/placeholder.svg?height=80&width=80",
    rating: 4.7,
    reviews: 87,
    nextAvailable: "March 16, 2:30 PM",
  },
]

export default function OnlineConsultation() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-medium">Available Specialists</h3>
        <div className="flex items-center space-x-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              <SelectItem value="neurologist">Neurologist</SelectItem>
              <SelectItem value="psychiatrist">Psychiatrist</SelectItem>
              <SelectItem value="geriatrician">Geriatrician</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {specialists.map((specialist) => (
        <Card key={specialist.id} className="p-4">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Image
              src={specialist.image || "/placeholder.svg"}
              alt={specialist.name}
              width={80}
              height={80}
              className="rounded-full"
            />
            <div className="flex-1">
              <h4 className="font-medium">{specialist.name}</h4>
              <p className="text-sm text-slate-500">{specialist.specialty}</p>
              <div className="flex items-center mt-1">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm font-medium">{specialist.rating}</span>
                </div>
                <span className="mx-2 text-sm text-slate-400">•</span>
                <span className="text-sm text-slate-500">{specialist.reviews} reviews</span>
              </div>
              <div className="flex items-center mt-2 text-sm">
                <Clock className="mr-1 h-4 w-4 text-turquoise-500" />
                <span>Next available: {specialist.nextAvailable}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 min-w-[140px]">
              <Button>Book Consultation</Button>
              <Button variant="outline">View Profile</Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

