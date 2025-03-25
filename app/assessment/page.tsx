import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Clock, FileText, ArrowRight, Info } from "lucide-react"
import Image from "next/image"

export default function AssessmentPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-3">Comprehensive Cognitive Assessment</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our scientifically validated assessment evaluates six key cognitive domains to create your personalized
            cognitive profile.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Assessment Overview</CardTitle>
                <CardDescription>What to expect during your assessment</CardDescription>
              </div>
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">20-25 minutes</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-lg">
                <div className="bg-primary/10 p-3 rounded-full mb-3">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium mb-2">6 Cognitive Domains</h3>
                <p className="text-sm text-muted-foreground">Tests attention, memory, processing speed, and more</p>
              </div>

              <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-lg">
                <div className="bg-primary/10 p-3 rounded-full mb-3">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium mb-2">Detailed Report</h3>
                <p className="text-sm text-muted-foreground">
                  Receive a comprehensive analysis of your cognitive strengths
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-lg">
                <div className="bg-primary/10 p-3 rounded-full mb-3">
                  <ArrowRight className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium mb-2">Personalized Plan</h3>
                <p className="text-sm text-muted-foreground">Get a tailored training program based on your results</p>
              </div>
            </div>

            <div className="mt-6 p-4 border border-border bg-muted/20 rounded-lg flex items-start gap-3">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm">
                  For the most accurate results, take the assessment in a quiet environment free from distractions.
                  You'll need approximately 25 minutes of uninterrupted time.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">
              Begin Assessment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Assessment Tasks</h2>

          <Tabs defaultValue="attention" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="attention">Attention</TabsTrigger>
              <TabsTrigger value="memory">Memory</TabsTrigger>
              <TabsTrigger value="processing">Processing Speed</TabsTrigger>
            </TabsList>

            <TabsContent value="attention" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-medium mb-3">Divided Attention Test</h3>
                  <p className="text-muted-foreground mb-4">
                    Measures your ability to respond to multiple stimuli simultaneously, a critical skill for
                    multitasking.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-sm">Monitor visual and auditory cues</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-sm">Respond to specific target patterns</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-sm">Balance speed and accuracy</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-muted rounded-lg overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=200&width=400&text=Divided+Attention+Test"
                    alt="Divided Attention Test visualization"
                    width={400}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="memory" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-medium mb-3">Working Memory Test</h3>
                  <p className="text-muted-foreground mb-4">
                    Evaluates your ability to temporarily hold and manipulate information, essential for complex
                    cognitive tasks.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-sm">Remember sequences of items</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-sm">Manipulate information mentally</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-sm">Recall items in specific orders</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-muted rounded-lg overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=200&width=400&text=Working+Memory+Test"
                    alt="Working Memory Test visualization"
                    width={400}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="processing" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-medium mb-3">Processing Speed Test</h3>
                  <p className="text-muted-foreground mb-4">
                    Measures how quickly your brain processes information and responds, a fundamental cognitive ability.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-sm">React to visual stimuli</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-sm">Make quick decisions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-sm">Perform under time pressure</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-muted rounded-lg overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=200&width=400&text=Processing+Speed+Test"
                    alt="Processing Speed Test visualization"
                    width={400}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="bg-muted/30 rounded-xl p-6 border border-border">
          <h2 className="text-xl font-bold mb-4">What Happens After Your Assessment?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-background w-10 h-10 rounded-full flex items-center justify-center border border-border mb-3">
                <span className="font-medium">1</span>
              </div>
              <h3 className="font-medium mb-2">Receive Your Report</h3>
              <p className="text-sm text-muted-foreground">
                Get a detailed analysis of your cognitive strengths and areas for improvement
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-background w-10 h-10 rounded-full flex items-center justify-center border border-border mb-3">
                <span className="font-medium">2</span>
              </div>
              <h3 className="font-medium mb-2">Personalized Plan</h3>
              <p className="text-sm text-muted-foreground">
                We'll create a customized training program targeting your specific needs
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-background w-10 h-10 rounded-full flex items-center justify-center border border-border mb-3">
                <span className="font-medium">3</span>
              </div>
              <h3 className="font-medium mb-2">Start Training</h3>
              <p className="text-sm text-muted-foreground">
                Begin your cognitive enhancement journey with targeted exercises
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button size="lg">
            Begin Assessment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-sm text-muted-foreground mt-2">Takes approximately 20-25 minutes to complete</p>
        </div>
      </div>
    </div>
  )
}

