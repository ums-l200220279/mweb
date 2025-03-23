"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion } from "framer-motion"
import { Brain, AlertTriangle, Stethoscope, HeartPulse, Users, Lightbulb, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const categories = [
  { name: "Overview", value: "overview", icon: Brain },
  { name: "Warning Signs", value: "warning-signs", icon: AlertTriangle },
  { name: "Diagnosis", value: "diagnosis", icon: Stethoscope },
  { name: "Treatment", value: "treatment", icon: HeartPulse },
  { name: "Caregiving", value: "caregiving", icon: Users },
  { name: "Research", value: "research", icon: Lightbulb },
]

const warningSignsList = [
  {
    title: "Memory Loss That Disrupts Daily Life",
    description:
      "Forgetting recently learned information, important dates or events, asking for the same information repeatedly, or relying heavily on memory aids.",
    icon: Brain,
    color: "bg-red-100",
    textColor: "text-red-600",
  },
  {
    title: "Challenges in Planning or Solving Problems",
    description:
      "Difficulty following a familiar recipe, keeping track of monthly bills, or concentrating on detailed tasks, especially those involving numbers.",
    icon: Brain,
    color: "bg-orange-100",
    textColor: "text-orange-600",
  },
  {
    title: "Difficulty Completing Familiar Tasks",
    description:
      "Trouble driving to a familiar location, managing a budget at work, or remembering the rules of a favorite game.",
    icon: Clock,
    color: "bg-yellow-100",
    textColor: "text-yellow-600",
  },
  {
    title: "Confusion with Time or Place",
    description:
      "Losing track of dates, seasons, or the passage of time. May forget where they are or how they got there.",
    icon: Clock,
    color: "bg-green-100",
    textColor: "text-green-600",
  },
  {
    title: "Trouble Understanding Visual Images and Spatial Relationships",
    description:
      "Difficulty reading, judging distance, determining color or contrast, or recognizing their own reflection.",
    icon: Brain,
    color: "bg-blue-100",
    textColor: "text-blue-600",
  },
  {
    title: "New Problems with Words in Speaking or Writing",
    description:
      "Trouble following or joining a conversation, stopping in the middle of a conversation with no idea how to continue, or repeating themselves.",
    icon: Brain,
    color: "bg-indigo-100",
    textColor: "text-indigo-600",
  },
  {
    title: "Misplacing Things and Losing the Ability to Retrace Steps",
    description:
      "Putting things in unusual places, losing things and being unable to retrace steps to find them, sometimes accusing others of stealing.",
    icon: Brain,
    color: "bg-purple-100",
    textColor: "text-purple-600",
  },
  {
    title: "Decreased or Poor Judgment",
    description:
      "Changes in judgment or decision-making, especially with money. May pay less attention to personal hygiene.",
    icon: Brain,
    color: "bg-pink-100",
    textColor: "text-pink-600",
  },
  {
    title: "Withdrawal from Work or Social Activities",
    description:
      "Removing themselves from hobbies, social activities, work projects, or sports. May have trouble keeping up with a favorite team or activity.",
    icon: Users,
    color: "bg-red-100",
    textColor: "text-red-600",
  },
  {
    title: "Changes in Mood and Personality",
    description:
      "Becoming confused, suspicious, depressed, fearful, or anxious. May be easily upset at home, with friends, or when out of their comfort zone.",
    icon: Brain,
    color: "bg-orange-100",
    textColor: "text-orange-600",
  },
]

const dementiaTypes = [
  {
    name: "Alzheimer's Disease",
    description:
      "The most common cause of dementia, characterized by abnormal protein deposits in the brain that disrupt communication between brain cells and eventually cause cell death.",
    percentage: "60-80% of cases",
    symptoms: "Begins with memory loss, progresses to confusion, disorientation, and behavior changes.",
  },
  {
    name: "Vascular Dementia",
    description: "Caused by conditions that damage blood vessels in the brain, reducing blood flow to brain tissue.",
    percentage: "5-10% of cases",
    symptoms:
      "May include impaired judgment, difficulty planning and organizing, confusion, and trouble with concentration and attention. Often occurs suddenly after a stroke.",
  },
  {
    name: "Lewy Body Dementia",
    description: "Caused by abnormal deposits of the alpha-synuclein protein (Lewy bodies) in the brain.",
    percentage: "5-10% of cases",
    symptoms:
      "Visual hallucinations, fluctuations in alertness and attention, Parkinson's-like symptoms such as rigid muscles and slow movement.",
  },
  {
    name: "Frontotemporal Dementia",
    description: "Involves damage to neurons in the frontal and temporal lobes of the brain.",
    percentage: "5-10% of cases",
    symptoms: "Personality and behavior changes, difficulty with language, emotional blunting, and lack of inhibition.",
  },
  {
    name: "Mixed Dementia",
    description: "Characterized by abnormalities linked to more than one type of dementia occurring simultaneously.",
    percentage: "10-15% of cases",
    symptoms:
      "Varies based on the brain regions affected and may show a combination of symptoms from different dementia types.",
  },
]

const faqs = [
  {
    question: "Is dementia the same as Alzheimer's disease?",
    answer:
      "No, dementia is an umbrella term for a set of symptoms including memory loss and difficulties with thinking, problem-solving, or language. Alzheimer's disease is the most common cause of dementia, accounting for 60-80% of cases, but there are many other types of dementia with different causes.",
  },
  {
    question: "Is dementia a normal part of aging?",
    answer:
      "No, dementia is not a normal part of aging. While age is the strongest known risk factor, dementia is caused by diseases that damage brain cells. Many people live into their 90s and beyond without developing dementia. Some forgetfulness is normal with age, but dementia involves more serious cognitive decline that interferes with daily functioning.",
  },
  {
    question: "Can dementia be prevented?",
    answer:
      "While there's no guaranteed way to prevent dementia, research suggests that certain lifestyle factors may help reduce risk. These include regular physical exercise, maintaining a healthy diet, staying mentally and socially active, avoiding smoking and excessive alcohol consumption, and managing conditions like high blood pressure, diabetes, and high cholesterol.",
  },
  {
    question: "Is dementia hereditary?",
    answer:
      "Most cases of dementia are not strongly hereditary. However, having a family history of dementia may increase your risk somewhat. A small percentage of dementia cases (particularly early-onset forms) are directly linked to genetic mutations that can be passed down through families. If you're concerned about family history, consider genetic counseling.",
  },
  {
    question: "What treatments are available for dementia?",
    answer:
      "While there is currently no cure for most types of dementia, there are medications that may temporarily improve symptoms or slow progression in some cases. Non-drug approaches include cognitive stimulation, physical exercise, and creating supportive environments. Treatment plans are typically personalized based on the type of dementia, symptoms, and individual needs.",
  },
  {
    question: "How is dementia diagnosed?",
    answer:
      "Diagnosing dementia typically involves a comprehensive evaluation including medical history, physical examination, cognitive and neuropsychological tests, brain imaging (such as MRI or CT scans), and sometimes blood tests or spinal fluid analysis. This process helps rule out other conditions and determine the specific type of dementia.",
  },
]

export default function DementiaInformationPage() {
  const [selectedCategory, setSelectedCategory] = useState("overview")

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Understanding Dementia</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive information about dementia, its types, warning signs, and management
          </p>
        </div>

        <Tabs defaultValue="overview" onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-8">
            {categories.map((category) => (
              <TabsTrigger key={category.value} value={category.value} className="flex items-center gap-2">
                <category.icon className="h-4 w-4" />
                <span>{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>What is Dementia?</CardTitle>
                    <CardDescription>Understanding the condition and its impact</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      Dementia is not a specific disease but rather a general term for the impaired ability to remember,
                      think, or make decisions that interferes with everyday activities. It is caused by damage to brain
                      cells that affects their ability to communicate with each other.
                    </p>
                    <p>
                      While dementia primarily affects older adults, it is not a normal part of aging. It is caused by
                      damage to brain cells that affects their ability to communicate with each other. Different types
                      of dementia are associated with particular types of brain cell damage in particular regions of the
                      brain.
                    </p>
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Common Symptoms of Dementia:</h3>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Memory loss</li>
                        <li>Difficulty communicating or finding words</li>
                        <li>Difficulty with visual and spatial abilities</li>
                        <li>Difficulty reasoning or problem-solving</li>
                        <li>Difficulty handling complex tasks</li>
                        <li>Difficulty with planning and organizing</li>
                        <li>Difficulty with coordination and motor functions</li>
                        <li>Confusion and disorientation</li>
                        <li>Personality changes</li>
                        <li>Depression, anxiety, and inappropriate behavior</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Types of Dementia</CardTitle>
                    <CardDescription>Different forms and their characteristics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      There are several types of dementia, each associated with different underlying causes and patterns
                      of symptoms. Understanding the specific type can help in managing the condition and planning for
                      care.
                    </p>
                    <div className="mt-4 space-y-4">
                      {dementiaTypes.slice(0, 3).map((type) => (
                        <div key={type.name} className="space-y-1">
                          <h3 className="font-medium">{type.name}</h3>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {type.percentage}
                            </span>
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                              {type.symptoms}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="link" className="p-0 h-auto" onClick={() => setSelectedCategory("diagnosis")}>
                      View all dementia types
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Dementia Statistics and Impact</CardTitle>
                  <CardDescription>Understanding the scope and significance of dementia</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/2 space-y-4">
                      <p>
                        Dementia has a significant impact on individuals, families, healthcare systems, and society as a
                        whole. Understanding the scope of dementia helps in recognizing its importance as a public
                        health priority.
                      </p>
                      <div className="mt-4">
                        <h3 className="font-medium mb-2">Global Impact:</h3>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Over 55 million people worldwide are living with dementia</li>
                          <li>Nearly 10 million new cases are diagnosed each year</li>
                          <li>Projected to reach 78 million by 2030 and 139 million by 2050</li>
                          <li>Leading cause of disability and dependency among older adults</li>
                          <li>Global economic cost estimated at over $1.3 trillion annually</li>
                        </ul>
                      </div>
                      <div className="mt-4">
                        <h3 className="font-medium mb-2">Risk Factors:</h3>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Age (risk doubles every 5 years after age 65)</li>
                          <li>Family history and genetics</li>
                          <li>Cardiovascular factors (high blood pressure, heart disease, stroke, diabetes)</li>
                          <li>Traumatic brain injury</li>
                          <li>Lifestyle factors (physical inactivity, poor diet, smoking, excessive alcohol)</li>
                        </ul>
                      </div>
                    </div>
                    <div className="md:w-1/2">
                      <Image
                        src="/placeholder.svg?height=300&width=500"
                        alt="Dementia Statistics Chart"
                        width={500}
                        height={300}
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" asChild>
                    <Link href="/resources/dementia-statistics">View Detailed Statistics</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3 mt-6">
              {categories.slice(1).map((category, index) => (
                <motion.div
                  key={category.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-full bg-${category.value === "warning-signs" ? "red" : category.value === "diagnosis" ? "blue" : category.value === "treatment" ? "green" : category.value === "caregiving" ? "purple" : "amber"}-100`}
                        >
                          <category.icon
                            className={`h-5 w-5 text-${category.value === "warning-signs" ? "red" : category.value === "diagnosis" ? "blue" : category.value === "treatment" ? "green" : category.value === "caregiving" ? "purple" : "amber"}-600`}
                          />
                        </div>
                        <CardTitle>{category.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {category.value === "warning-signs" &&
                          "Learn to recognize the early warning signs of dementia to seek timely medical attention."}
                        {category.value === "diagnosis" &&
                          "Understanding the diagnostic process and what to expect when seeking medical evaluation."}
                        {category.value === "treatment" &&
                          "Explore current treatment approaches, medications, and management strategies."}
                        {category.value === "caregiving" &&
                          "Resources and guidance for those caring for individuals with dementia."}
                        {category.value === "research" &&
                          "Stay informed about the latest research developments and clinical trials."}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" className="w-full" onClick={() => setSelectedCategory(category.value)}>
                        Learn About {category.name}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="warning-signs">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>10 Warning Signs of Dementia</CardTitle>
                  <CardDescription>Early recognition can lead to better management and care</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Recognizing the warning signs of dementia is crucial for early diagnosis and intervention. While
                    some symptoms may be subtle at first, they typically worsen over time and begin to interfere with
                    daily activities and relationships.
                  </p>
                  <p>
                    If you notice several of these signs in yourself or a loved one, it's important to consult with a
                    healthcare provider for a thorough evaluation.
                  </p>
                  <div className="mt-4 space-y-4">
                    {warningSignsList.slice(0, 5).map((sign) => (
                      <div key={sign.title} className="flex items-start gap-3">
                        <div className={`${sign.color} p-2 rounded-full mt-1`}>
                          <sign.icon className={`h-5 w-5 ${sign.textColor}`} />
                        </div>
                        <div>
                          <h3 className="font-medium">{sign.title}</h3>
                          <p className="text-sm text-muted-foreground">{sign.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>More Warning Signs</CardTitle>
                  <CardDescription>Additional indicators that may signal dementia</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {warningSignsList.slice(5).map((sign) => (
                      <div key={sign.title} className="flex items-start gap-3">
                        <div className={`${sign.color} p-2 rounded-full mt-1`}>
                          <sign.icon className={`h-5 w-5 ${sign.textColor}`} />
                        </div>
                        <div>
                          <h3 className="font-medium">{sign.title}</h3>
                          <p className="text-sm text-muted-foreground">{sign.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Normal Aging vs. Dementia</CardTitle>
                <CardDescription>
                  Understanding the difference between typical age-related changes and dementia symptoms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border p-2 text-left">Typical Age-Related Changes</th>
                        <th className="border p-2 text-left">Signs of Dementia</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2">
                          Sometimes forgetting names or appointments, but remembering them later
                        </td>
                        <td className="border p-2">
                          Forgetting recently learned information, important dates or events, asking for the same
                          information repeatedly
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-2">
                          Making occasional errors when managing finances or household bills
                        </td>
                        <td className="border p-2">
                          Difficulty following a familiar recipe, keeping track of monthly bills, or concentrating on
                          detailed tasks
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-2">Occasionally needing help with settings on electronic devices</td>
                        <td className="border p-2">
                          Trouble completing familiar tasks such as driving to a familiar location or remembering rules
                          of a favorite game
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-2">Confusion about the day of the week but figuring it out later</td>
                        <td className="border p-2">
                          Losing track of dates, seasons, or the passage of time; forgetting where they are or how they
                          got there
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-2">Vision changes due to cataracts or other eye conditions</td>
                        <td className="border p-2">
                          Difficulty reading, judging distance, determining color or contrast, or recognizing their own
                          reflection
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-2">Sometimes having trouble finding the right word</td>
                        <td className="border p-2">
                          Trouble following conversations, stopping mid-conversation with no idea how to continue, or
                          repeating themselves
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-2">
                          Misplacing things occasionally but being able to retrace steps to find them
                        </td>
                        <td className="border p-2">
                          Putting things in unusual places, losing things and being unable to retrace steps, sometimes
                          accusing others of stealing
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">When to See a Doctor:</h3>
                  <p className="text-sm">
                    If you or a loved one is experiencing several of these warning signs, especially if they're
                    interfering with daily life, it's important to consult with a healthcare provider. Early diagnosis
                    allows for better management of symptoms, access to treatments and support services, and time to
                    plan for the future.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link href="/resources/memory-assessment">Take Our Memory Assessment</Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="diagnosis">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>The Diagnostic Process</CardTitle>
                  <CardDescription>Understanding how dementia is diagnosed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Diagnosing dementia involves a comprehensive evaluation to rule out other conditions that may cause
                    similar symptoms and to determine the specific type of dementia. There is no single test that can
                    diagnose dementia.
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-full mt-1">
                        <Stethoscope className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Medical History</h3>
                        <p className="text-sm text-muted-foreground">
                          The doctor will review medical history, current symptoms, medication use, and family history.
                          They may also speak with family members about observed changes in behavior or abilities.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-full mt-1">
                        <Stethoscope className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Physical Examination</h3>
                        <p className="text-sm text-muted-foreground">
                          A thorough physical exam helps identify conditions that might cause or worsen dementia
                          symptoms, such as vitamin deficiencies, infections, or medication side effects.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-full mt-1">
                        <Brain className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Cognitive and Neuropsychological Tests</h3>
                        <p className="text-sm text-muted-foreground">
                          These tests evaluate memory, problem-solving, attention, language, and other cognitive skills.
                          Common tests include the Mini-Mental State Examination (MMSE) and Montreal Cognitive
                          Assessment (MoCA).
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-full mt-1">
                        <Brain className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Brain Imaging</h3>
                        <p className="text-sm text-muted-foreground">
                          CT scans, MRIs, or PET scans can identify strokes, tumors, or other problems that might cause
                          symptoms. They can also detect patterns of brain tissue loss associated with different types
                          of dementia.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-full mt-1">
                        <Stethoscope className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Laboratory Tests</h3>
                        <p className="text-sm text-muted-foreground">
                          Blood tests can check for vitamin deficiencies, thyroid problems, infections, and other
                          conditions that can affect brain function. In some cases, a lumbar puncture may be performed
                          to analyze cerebrospinal fluid.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Types of Dementia</CardTitle>
                  <CardDescription>Different forms and their characteristics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Understanding the specific type of dementia can help in managing symptoms and planning for care.
                    Each type has different causes, progression patterns, and sometimes different treatment approaches.
                  </p>
                  <div className="mt-4 space-y-4">
                    {dementiaTypes.map((type) => (
                      <div key={type.name} className="space-y-1">
                        <h3 className="font-medium">{type.name}</h3>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {type.percentage}
                          </span>
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            {type.symptoms}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Preparing for a Diagnostic Appointment</CardTitle>
                <CardDescription>How to get ready for a medical evaluation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="font-medium mb-2">Information to Gather</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>List of all symptoms noticed, when they began, and how they've changed over time</li>
                      <li>Complete medical history, including other health conditions</li>
                      <li>List of all medications, vitamins, and supplements being taken</li>
                      <li>Family medical history, especially any relatives with dementia</li>
                      <li>Recent changes in behavior, personality, or abilities</li>
                      <li>Questions or concerns you want to discuss with the doctor</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">What to Expect</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>The initial evaluation may take 1-3 hours or may be spread across multiple appointments</li>
                      <li>
                        You may be referred to specialists such as a neurologist, geriatrician, or geriatric
                        psychiatrist
                      </li>
                      <li>Bring a family member or friend who can provide additional information and take notes</li>
                      <li>Be prepared to answer detailed questions about daily functioning and behavior changes</li>
                      <li>The doctor may perform cognitive tests during the appointment</li>
                      <li>Additional tests like brain imaging may be scheduled for later dates</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">After Diagnosis:</h3>
                  <p className="text-sm">
                    If you or a loved one receives a dementia diagnosis, remember that you're not alone. Ask your
                    healthcare provider about:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                    <li>Treatment options and medication management</li>
                    <li>Local support groups for people with dementia and their caregivers</li>
                    <li>Educational resources to learn more about the specific type of dementia</li>
                    <li>Services available in your community, such as adult day programs or respite care</li>
                    <li>Planning for future care needs and legal considerations</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link href="/resources/doctor-visit-checklist">Download Doctor Visit Checklist</Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="treatment">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Current Treatment Approaches</CardTitle>
                  <CardDescription>Managing dementia symptoms and improving quality of life</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    While there is currently no cure for most types of dementia, various treatments and approaches can
                    help manage symptoms and improve quality of life. Treatment plans are typically personalized based
                    on the type of dementia, symptoms, stage, and individual needs.
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-full mt-1">
                        <HeartPulse className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Medications for Cognitive Symptoms</h3>
                        <p className="text-sm text-muted-foreground">
                          Cholinesterase inhibitors (Aricept, Exelon, Razadyne) and memantine (Namenda) may temporarily
                          improve cognitive symptoms or slow their progression in some people. These medications work
                          best when started early.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-full mt-1">
                        <HeartPulse className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Medications for Behavioral Symptoms</h3>
                        <p className="text-sm text-muted-foreground">
                          Various medications may help manage depression, anxiety, sleep disturbances, agitation, or
                          hallucinations that sometimes accompany dementia. These are used carefully due to potential
                          side effects.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-full mt-1">
                        <Brain className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Cognitive Stimulation Therapy</h3>
                        <p className="text-sm text-muted-foreground">
                          Structured activities designed to stimulate thinking, concentration, and memory. These can be
                          done individually or in groups and may help maintain cognitive function and social engagement.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-full mt-1">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Supportive Environment</h3>
                        <p className="text-sm text-muted-foreground">
                          Creating a structured, supportive environment with clear routines can reduce confusion and
                          anxiety. This includes maintaining familiar surroundings, minimizing distractions, and using
                          memory aids like calendars and labels.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-full mt-1">
                        <HeartPulse className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Lifestyle Modifications</h3>
                        <p className="text-sm text-muted-foreground">
                          Regular physical exercise, proper nutrition, adequate sleep, and stress management can help
                          manage symptoms and improve overall well-being. These approaches may also help slow cognitive
                          decline.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emerging Treatments and Research</CardTitle>
                  <CardDescription>New approaches being studied for dementia</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Research into dementia treatments is ongoing, with scientists exploring various approaches to
                    prevent, slow, or stop the disease process and to improve quality of life for those affected.
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 p-2 rounded-full mt-1">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Disease-Modifying Treatments</h3>
                        <p className="text-sm text-muted-foreground">
                          Researchers are developing medications that target the underlying disease processes, such as
                          those that reduce amyloid plaques or tau tangles in Alzheimer's disease. Some of these
                          treatments are in clinical trials.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 p-2 rounded-full mt-1">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Immunotherapy</h3>
                        <p className="text-sm text-muted-foreground">
                          Vaccines and antibodies that help the immune system target and remove abnormal proteins
                          associated with dementia. Several immunotherapy approaches are being studied in clinical
                          trials.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 p-2 rounded-full mt-1">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Stem Cell Therapy</h3>
                        <p className="text-sm text-muted-foreground">
                          Research into using stem cells to replace damaged brain cells or to deliver therapeutic agents
                          to the brain. This approach is still in early stages of research.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 p-2 rounded-full mt-1">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Gene Therapy</h3>
                        <p className="text-sm text-muted-foreground">
                          Approaches that target specific genes associated with dementia or that use genetic techniques
                          to deliver therapeutic proteins to the brain. This is an emerging area of research.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 p-2 rounded-full mt-1">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Non-Pharmacological Approaches</h3>
                        <p className="text-sm text-muted-foreground">
                          Research into the effectiveness of cognitive training, physical exercise, dietary
                          interventions, and other lifestyle approaches for preventing or managing dementia.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Comprehensive Care Approach</CardTitle>
                <CardDescription>Integrating various strategies for optimal dementia management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <h3 className="font-medium">Medical Management</h3>
                    <div className="bg-muted p-3 rounded-lg">
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Regular medical follow-up with healthcare providers</li>
                        <li>Medication management and monitoring for side effects</li>
                        <li>Treatment of co-existing medical conditions</li>
                        <li>Management of behavioral and psychological symptoms</li>
                        <li>Coordination between different healthcare specialists</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Supportive Therapies</h3>
                    <div className="bg-muted p-3 rounded-lg">
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Cognitive stimulation therapy</li>
                        <li>Occupational therapy for daily living skills</li>
                        <li>Physical therapy for mobility and exercise</li>
                        <li>Speech therapy for communication difficulties</li>
                        <li>Music or art therapy for expression and engagement</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Psychosocial Support</h3>
                    <div className="bg-muted p-3 rounded-lg">
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Support groups for people with dementia</li>
                        <li>Counseling and emotional support</li>
                        <li>Education about the condition and coping strategies</li>
                        <li>Social engagement opportunities</li>
                        <li>Caregiver support and respite services</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="mt-6 bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Person-Centered Care:</h3>
                  <p className="text-sm">
                    Effective dementia care focuses on the whole person, not just the disease. This approach:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                    <li>Respects the individual's preferences, values, and life history</li>
                    <li>Adapts care strategies as needs change over time</li>
                    <li>Promotes dignity, independence, and quality of life</li>
                    <li>Involves the person with dementia in decision-making when possible</li>
                    <li>Considers physical, emotional, social, and spiritual needs</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link href="/resources/treatment-options">Learn More About Treatment Options</Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="caregiving">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Caregiving Essentials</CardTitle>
                  <CardDescription>Fundamental aspects of providing care for someone with dementia</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Caring for someone with dementia can be both rewarding and challenging. Understanding the essentials
                    of dementia care can help caregivers provide effective support while also maintaining their own
                    well-being.
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2 rounded-full mt-1">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Understanding Dementia</h3>
                        <p className="text-sm text-muted-foreground">
                          Learning about the specific type of dementia, its progression, and common symptoms helps
                          caregivers know what to expect and how to respond appropriately to changes in behavior and
                          abilities.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2 rounded-full mt-1">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Communication Strategies</h3>
                        <p className="text-sm text-muted-foreground">
                          Effective communication becomes increasingly important as dementia progresses. Simple, clear
                          language, patience, and non-verbal cues can help maintain connection and reduce frustration.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2 rounded-full mt-1">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Creating a Safe Environment</h3>
                        <p className="text-sm text-muted-foreground">
                          Adapting the home environment to reduce hazards, prevent wandering, and support independence.
                          This may include removing tripping hazards, installing grab bars, or using door alarms.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2 rounded-full mt-1">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Managing Daily Activities</h3>
                        <p className="text-sm text-muted-foreground">
                          Establishing routines, simplifying tasks, and providing appropriate assistance with activities
                          of daily living such as bathing, dressing, eating, and toileting.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2 rounded-full mt-1">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Self-Care for Caregivers</h3>
                        <p className="text-sm text-muted-foreground">
                          Recognizing the importance of maintaining your own physical and emotional health. This
                          includes seeking support, taking breaks, and addressing your own needs.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Managing Challenging Behaviors</CardTitle>
                  <CardDescription>Strategies for addressing common behavioral symptoms</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Behavioral symptoms are common in dementia and can be among the most challenging aspects of
                    caregiving. Understanding potential causes and effective responses can help manage these situations.
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2 rounded-full mt-1">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Agitation and Aggression</h3>
                        <p className="text-sm text-muted-foreground">
                          Often triggered by discomfort, fear, or frustration. Respond calmly, identify potential
                          triggers, redirect attention, and ensure physical needs are met. Create a calm environment and
                          maintain routines.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2 rounded-full mt-1">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Wandering</h3>
                        <p className="text-sm text-muted-foreground">
                          Ensure safety with secure doors, ID bracelets, and tracking devices. Provide supervised
                          opportunities for movement, establish daily routines, and address potential triggers like
                          restlessness or discomfort.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2 rounded-full mt-1">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Repetitive Behaviors</h3>
                        <p className="text-sm text-muted-foreground">
                          Respond with patience, look for meaning behind the behavior, provide reassurance, and redirect
                          attention to meaningful activities. Avoid correcting or arguing.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2 rounded-full mt-1">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Sleep Disturbances</h3>
                        <p className="text-sm text-muted-foreground">
                          Establish regular sleep routines, limit daytime napping, ensure adequate physical activity
                          during the day, create a comfortable sleep environment, and address any pain or discomfort.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2 rounded-full mt-1">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Hallucinations and Delusions</h3>
                        <p className="text-sm text-muted-foreground">
                          Respond with empathy rather than contradiction, provide reassurance, ensure safety, distract
                          with other activities, and consult healthcare providers if these symptoms cause distress.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Caregiver Resources and Support</CardTitle>
                <CardDescription>Tools and assistance for those caring for people with dementia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <h3 className="font-medium">Education and Training</h3>
                    <div className="bg-muted p-3 rounded-lg">
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Caregiver training programs and workshops</li>
                        <li>Online courses about dementia care</li>
                        <li>Books and guides for caregivers</li>
                        <li>Videos demonstrating care techniques</li>
                        <li>Webinars and educational events</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Community Services</h3>
                    <div className="bg-muted p-3 rounded-lg">
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Adult day programs</li>
                        <li>In-home care services</li>
                        <li>Meal delivery programs</li>
                        <li>Transportation services</li>
                        <li>Respite care options</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Emotional Support</h3>
                    <div className="bg-muted p-3 rounded-lg">
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Caregiver support groups (in-person and online)</li>
                        <li>Counseling services</li>
                        <li>Peer mentoring programs</li>
                        <li>Helplines for immediate assistance</li>
                        <li>Self-care resources and techniques</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="mt-6 bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Planning for the Future:</h3>
                  <p className="text-sm">
                    As dementia progresses, care needs will change. Planning ahead can help ensure wishes are respected
                    and reduce stress during transitions.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                    <li>Discuss preferences for future care while the person with dementia can participate</li>
                    <li>Complete legal documents such as advance directives, power of attorney, and wills</li>
                    <li>Research long-term care options and financial resources</li>
                    <li>Consider when more intensive care might be needed and what that might look like</li>
                    <li>Build a support network of family, friends, and professionals</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link href="/resources/caregiver-support">Find Caregiver Support Resources</Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="research">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Current Research Focus Areas</CardTitle>
                  <CardDescription>Key areas of scientific investigation in dementia</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Research into dementia is a dynamic and rapidly evolving field. Scientists around the world are
                    investigating multiple aspects of dementia to better understand its causes, develop more effective
                    treatments, and ultimately find ways to prevent or cure these conditions.
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 p-2 rounded-full mt-1">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Disease Mechanisms</h3>
                        <p className="text-sm text-muted-foreground">
                          Research into the biological processes that lead to brain cell damage and death in different
                          types of dementia. This includes studying protein misfolding, inflammation, vascular factors,
                          and genetic influences.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 p-2 rounded-full mt-1">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Biomarkers and Early Detection</h3>
                        <p className="text-sm text-muted-foreground">
                          Development of blood tests, brain imaging techniques, and other tools to detect dementia
                          before symptoms appear or in its earliest stages, when treatments might be most effective.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 p-2 rounded-full mt-1">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Drug Development</h3>
                        <p className="text-sm text-muted-foreground">
                          Creation and testing of new medications that target specific disease processes, such as those
                          that reduce abnormal protein accumulation, protect brain cells, or address inflammation.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 p-2 rounded-full mt-1">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Risk Reduction</h3>
                        <p className="text-sm text-muted-foreground">
                          Investigation of lifestyle factors, health conditions, and environmental influences that
                          affect dementia risk, and development of strategies to reduce risk across the lifespan.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 p-2 rounded-full mt-1">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Care and Support Approaches</h3>
                        <p className="text-sm text-muted-foreground">
                          Research into non-pharmacological interventions, care models, and support strategies that
                          improve quality of life for people with dementia and their caregivers.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Promising Research Developments</CardTitle>
                  <CardDescription>Recent advances in dementia research</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    While there is still much to learn about dementia, recent years have seen significant progress in
                    several areas of research. These developments offer hope for better prevention, diagnosis, and
                    treatment in the future.
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 p-2 rounded-full mt-1">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Blood-Based Biomarkers</h3>
                        <p className="text-sm text-muted-foreground">
                          Development of blood tests that can detect markers of Alzheimer's disease and other dementias.
                          These could provide a less invasive and more accessible way to diagnose dementia or identify
                          people at risk.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 p-2 rounded-full mt-1">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Precision Medicine Approaches</h3>
                        <p className="text-sm text-muted-foreground">
                          Research into how genetic, biological, and lifestyle factors interact to influence dementia
                          risk and progression. This could lead to more personalized prevention and treatment
                          strategies.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 p-2 rounded-full mt-1">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Disease-Modifying Treatments</h3>
                        <p className="text-sm text-muted-foreground">
                          Development of medications that target the underlying disease processes rather than just
                          managing symptoms. Several promising candidates are in clinical trials, including antibodies
                          that target abnormal proteins.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 p-2 rounded-full mt-1">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Digital Technologies</h3>
                        <p className="text-sm text-muted-foreground">
                          Use of digital tools, artificial intelligence, and wearable devices to detect subtle cognitive
                          changes, monitor symptoms, and deliver interventions. These technologies could enable earlier
                          diagnosis and more personalized care.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 p-2 rounded-full mt-1">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Lifestyle Interventions</h3>
                        <p className="text-sm text-muted-foreground">
                          Growing evidence that multi-domain lifestyle interventions targeting multiple risk factors
                          simultaneously may be effective in preventing or delaying cognitive decline. Large clinical
                          trials are underway to test these approaches.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Participating in Research</CardTitle>
                <CardDescription>How individuals can contribute to advancing dementia research</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="font-medium mb-2">Clinical Trials</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Clinical trials are research studies that test new approaches to prevention, diagnosis, or
                      treatment. Participating in clinical trials is crucial for advancing dementia research and
                      developing new therapies.
                    </p>
                    <div className="bg-muted p-3 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Who Can Participate:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>People with dementia at various stages</li>
                        <li>People with mild cognitive impairment</li>
                        <li>Healthy older adults (for prevention studies)</li>
                        <li>People at higher risk due to family history or genetic factors</li>
                      </ul>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Other Ways to Contribute</h3>
                    <div className="bg-muted p-3 rounded-lg mb-4">
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Brain donation programs</li>
                        <li>Observational studies that track health and cognitive function over time</li>
                        <li>Online research studies and surveys</li>
                        <li>Genetic testing and research</li>
                        <li>Advocacy and fundraising for research</li>
                      </ul>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Research participation offers benefits such as access to cutting-edge treatments, regular
                      monitoring by healthcare professionals, and the opportunity to contribute to scientific knowledge
                      that may help future generations.
                    </p>
                  </div>
                </div>
                <div className="mt-6 bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Finding Research Opportunities:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Talk to your healthcare provider about clinical trials you might be eligible for</li>
                    <li>Visit clinical trial registries like ClinicalTrials.gov</li>
                    <li>Contact Alzheimer's and dementia research centers at universities and hospitals</li>
                    <li>
                      Reach out to organizations like the Alzheimer's Association, which maintain trial matching
                      services
                    </li>
                    <li>Join research registries that connect interested individuals with appropriate studies</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link href="/resources/clinical-trials">Find Clinical Trials</Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-8 bg-muted p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Need More Information?</h2>
          <p className="mb-4">
            If you have questions about dementia or need support, our team is here to help. We can provide resources,
            connect you with specialists, or guide you to local support services.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/contact">Contact Our Team</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/resources">Explore More Resources</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

