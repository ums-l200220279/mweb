"use client"

import { useEffect } from "react"
import Image from "next/image"
import { motion, useAnimation } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Linkedin, Mail } from "lucide-react"

const teamMembers = [
  {
    name: "Dr. Emily Chen",
    role: "Chief Neuroscientist",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop",
    bio: "Dr. Chen leads our neuroscience research, bringing over 15 years of experience in cognitive health studies.",
    linkedin: "https://www.linkedin.com/in/dr-emily-chen",
    email: "emily.chen@memoright.com",
  },
  {
    name: "Alex Rodriguez",
    role: "AI Lead",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop",
    bio: "Alex oversees the development of our AI algorithms, ensuring cutting-edge technology in cognitive assessment.",
    linkedin: "https://www.linkedin.com/in/alex-rodriguez",
    email: "alex.rodriguez@memoright.com",
  },
]

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

function TeamMember({ member, index }) {
  const controls = useAnimation()
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={fadeInUp}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="bg-white shadow-xl rounded-lg overflow-hidden transform transition duration-300 hover:scale-105">
        <CardHeader className="p-6">
          <Image
            src={member.image || "/placeholder.svg"}
            alt={member.name}
            width={300}
            height={300}
            priority={index < 2} // Memprioritaskan loading gambar pertama
            className="rounded-full w-32 h-32 mx-auto mb-4 object-cover"
          />
          <CardTitle className="text-center text-2xl font-bold">{member.name}</CardTitle>
          <CardDescription className="text-center text-lg text-teal-600">{member.role}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-700 mb-4">{member.bio}</p>
          <div className="flex justify-center space-x-4">
            {member.linkedin && (
              <Button variant="outline" size="sm" asChild>
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="mr-2 h-4 w-4" />
                  LinkedIn
                </a>
              </Button>
            )}
            {member.email && (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${member.email}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function TeamsPage() {
  const controls = useAnimation()
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  return (
    <div className="bg-gradient-to-b from-teal-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div ref={ref} animate={controls} initial="hidden" variants={fadeInUp} transition={{ duration: 0.5 }}>
          <h1 className="text-5xl font-bold text-center mb-4">Our Team</h1>
          <p className="text-xl text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Meet the experts behind Memoright's innovative cognitive health technology.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member, index) => (
            <TeamMember key={member.name} member={member} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

