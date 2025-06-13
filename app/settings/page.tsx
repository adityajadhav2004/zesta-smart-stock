"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useAppContext } from "@/lib/context/app-context"
import { useRouter } from "next/navigation"
import { Trash2, Plus, Save, ArrowUpDown, AlertCircle, Package, TrendingDown, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RuleCondition {
  parameter: string
  operator: string
  value: number
}

interface PricingRule {
  id: string
  name: string
  conditions: RuleCondition[]
  discount: number
  priority: number
  isActive: boolean
  alertType: "expiry" | "stock" | "salesVelocity" | "other"
  alertThreshold: number
}

export default function SettingsPage() {
  const router = useRouter()
  const { pricingRules, updateRule, deleteRule, addRule, refreshData, datasetUploaded } = useAppContext()
  const [editedRules, setEditedRules] = useState<PricingRule[]>([])
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    setEditedRules([...pricingRules])
  }, [pricingRules])

  const parameters = [
    { value: "daysToExpiry", label: "Days to Expiry" },
    { value: "stock", label: "Stock Level" },
    { value: "salesVelocity", label: "Sales Velocity" },
    { value: "originalPrice", label: "Original Price" },
    { value: "currentPrice", label: "Current Price" }
  ]

  const operators = [
    { value: "==", label: "Equal to (==)" },
    { value: "!=", label: "Not equal to (!=)" },
    { value: ">", label: "Greater than (>)" },
    { value: ">=", label: "Greater than or equal to (>=)" },
    { value: "<", label: "Less than (<)" },
    { value: "<=", label: "Less than or equal to (<=)" }
  ]

  const alertTypes = [
    { value: "expiry", label: "Expiry Alert", icon: <Clock className="h-4 w-4 text-red-500" /> },
    { value: "stock", label: "Stock Alert", icon: <Package className="h-4 w-4 text-orange-500" /> },
    { value: "salesVelocity", label: "Sales Velocity Alert", icon: <TrendingDown className="h-4 w-4 text-blue-500" /> },
    { value: "other", label: "Other Alert", icon: <AlertCircle className="h-4 w-4 text-purple-500" /> }
  ]

  const addNewRule = () => {
    const newRule: PricingRule = {
      id: `rule-${Date.now()}`,
      name: "New Rule",
      conditions: [{ parameter: "daysToExpiry", operator: "<=", value: 5 }],
      discount: 10,
      priority: editedRules.length + 1,
      isActive: true,
      alertType: "other",
      alertThreshold: 5
    }
    
    setEditedRules([...editedRules, newRule])
  }

  const updateRuleField = (index: number, field: string, value: any) => {
    const updatedRules = [...editedRules]
    updatedRules[index] = { ...updatedRules[index], [field]: value }
    setEditedRules(updatedRules)
  }

  const updateCondition = (ruleIndex: number, conditionIndex: number, field: string, value: any) => {
    const updatedRules = [...editedRules]
    updatedRules[ruleIndex].conditions[conditionIndex] = { 
      ...updatedRules[ruleIndex].conditions[conditionIndex], 
      [field]: value 
    }
    setEditedRules(updatedRules)
  }

  const addCondition = (ruleIndex: number) => {
    const updatedRules = [...editedRules]
    updatedRules[ruleIndex].conditions.push({ 
      parameter: "daysToExpiry", 
      operator: "<=", 
      value: 5 
    })
    setEditedRules(updatedRules)
  }

  const removeCondition = (ruleIndex: number, conditionIndex: number) => {
    const updatedRules = [...editedRules]
    if (updatedRules[ruleIndex].conditions.length > 1) {
      updatedRules[ruleIndex].conditions.splice(conditionIndex, 1)
      setEditedRules(updatedRules)
    }
  }

  const removeRule = (index: number) => {
    const updatedRules = [...editedRules]
    updatedRules.splice(index, 1)

    // Update priorities
    updatedRules.forEach((rule, idx) => {
      rule.priority = idx + 1
    })

    setEditedRules(updatedRules)
  }

  const moveRuleUp = (index: number) => {
    if (index === 0) return

    const updatedRules = [...editedRules]
    const temp = updatedRules[index]
    updatedRules[index] = updatedRules[index - 1]
    updatedRules[index - 1] = temp

    // Update priorities
    updatedRules.forEach((rule, idx) => {
      rule.priority = idx + 1
    })

    setEditedRules(updatedRules)
  }

  const moveRuleDown = (index: number) => {
    if (index === editedRules.length - 1) return

    const updatedRules = [...editedRules]
    const temp = updatedRules[index]
    updatedRules[index] = updatedRules[index + 1]
    updatedRules[index + 1] = temp

    // Update priorities
    updatedRules.forEach((rule, idx) => {
      rule.priority = idx + 1
    })

    setEditedRules(updatedRules)
  }

  const saveRules = () => {
    // Update all rules
    editedRules.forEach(rule => {
      updateRule(rule)
    })
    
    // Delete rules that were removed
    pricingRules.forEach(oldRule => {
      if (!editedRules.find(rule => rule.id === oldRule.id)) {
        deleteRule(oldRule.id)
      }
    })
    
    refreshData()
    alert("Pricing rules saved successfully!")
  }

  const previewChanges = () => {
    setShowPreview(!showPreview)
  }

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case "expiry": return <Clock className="h-4 w-4 text-red-500" />
      case "stock": return <Package className="h-4 w-4 text-orange-500" />
      case "salesVelocity": return <TrendingDown className="h-4 w-4 text-blue-500" />
      default: return <AlertCircle className="h-4 w-4 text-purple-500" />
    }
  }

  const getConditionDescription = (condition: RuleCondition) => {
    const paramLabel = parameters.find(p => p.value === condition.parameter)?.label || condition.parameter
    const opLabel = operators.find(o => o.value === condition.operator)?.label || condition.operator
    
    return `${paramLabel} ${opLabel} ${condition.value}`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dynamic Pricing Rules</h1>
          <p className="text-gray-600">Configure rules to automatically adjust prices based on inventory conditions</p>
        </div>

        <div className="flex justify-between mb-6">
          <Button onClick={addNewRule} className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Rule
          </Button>
          <div className="space-x-2">
            <Button onClick={previewChanges} variant="outline">
              {showPreview ? "Hide Preview" : "Preview Rules"}
            </Button>
            <Button onClick={saveRules} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4" />
              Save All Rules
            </Button>
          </div>
        </div>

        {showPreview && (
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle>Rules Preview</CardTitle>
              <CardDescription>How your rules will be applied (in priority order)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {editedRules.filter(r => r.isActive).map((rule, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-md border">
                    <Badge variant="outline" className="bg-gray-100">
                      {index + 1}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium">{rule.name}</div>
                      <div className="text-sm text-gray-500">
                        {rule.conditions.map((c, i) => (
                          <span key={i}>
                            {i > 0 && " AND "} 
                            {getConditionDescription(c)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getAlertIcon(rule.alertType)}
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        {rule.discount}% discount
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {editedRules.filter(r => r.isActive).length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No active rules. Prices will not be adjusted.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {editedRules.map((rule, ruleIndex) => (
            <Card key={rule.id} className={!rule.isActive ? "opacity-70" : ""}>
              <CardHeader className="bg-gray-50 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getAlertIcon(rule.alertType)}
                    <Input 
                      value={rule.name} 
                      onChange={(e) => updateRuleField(ruleIndex, "name", e.target.value)}
                      className="h-7 text-lg font-bold bg-transparent border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </CardTitle>
                  <CardDescription>Priority: {rule.priority}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 mr-4">
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={(checked) => updateRuleField(ruleIndex, "isActive", checked)}
                    />
                    <span className={rule.isActive ? "text-green-600 font-medium" : "text-gray-400"}>
                      {rule.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => moveRuleUp(ruleIndex)} disabled={ruleIndex === 0}>
                    <ArrowUpDown className="h-4 w-4 rotate-90" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveRuleDown(ruleIndex)}
                    disabled={ruleIndex === editedRules.length - 1}
                  >
                    <ArrowUpDown className="h-4 w-4 -rotate-90" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeRule(ruleIndex)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Conditions */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Rule Conditions (All conditions must be met)</h3>
                    <div className="space-y-3">
                      {rule.conditions.map((condition, conditionIndex) => (
                        <div key={conditionIndex} className="flex items-center gap-2">
                          <Select 
                            value={condition.parameter}
                            onValueChange={(value) => updateCondition(ruleIndex, conditionIndex, "parameter", value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Parameter" />
                            </SelectTrigger>
                            <SelectContent>
                              {parameters.map(param => (
                                <SelectItem key={param.value} value={param.value}>
                                  {param.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Select 
                            value={condition.operator}
                            onValueChange={(value) => updateCondition(ruleIndex, conditionIndex, "operator", value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Operator" />
                            </SelectTrigger>
                            <SelectContent>
                              {operators.map(op => (
                                <SelectItem key={op.value} value={op.value}>
                                  {op.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Input 
                            type="number"
                            value={condition.value}
                            onChange={(e) => updateCondition(
                              ruleIndex, 
                              conditionIndex, 
                              "value", 
                              Number.parseFloat(e.target.value) || 0
                            )}
                            className="w-24"
                          />
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeCondition(ruleIndex, conditionIndex)}
                            disabled={rule.conditions.length <= 1}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addCondition(ruleIndex)}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Condition
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Alert Type */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Alert Type</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {alertTypes.map(type => (
                        <div 
                          key={type.value}
                          className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer hover:bg-gray-50 ${
                            rule.alertType === type.value ? 'bg-blue-50 border-blue-300' : ''
                          }`}
                          onClick={() => updateRuleField(ruleIndex, "alertType", type.value)}
                        >
                          {type.icon}
                          <span>{type.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Discount */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <h3 className="text-sm font-medium">Discount Percentage</h3>
                      <span className="font-medium">{rule.discount}%</span>
                    </div>
                    <Slider
                      min={0}
                      max={70}
                      step={1}
                      value={[rule.discount]}
                      onValueChange={(value) => updateRuleField(ruleIndex, "discount", value[0])}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {editedRules.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Rules Defined</h3>
            <p className="text-gray-600 mb-4">
              Create your first rule to start applying dynamic pricing to your inventory.
            </p>
            <Button onClick={addNewRule}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Rule
            </Button>
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <Button onClick={saveRules} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4" />
            Save All Rules
          </Button>
        </div>
      </div>
    </div>
  )
}
