"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/components/i18n-provider"
import { Loader2, Plus, Trash, Edit, RefreshCw } from "lucide-react"
import type { FeatureFlag } from "@/lib/features/feature-flags"

export default function FeatureFlagsPage() {
  const { formatMessage } = useI18n()
  const router = useRouter()

  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false)
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState<boolean>(false)
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null)

  const [newFlag, setNewFlag] = useState({
    name: "",
    description: "",
    enabled: true,
    percentage: 100,
  })

  const [newRule, setNewRule] = useState({
    attribute: "userId",
    operator: "equals",
    value: "",
  })

  useEffect(() => {
    fetchFeatureFlags()
  }, [])

  const fetchFeatureFlags = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/features")

      if (!response.ok) {
        throw new Error("Failed to fetch feature flags")
      }

      const data = await response.json()
      setFeatureFlags(data)
    } catch (err) {
      console.error("Error fetching feature flags:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddFeatureFlag = async () => {
    try {
      const response = await fetch("/api/admin/features", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFlag),
      })

      if (!response.ok) {
        throw new Error("Failed to add feature flag")
      }

      // Reset form and close dialog
      setNewFlag({
        name: "",
        description: "",
        enabled: true,
        percentage: 100,
      })
      setIsAddDialogOpen(false)

      // Refresh feature flags
      fetchFeatureFlags()
    } catch (err) {
      console.error("Error adding feature flag:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    }
  }

  const handleUpdateFeatureFlag = async () => {
    if (!selectedFlag) return

    try {
      const response = await fetch(`/api/admin/features/${selectedFlag.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedFlag),
      })

      if (!response.ok) {
        throw new Error("Failed to update feature flag")
      }

      // Close dialog and refresh
      setIsEditDialogOpen(false)
      fetchFeatureFlags()
    } catch (err) {
      console.error("Error updating feature flag:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    }
  }

  const handleDeleteFeatureFlag = async (flagId: string) => {
    if (!confirm(formatMessage("admin.features.confirmDelete"))) {
      return
    }

    try {
      const response = await fetch(`/api/admin/features/${flagId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete feature flag")
      }

      // Refresh feature flags
      fetchFeatureFlags()
    } catch (err) {
      console.error("Error deleting feature flag:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    }
  }

  const handleAddRule = async () => {
    if (!selectedFlag) return

    try {
      const response = await fetch(`/api/admin/features/${selectedFlag.id}/rules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRule),
      })

      if (!response.ok) {
        throw new Error("Failed to add rule")
      }

      // Reset form and close dialog
      setNewRule({
        attribute: "userId",
        operator: "equals",
        value: "",
      })
      setIsRuleDialogOpen(false)

      // Refresh feature flags
      fetchFeatureFlags()
    } catch (err) {
      console.error("Error adding rule:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    }
  }

  const handleDeleteRule = async (flagId: string, ruleId: string) => {
    if (!confirm(formatMessage("admin.features.confirmDeleteRule"))) {
      return
    }

    try {
      const response = await fetch(`/api/admin/features/${flagId}/rules/${ruleId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete rule")
      }

      // Refresh feature flags
      fetchFeatureFlags()
    } catch (err) {
      console.error("Error deleting rule:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    }
  }

  const handleToggleFeatureFlag = async (flag: FeatureFlag, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/features/${flag.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled }),
      })

      if (!response.ok) {
        throw new Error("Failed to update feature flag")
      }

      // Update local state
      setFeatureFlags((prev) => prev.map((f) => (f.id === flag.id ? { ...f, enabled } : f)))
    } catch (err) {
      console.error("Error toggling feature flag:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    }
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{formatMessage("admin.features.errorTitle")}</CardTitle>
            <CardDescription>{formatMessage("admin.features.errorDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
            <Button onClick={fetchFeatureFlags} className="mt-4">
              {formatMessage("common.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{formatMessage("admin.features.title")}</h1>
          <p className="text-gray-500">{formatMessage("admin.features.description")}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchFeatureFlags} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            {formatMessage("common.refresh")}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {formatMessage("admin.features.addFeature")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{formatMessage("admin.features.addFeature")}</DialogTitle>
                <DialogDescription>{formatMessage("admin.features.addFeatureDescription")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{formatMessage("admin.features.name")}</Label>
                  <Input
                    id="name"
                    value={newFlag.name}
                    onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })}
                    placeholder={formatMessage("admin.features.namePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{formatMessage("admin.features.description")}</Label>
                  <Textarea
                    id="description"
                    value={newFlag.description}
                    onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                    placeholder={formatMessage("admin.features.descriptionPlaceholder")}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enabled"
                    checked={newFlag.enabled}
                    onCheckedChange={(checked) => setNewFlag({ ...newFlag, enabled: checked })}
                  />
                  <Label htmlFor="enabled">{formatMessage("admin.features.enabled")}</Label>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="percentage">{formatMessage("admin.features.percentage")}</Label>
                    <span>{newFlag.percentage}%</span>
                  </div>
                  <Slider
                    id="percentage"
                    min={0}
                    max={100}
                    step={1}
                    value={[newFlag.percentage]}
                    onValueChange={(value) => setNewFlag({ ...newFlag, percentage: value[0] })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {formatMessage("common.cancel")}
                </Button>
                <Button onClick={handleAddFeatureFlag}>{formatMessage("common.save")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : featureFlags.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-gray-500 mb-4">{formatMessage("admin.features.noFeatures")}</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {formatMessage("admin.features.addFeature")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {featureFlags.map((flag) => (
            <Card key={flag.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      {flag.name}
                      <span
                        className={`ml-2 text-xs px-2 py-1 rounded-full ${flag.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {flag.enabled
                          ? formatMessage("admin.features.enabled")
                          : formatMessage("admin.features.disabled")}
                      </span>
                    </CardTitle>
                    <CardDescription>{flag.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFlag(flag)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteFeatureFlag(flag.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details">
                  <TabsList>
                    <TabsTrigger value="details">{formatMessage("admin.features.details")}</TabsTrigger>
                    <TabsTrigger value="rules">{formatMessage("admin.features.rules")}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">{formatMessage("admin.features.status")}</h3>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`toggle-${flag.id}`}
                            checked={flag.enabled}
                            onCheckedChange={(checked) => handleToggleFeatureFlag(flag, checked)}
                          />
                          <Label htmlFor={`toggle-${flag.id}`}>
                            {flag.enabled
                              ? formatMessage("admin.features.enabled")
                              : formatMessage("admin.features.disabled")}
                          </Label>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-2">{formatMessage("admin.features.rollout")}</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{formatMessage("admin.features.percentage")}</span>
                            <span>{flag.percentage}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${flag.percentage}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">{formatMessage("admin.features.metadata")}</h3>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-gray-500">{formatMessage("admin.features.id")}:</span> {flag.id}
                          </div>
                          <div>
                            <span className="text-gray-500">{formatMessage("admin.features.created")}:</span>{" "}
                            {new Date(flag.createdAt).toLocaleString()}
                          </div>
                          <div>
                            <span className="text-gray-500">{formatMessage("admin.features.updated")}:</span>{" "}
                            {new Date(flag.updatedAt).toLocaleString()}
                          </div>
                          <div>
                            <span className="text-gray-500">{formatMessage("admin.features.ruleCount")}:</span>{" "}
                            {flag.rules.length}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="rules" className="pt-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium">{formatMessage("admin.features.targetingRules")}</h3>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedFlag(flag)
                            setIsRuleDialogOpen(true)
                          }}
                        >
                          <Plus className="mr-2 h-3 w-3" />
                          {formatMessage("admin.features.addRule")}
                        </Button>
                      </div>
                      {flag.rules.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>{formatMessage("admin.features.noRules")}</p>
                          <p className="text-sm">{formatMessage("admin.features.noRulesDescription")}</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{formatMessage("admin.features.attribute")}</TableHead>
                              <TableHead>{formatMessage("admin.features.operator")}</TableHead>
                              <TableHead>{formatMessage("admin.features.value")}</TableHead>
                              <TableHead className="text-right">{formatMessage("common.actions")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {flag.rules.map((rule) => (
                              <TableRow key={rule.id}>
                                <TableCell>{rule.attribute}</TableCell>
                                <TableCell>{formatOperator(rule.operator)}</TableCell>
                                <TableCell>{rule.value}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteRule(flag.id, rule.id)}>
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Feature Flag Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formatMessage("admin.features.editFeature")}</DialogTitle>
            <DialogDescription>{formatMessage("admin.features.editFeatureDescription")}</DialogDescription>
          </DialogHeader>
          {selectedFlag && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">{formatMessage("admin.features.name")}</Label>
                <Input
                  id="edit-name"
                  value={selectedFlag.name}
                  onChange={(e) => setSelectedFlag({ ...selectedFlag, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">{formatMessage("admin.features.description")}</Label>
                <Textarea
                  id="edit-description"
                  value={selectedFlag.description}
                  onChange={(e) => setSelectedFlag({ ...selectedFlag, description: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-enabled"
                  checked={selectedFlag.enabled}
                  onCheckedChange={(checked) => setSelectedFlag({ ...selectedFlag, enabled: checked })}
                />
                <Label htmlFor="edit-enabled">{formatMessage("admin.features.enabled")}</Label>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="edit-percentage">{formatMessage("admin.features.percentage")}</Label>
                  <span>{selectedFlag.percentage}%</span>
                </div>
                <Slider
                  id="edit-percentage"
                  min={0}
                  max={100}
                  step={1}
                  value={[selectedFlag.percentage]}
                  onValueChange={(value) => setSelectedFlag({ ...selectedFlag, percentage: value[0] })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {formatMessage("common.cancel")}
            </Button>
            <Button onClick={handleUpdateFeatureFlag}>{formatMessage("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Rule Dialog */}
      <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formatMessage("admin.features.addRule")}</DialogTitle>
            <DialogDescription>{formatMessage("admin.features.addRuleDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rule-attribute">{formatMessage("admin.features.attribute")}</Label>
              <Select value={newRule.attribute} onValueChange={(value) => setNewRule({ ...newRule, attribute: value })}>
                <SelectTrigger id="rule-attribute">
                  <SelectValue placeholder={formatMessage("admin.features.selectAttribute")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="userId">{formatMessage("admin.features.attributes.userId")}</SelectItem>
                  <SelectItem value="role">{formatMessage("admin.features.attributes.role")}</SelectItem>
                  <SelectItem value="country">{formatMessage("admin.features.attributes.country")}</SelectItem>
                  <SelectItem value="deviceType">{formatMessage("admin.features.attributes.deviceType")}</SelectItem>
                  <SelectItem value="appVersion">{formatMessage("admin.features.attributes.appVersion")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rule-operator">{formatMessage("admin.features.operator")}</Label>
              <Select
                value={newRule.operator}
                onValueChange={(value: any) => setNewRule({ ...newRule, operator: value })}
              >
                <SelectTrigger id="rule-operator">
                  <SelectValue placeholder={formatMessage("admin.features.selectOperator")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">{formatMessage("admin.features.operators.equals")}</SelectItem>
                  <SelectItem value="not_equals">{formatMessage("admin.features.operators.notEquals")}</SelectItem>
                  <SelectItem value="contains">{formatMessage("admin.features.operators.contains")}</SelectItem>
                  <SelectItem value="not_contains">{formatMessage("admin.features.operators.notContains")}</SelectItem>
                  <SelectItem value="in">{formatMessage("admin.features.operators.in")}</SelectItem>
                  <SelectItem value="not_in">{formatMessage("admin.features.operators.notIn")}</SelectItem>
                  <SelectItem value="greater_than">{formatMessage("admin.features.operators.greaterThan")}</SelectItem>
                  <SelectItem value="less_than">{formatMessage("admin.features.operators.lessThan")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rule-value">{formatMessage("admin.features.value")}</Label>
              <Input
                id="rule-value"
                value={newRule.value}
                onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                placeholder={formatMessage("admin.features.valuePlaceholder")}
              />
              {(newRule.operator === "in" || newRule.operator === "not_in") && (
                <p className="text-xs text-gray-500">{formatMessage("admin.features.valueHint")}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRuleDialogOpen(false)}>
              {formatMessage("common.cancel")}
            </Button>
            <Button onClick={handleAddRule}>{formatMessage("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper function to format operator for display
function formatOperator(operator: string): string {
  switch (operator) {
    case "equals":
      return "equals"
    case "not_equals":
      return "not equals"
    case "contains":
      return "contains"
    case "not_contains":
      return "not contains"
    case "in":
      return "in"
    case "not_in":
      return "not in"
    case "greater_than":
      return "greater than"
    case "less_than":
      return "less than"
    default:
      return operator
  }
}

