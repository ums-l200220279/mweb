"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

const testimonials = [
  {
    id: 1,
    name: "Budi Santoso",
    role: "Pasien",
    content:
      "Memoright membantu saya melatih otak setiap hari. Saya merasa lebih tajam dan ingatan saya membaik setelah menggunakan aplikasi ini selama 3 bulan.",
    avatar:
      "https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?auto=format&fit=crop&q=80&w=2071&ixlib=rb-4.0.3",
  },
  {
    id: 2,
    name: "Siti Rahayu",
    role: "Pengasuh",
    content:
      "Sebagai pengasuh, aplikasi ini sangat membantu saya memantau perkembangan kognitif ibu saya. Sistem pengingat obat juga sangat berguna.",
    avatar:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1974&ixlib=rb-4.0.3",
  },
  {
    id: 3,
    name: "Dr. Hendra Wijaya",
    role: "Dokter Saraf",
    content:
      "Memoright menyediakan data yang komprehensif untuk membantu diagnosis dan pemantauan pasien. Sangat membantu dalam praktik klinis saya.",
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
  },
]

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  const next = useCallback(() => {
    setCurrent((current + 1) % testimonials.length)
  }, [current])

  const prev = useCallback(() => {
    setCurrent((current - 1 + testimonials.length) % testimonials.length)
  }, [current])

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [autoplay, next])

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="w-full flex-shrink-0 border-none shadow-none">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="relative h-20 w-20 rounded-full overflow-hidden">
                  <Image
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <blockquote className="text-lg italic">"{testimonial.content}"</blockquote>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-4 space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full ${current === index ? "bg-primary" : "bg-gray-300"}`}
            onClick={() => setCurrent(index)}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-background shadow-md md:flex hidden"
        onClick={prev}
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full bg-background shadow-md md:flex hidden"
        onClick={next}
        aria-label="Next testimonial"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

