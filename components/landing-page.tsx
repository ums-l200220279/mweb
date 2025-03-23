"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TestimonialCarousel from "@/components/testimonial-carousel"
import FaqAccordion from "@/components/faq-accordion"
import { ArrowRight, Brain, Activity, BarChart3, BookOpen, Check } from "lucide-react"

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("individuals")

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1569739937968-50e3586578e3?q=80&w=2070&auto=format&fit=crop"
            alt="Senior couple enjoying life"
            fill
            className="object-cover brightness-[0.7]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 to-teal-700/50" />
        </div>

        <div className="container relative z-10">
          <div className="flex flex-col items-start gap-4 md:max-w-[640px]">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Strengthen Your Mind, <span className="text-teal-300">Brighten Your Future</span>
            </h1>
            <p className="text-xl text-white/90 md:text-2xl">
              Personalized brain training exercises, cognitive assessments, and resources to help you maintain and
              improve your cognitive health.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button asChild size="lg" className="bg-teal-500 text-white hover:bg-teal-600">
                <Link href="/register">Get Started Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Link href="/features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 bg-white">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            variants={fadeInUp}
            className="flex flex-col items-center justify-center gap-4 text-center md:max-w-[58rem] mx-auto"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-teal-900">
              Comprehensive Cognitive Health Platform
            </h2>
            <p className="text-xl text-teal-700 md:text-2xl">
              Everything you need to monitor, maintain, and improve your cognitive health in one place.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              variants={fadeInUp}
            >
              <Card className="border-teal-100 shadow-sm hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center mb-4">
                    <Brain className="w-6 h-6 text-teal-600" />
                  </div>
                  <CardTitle className="text-teal-900">Brain Training</CardTitle>
                </CardHeader>
                <CardContent>
                  <Image
                    src="https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?q=80&w=2074&auto=format&fit=crop"
                    alt="Brain training exercises"
                    width={400}
                    height={200}
                    className="rounded-lg mb-4 object-cover h-48 w-full"
                  />
                  <p className="text-teal-700">
                    Engaging exercises designed to stimulate different cognitive functions and keep your mind sharp.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/brain-training" className="text-teal-500 hover:text-teal-600 flex items-center gap-1">
                    Try exercises <ArrowRight className="w-4 h-4" />
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              variants={fadeInUp}
            >
              <Card className="border-teal-100 shadow-sm hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center mb-4">
                    <Activity className="w-6 h-6 text-teal-600" />
                  </div>
                  <CardTitle className="text-teal-900">Cognitive Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <Image
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop"
                    alt="Cognitive assessment"
                    width={400}
                    height={200}
                    className="rounded-lg mb-4 object-cover h-48 w-full"
                  />
                  <p className="text-teal-700">
                    Scientifically validated tests to evaluate your cognitive abilities and track changes over time.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/cognitive-test" className="text-teal-500 hover:text-teal-600 flex items-center gap-1">
                    Take a test <ArrowRight className="w-4 h-4" />
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              variants={fadeInUp}
            >
              <Card className="border-teal-100 shadow-sm hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-teal-600" />
                  </div>
                  <CardTitle className="text-teal-900">Progress Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <Image
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                    alt="Progress tracking"
                    width={400}
                    height={200}
                    className="rounded-lg mb-4 object-cover h-48 w-full"
                  />
                  <p className="text-teal-700">
                    Detailed analytics and visualizations to monitor your cognitive performance and improvements.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/progress" className="text-teal-500 hover:text-teal-600 flex items-center gap-1">
                    View progress <ArrowRight className="w-4 h-4" />
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              variants={fadeInUp}
            >
              <Card className="border-teal-100 shadow-sm hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-teal-600" />
                  </div>
                  <CardTitle className="text-teal-900">Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <Image
                    src="https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?q=80&w=2036&auto=format&fit=crop"
                    alt="Educational resources"
                    width={400}
                    height={200}
                    className="rounded-lg mb-4 object-cover h-48 w-full"
                  />
                  <p className="text-teal-700">
                    Educational content, articles, and guides about cognitive health, dementia, and brain wellness.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link
                    href="/resources/brain-health"
                    className="text-teal-500 hover:text-teal-600 flex items-center gap-1"
                  >
                    Explore resources <ArrowRight className="w-4 h-4" />
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* User Segments */}
      <section className="w-full py-12 md:py-24 bg-teal-50">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            variants={fadeInUp}
            className="flex flex-col items-center justify-center gap-4 text-center md:max-w-[58rem] mx-auto"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-teal-900">
              Designed for Everyone
            </h2>
            <p className="text-xl text-teal-700 md:text-2xl">
              Whether you're an individual, a caregiver, or a healthcare professional, Memoright has features tailored
              for you.
            </p>
          </motion.div>

          <Tabs defaultValue="individuals" className="mt-16 max-w-4xl mx-auto" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="individuals">Individuals</TabsTrigger>
              <TabsTrigger value="caregivers">Caregivers</TabsTrigger>
              <TabsTrigger value="professionals">Healthcare Professionals</TabsTrigger>
            </TabsList>
            <TabsContent value="individuals" className="mt-6">
              <motion.div
                initial="hidden"
                animate={activeTab === "individuals" ? "visible" : "hidden"}
                variants={fadeInUp}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div>
                  <Image
                    src="https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=2070&auto=format&fit=crop"
                    alt="Senior enjoying nature"
                    width={500}
                    height={300}
                    className="rounded-lg object-cover h-64 w-full"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-teal-900 mb-4">Take Control of Your Cognitive Health</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                      <span className="text-teal-700">Personalized brain training exercises</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                      <span className="text-teal-700">Regular cognitive assessments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                      <span className="text-teal-700">Progress tracking and insights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                      <span className="text-teal-700">Educational resources and support</span>
                    </li>
                  </ul>
                  <Button asChild className="mt-6 bg-teal-500 text-white hover:bg-teal-600 w-fit">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </div>
              </motion.div>
            </TabsContent>
            <TabsContent value="caregivers" className="mt-6">
              <motion.div
                initial="hidden"
                animate={activeTab === "caregivers" ? "visible" : "hidden"}
                variants={fadeInUp}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div>
                  <Image
                    src="https://images.unsplash.com/photo-1516307053558-e667817fcc38?q=80&w=2070&auto=format&fit=crop"
                    alt="Caregiver helping senior"
                    width={500}
                    height={300}
                    className="rounded-lg object-cover h-64 w-full"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-teal-900 mb-4">Support Your Loved Ones</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                      <span className="text-teal-700">Monitor cognitive health remotely</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                      <span className="text-teal-700">Receive alerts and notifications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                      <span className="text-teal-700">Access caregiver resources and guides</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                      <span className="text-teal-700">Coordinate with healthcare providers</span>
                    </li>
                  </ul>
                  <Button asChild className="mt-6 bg-teal-500 text-white hover:bg-teal-600 w-fit">
                    <Link href="/register">Join as Caregiver</Link>
                  </Button>
                </div>
              </motion.div>
            </TabsContent>
            <TabsContent value="professionals" className="mt-6">
              <motion.div
                initial="hidden"
                animate={activeTab === "professionals" ? "visible" : "hidden"}
                variants={fadeInUp}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div>
                  <Image
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop"
                    alt="Healthcare professional with patient"
                    width={500}
                    height={300}
                    className="rounded-lg object-cover h-64 w-full"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-teal-900 mb-4">Enhance Patient Care</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                      <span className="text-teal-700">Comprehensive patient cognitive data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                      <span className="text-teal-700">Longitudinal tracking and analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                      <span className="text-teal-700">Clinical decision support tools</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                      <span className="text-teal-700">Secure patient management system</span>
                    </li>
                  </ul>
                  <Button asChild className="mt-6 bg-teal-500 text-white hover:bg-teal-600 w-fit">
                    <Link href="/register">Professional Sign Up</Link>
                  </Button>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Featured Exercises */}
      <section className="w-full py-12 md:py-24 bg-white">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            variants={fadeInUp}
            className="flex flex-col items-center justify-center gap-4 text-center md:max-w-[58rem] mx-auto"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-teal-900">
              Featured Brain Exercises
            </h2>
            <p className="text-xl text-teal-700 md:text-2xl">
              Explore our collection of engaging cognitive training exercises designed to challenge and strengthen your
              mind.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              variants={fadeInUp}
            >
              <Card className="border-teal-100 shadow-sm hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-teal-900">Pattern Recognition</CardTitle>
                  <CardDescription>Memory & Attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <Image
                    src="https://images.unsplash.com/photo-1605870445919-838d190e8e1b?q=80&w=2072&auto=format&fit=crop"
                    alt="Pattern recognition exercise"
                    width={400}
                    height={200}
                    className="rounded-lg mb-4 object-cover h-48 w-full"
                  />
                  <p className="text-teal-700">
                    Identify and remember patterns to improve your visual memory and attention to detail.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-teal-500 text-white hover:bg-teal-600">
                    <Link href="/brain-training/pattern-recognition">Start Exercise</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              variants={fadeInUp}
            >
              <Card className="border-teal-100 shadow-sm hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-teal-900">Word Association</CardTitle>
                  <CardDescription>Language & Memory</CardDescription>
                </CardHeader>
                <CardContent>
                  <Image
                    src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1973&auto=format&fit=crop"
                    alt="Word association exercise"
                    width={400}
                    height={200}
                    className="rounded-lg mb-4 object-cover h-48 w-full"
                  />
                  <p className="text-teal-700">
                    Connect related words to strengthen language processing and semantic memory networks.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-teal-500 text-white hover:bg-teal-600">
                    <Link href="/brain-training/word-association">Start Exercise</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              variants={fadeInUp}
            >
              <Card className="border-teal-100 shadow-sm hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-teal-900">Number Sequence</CardTitle>
                  <CardDescription>Logic & Problem Solving</CardDescription>
                </CardHeader>
                <CardContent>
                  <Image
                    src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop"
                    alt="Number sequence exercise"
                    width={400}
                    height={200}
                    className="rounded-lg mb-4 object-cover h-48 w-full"
                  />
                  <p className="text-teal-700">
                    Complete number sequences to enhance logical thinking and mathematical reasoning abilities.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-teal-500 text-white hover:bg-teal-600">
                    <Link href="/brain-training/number-sequence">Start Exercise</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>

          <div className="flex justify-center mt-12">
            <Button asChild variant="outline" className="border-teal-500 text-teal-500 hover:bg-teal-50">
              <Link href="/brain-gym">View All Exercises</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full py-12 md:py-24 bg-teal-50">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            variants={fadeInUp}
            className="flex flex-col items-center justify-center gap-4 text-center md:max-w-[58rem] mx-auto"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-teal-900">
              What Our Users Say
            </h2>
            <p className="text-xl text-teal-700 md:text-2xl">
              Hear from people who have experienced the benefits of Memoright.
            </p>
          </motion.div>

          <div className="mt-16">
            <TestimonialCarousel />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-12 md:py-24 bg-white">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            variants={fadeInUp}
            className="flex flex-col items-center justify-center gap-4 text-center md:max-w-[58rem] mx-auto"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-teal-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-teal-700 md:text-2xl">
              Find answers to common questions about Memoright and cognitive health.
            </p>
          </motion.div>

          <div className="mt-16 max-w-3xl mx-auto">
            <FaqAccordion />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full py-12 md:py-24">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1932&auto=format&fit=crop"
            alt="Elderly couple walking on beach"
            fill
            className="object-cover brightness-[0.7]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 to-teal-700/50" />
        </div>

        <div className="container relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            variants={fadeInUp}
            className="flex flex-col items-center text-center gap-6 md:max-w-[640px] mx-auto"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
              Start Your Cognitive Health Journey Today
            </h2>
            <p className="text-xl text-white/90 md:text-2xl">
              Join thousands of users who are taking proactive steps to maintain and improve their cognitive health.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button asChild size="lg" className="bg-white text-teal-900 hover:bg-white/90">
                <Link href="/register">Sign Up Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

