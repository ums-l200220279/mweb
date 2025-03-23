"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="container py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-bold text-center mb-8 text-turquoise-900">About Memoright</h1>
      </motion.div>
      <div className="grid gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-lg mb-4 text-turquoise-700">
            Memoright is at the forefront of cognitive health technology, leveraging artificial intelligence to
            revolutionize how we approach brain health and dementia care.
          </p>
          <p className="text-lg mb-4 text-turquoise-700">
            Founded in 2023 by a team of neuroscientists, AI experts, and healthcare professionals, our mission is to
            make early detection and prevention of cognitive decline accessible to everyone.
          </p>
          <p className="text-lg text-turquoise-700">
            We believe in the power of technology to transform lives, and we're committed to providing innovative,
            user-friendly solutions that empower individuals to take control of their cognitive health.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Image
            src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3"
            alt="Memoright Team"
            width={600}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2 className="text-3xl font-bold mt-12 mb-6 text-turquoise-900">Our Mission</h2>
        <p className="text-lg mb-8 text-turquoise-700">
          At Memoright, we're on a mission to empower individuals to take control of their cognitive health. We believe
          that early detection and proactive brain training can significantly improve quality of life and reduce the
          risk of cognitive decline. Our AI-powered platform is designed to make cognitive health management accessible,
          engaging, and effective for everyone.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <h2 className="text-3xl font-bold mt-12 mb-6 text-turquoise-900">Our Team</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "Dr. Emily Chen", role: "Chief Neuroscientist", image: "https://i.pravatar.cc/300?img=1" },
            { name: "Alex Rodriguez", role: "AI Lead", image: "https://i.pravatar.cc/300?img=2" },
            { name: "Sarah Johnson", role: "Head of Product", image: "https://i.pravatar.cc/300?img=3" },
            { name: "Dr. Michael Lee", role: "Medical Director", image: "https://i.pravatar.cc/300?img=4" },
            { name: "Lisa Patel", role: "UX Designer", image: "https://i.pravatar.cc/300?img=5" },
            { name: "David Kim", role: "Data Scientist", image: "https://i.pravatar.cc/300?img=6" },
          ].map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4 flex flex-col items-center">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    width={120}
                    height={120}
                    className="rounded-full mb-4"
                  />
                  <CardTitle className="text-turquoise-900">{member.name}</CardTitle>
                  <CardDescription className="text-turquoise-700">{member.role}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

