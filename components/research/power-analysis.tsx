"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { LineChart } from "@/components/ui/chart"
import { Calculator } from "lucide-react"
import { StudyDesignType, getAdvancedStudyDesignService } from "@/lib/research/advanced-study-design"

export function PowerAnalysis() {
  const [designType, setDesignType] = useState<StudyDesignType>(StudyDesignType.RCT)
  const [effectSize, setEffectSize] = useState(0.5)
  const [alpha, setAlpha] = useState(0.05)
  const [power, setPower] = useState(0.8)
  const [sampleSize, setSampleSize] = useState<number | null>(null)
  const [additionalParams, setAdditionalParams] = useState({
    dropoutRate: 0.1,
    multipleComparisons: false,
    comparisons: 1,
    factors: 2,
  })

  const advancedStudyDesignService = getAdvancedStudyDesignService()

  const calculateSampleSize = () => {
    const calculatedSize = advancedStudyDesignService.calculateSampleSize(
      effectSize,
      alpha,
      power,
      designType,
      additionalParams,
    )
    setSampleSize(calculatedSize)
  }

  // Generate data for power curve
  const generatePowerCurveData = () => {
    const data = []
    for (let n = 10; n <= 200; n += 10) {
      // Simplified power calculation for demonstration
      // In a real implementation, this would use proper statistical formulas
      const calculatedPower = 1 - Math.exp((-effectSize * Math.sqrt(n)) / 2)
      data.push({
        sampleSize: n,
        power: Math.min(calculatedPower, 0.9999),
      })
    }
    return data
  }

  // Generate data for effect size curve
  const generateEffectSizeCurveData = () => {
    const data = []
    for (let es = 0.1; es <= 1.0; es += 0.05) {
      // Calculate sample size for different effect sizes
      const n = advancedStudyDesignService.calculateSampleSize(es, alpha, power, designType, additionalParams)
      data.push({
        effectSize: es.toFixed(2),
        sampleSize: n,
      })
    }
    return data
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Statistical Power Analysis</h2>
        <Button variant="outline" onClick={calculateSampleSize}>
          <Calculator className="mr-2 h-4 w-4" />
          Calculate
        </Button>
      </div>

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calculator">Sample Size Calculator</TabsTrigger>
          <TabsTrigger value="curves">Power Curves</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sample Size Estimation</CardTitle>
              <CardDescription>
                Calculate the required sample size based on effect size, significance level, and desired power
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="design-type">Study Design</Label>
                    <Select value={designType} onValueChange={(value) => setDesignType(value as StudyDesignType)}>
                      <SelectTrigger id="design-type">
                        <SelectValue placeholder="Select study design" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={StudyDesignType.OBSERVATIONAL}>Observational</SelectItem>
                        <SelectItem value={StudyDesignType.CASE_CONTROL}>Case-Control</SelectItem>
                        <SelectItem value={StudyDesignType.COHORT}>Cohort</SelectItem>
                        <SelectItem value={StudyDesignType.RCT}>Randomized Controlled Trial</SelectItem>
                        <SelectItem value={StudyDesignType.CROSSOVER}>Crossover</SelectItem>
                        <SelectItem value={StudyDesignType.FACTORIAL}>Factorial</SelectItem>
                        <SelectItem value={StudyDesignType.ADAPTIVE}>Adaptive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="effect-size">Effect Size (Cohen's d)</Label>
                      <span className="text-sm text-muted-foreground">{effectSize.toFixed(2)}</span>
                    </div>
                    <Slider
                      id="effect-size"
                      min={0.1}
                      max={1.0}
                      step={0.01}
                      value={[effectSize]}
                      onValueChange={(value) => setEffectSize(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Small (0.2)</span>
                      <span>Medium (0.5)</span>
                      <span>Large (0.8)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="alpha">Significance Level (α)</Label>
                      <span className="text-sm text-muted-foreground">{alpha.toFixed(3)}</span>
                    </div>
                    <Slider
                      id="alpha"
                      min={0.01}
                      max={0.1}
                      step={0.001}
                      value={[alpha]}
                      onValueChange={(value) => setAlpha(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.01</span>
                      <span>0.05</span>
                      <span>0.1</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="power">Statistical Power (1-β)</Label>
                      <span className="text-sm text-muted-foreground">{power.toFixed(2)}</span>
                    </div>
                    <Slider
                      id="power"
                      min={0.7}
                      max={0.95}
                      step={0.01}
                      value={[power]}
                      onValueChange={(value) => setPower(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.7</span>
                      <span>0.8</span>
                      <span>0.9</span>
                      <span>0.95</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">Required Sample Size</h3>
                    {sampleSize ? (
                      <>
                        <div className="text-5xl font-bold mb-2">{sampleSize}</div>
                        <p className="text-sm text-muted-foreground">participants needed for {power * 100}% power</p>

                        {additionalParams.dropoutRate > 0 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Includes {(additionalParams.dropoutRate * 100).toFixed(0)}% adjustment for dropout
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-muted-foreground">Click "Calculate" to determine required sample size</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                Based on standard statistical power calculations for {designType.replace("_", " ")}
              </p>
              <Button variant="outline" onClick={calculateSampleSize}>
                Recalculate
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="curves" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Power Curve</CardTitle>
                <CardDescription>Statistical power as a function of sample size</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <LineChart
                    data={generatePowerCurveData()}
                    index="sampleSize"
                    categories={["power"]}
                    colors={["blue"]}
                    valueFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                    yAxisWidth={60}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Effect size: {effectSize.toFixed(2)}, α: {alpha.toFixed(3)}
                </p>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Effect Size Impact</CardTitle>
                <CardDescription>Required sample size as a function of effect size</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <LineChart
                    data={generateEffectSizeCurveData()}
                    index="effectSize"
                    categories={["sampleSize"]}
                    colors={["green"]}
                    valueFormatter={(value) => `${Math.round(value)}`}
                    yAxisWidth={60}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Power: {power.toFixed(2)}, α: {alpha.toFixed(3)}
                </p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Parameters</CardTitle>
              <CardDescription>
                Configure additional parameters for more accurate sample size estimation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="dropout-rate">Expected Dropout Rate</Label>
                      <span className="text-sm text-muted-foreground">
                        {(additionalParams.dropoutRate * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Slider
                      id="dropout-rate"
                      min={0}
                      max={0.5}
                      step={0.01}
                      value={[additionalParams.dropoutRate]}
                      onValueChange={(value) =>
                        setAdditionalParams({
                          ...additionalParams,
                          dropoutRate: value[0],
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="multiple-comparisons">Multiple Comparisons</Label>
                    <Select
                      value={additionalParams.multipleComparisons ? "true" : "false"}
                      onValueChange={(value) =>
                        setAdditionalParams({
                          ...additionalParams,
                          multipleComparisons: value === "true",
                        })
                      }
                    >
                      <SelectTrigger id="multiple-comparisons">
                        <SelectValue placeholder="Multiple comparisons adjustment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">No adjustment</SelectItem>
                        <SelectItem value="true">Bonferroni correction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {additionalParams.multipleComparisons && (
                    <div className="space-y-2">
                      <Label htmlFor="comparisons">Number of Comparisons</Label>
                      <Input
                        id="comparisons"
                        type="number"
                        min={1}
                        value={additionalParams.comparisons}
                        onChange={(e) =>
                          setAdditionalParams({
                            ...additionalParams,
                            comparisons: Number.parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {designType === StudyDesignType.FACTORIAL && (
                    <div className="space-y-2">
                      <Label htmlFor="factors">Number of Factors</Label>
                      <Input
                        id="factors"
                        type="number"
                        min={2}
                        max={4}
                        value={additionalParams.factors}
                        onChange={(e) =>
                          setAdditionalParams({
                            ...additionalParams,
                            factors: Number.parseInt(e.target.value) || 2,
                          })
                        }
                      />
                    </div>
                  )}

                  <div className="p-4 border rounded-md bg-muted/50">
                    <h4 className="font-medium mb-2">Design-Specific Considerations</h4>
                    <p className="text-sm text-muted-foreground">
                      {designType === StudyDesignType.RCT &&
                        "For RCTs, consider allocation ratio and stratification factors."}
                      {designType === StudyDesignType.CROSSOVER &&
                        "Crossover designs require fewer participants but must account for period effects and carryover."}
                      {designType === StudyDesignType.FACTORIAL &&
                        "Factorial designs test multiple interventions simultaneously but require analysis of interaction effects."}
                      {designType === StudyDesignType.ADAPTIVE &&
                        "Adaptive designs allow modifications based on interim results but require specialized statistical methods."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={calculateSampleSize}>Apply and Calculate</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

