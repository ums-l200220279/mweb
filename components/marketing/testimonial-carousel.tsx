"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function TestimonialCarousel({ testimonials }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay, testimonials.length])

  const handlePrevious = () => {
    setAutoplay(false)
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length)
  }

  const handleNext = () => {
    setAutoplay(false)
    setActiveIndex((current) => (current + 1) % testimonials.length)
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from healthcare professionals, patients, and individuals who have experienced cognitive improvements
            with MemoRight.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <Card className="bg-card border border-border shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0">
                          <Image
                            src={testimonial.image || "/placeholder.svg"}
                            alt={testimonial.author}
                            width={80}
                            height={80}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Zap
                                key={i}
                                className={cn(
                                  "h-4 w-4 mr-1",
                                  i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground",
                                )}
                              />
                            ))}
                          </div>
                          <p className="text-lg italic mb-6">"{testimonial.quote}"</p>
                          <div>
                            <p className="font-medium">{testimonial.author}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-6 gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevious} className="rounded-full">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>

            {testimonials.map((_, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className={cn("w-2 h-2 p-0 rounded-full", activeIndex === index ? "bg-primary" : "bg-muted")}
                onClick={() => {
                  setAutoplay(false)
                  setActiveIndex(index)
                }}
              >
                <span className="sr-only">Go to slide {index + 1}</span>
              </Button>
            ))}

            <Button variant="outline" size="icon" onClick={handleNext} className="rounded-full">
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

