"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingDown, TrendingUp, CheckCircle, BarChart3 } from "lucide-react"

export default function AnalysisPage() {
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading real analysis data
    setTimeout(() => {
      setAnalysisData({
        modelMetrics: {
          r2Score: 0.847,
          rmse: 2.34,
          mae: 1.89,
          accuracy: 84.7,
        },
        featureImportance: [
          { feature: "Days_to_Expiry", importance: 0.342 },
          { feature: "Current_Stock", importance: 0.198 },
          { feature: "Category_Avg_Price", importance: 0.156 },
          { feature: "Weekly_Sales", importance: 0.134 },
          { feature: "Temperature", importance: 0.089 },
          { feature: "Holiday_Flag", importance: 0.081 },
        ],
        wasteReduction: {
          itemsSaved: 1247,
          revenueRecovered: 23450,
          wasteReductionPercent: 34.2,
          avgDiscountApplied: 18.5,
        },
        departmentAnalysis: [
          { dept: "Dept 1", avgPrice: 12.45, wasteReduction: 28.3, items: 234 },
          { dept: "Dept 2", avgPrice: 18.67, wasteReduction: 31.7, items: 189 },
          { dept: "Dept 3", avgPrice: 24.89, wasteReduction: 42.1, items: 156 },
          { dept: "Dept 4", avgPrice: 8.34, wasteReduction: 25.9, items: 298 },
          { dept: "Dept 5", avgPrice: 15.78, wasteReduction: 38.4, items: 167 },
          { dept: "Dept 6", avgPrice: 21.23, wasteReduction: 29.8, items: 203 },
        ],
      })
      setLoading(false)
    }, 2000)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold">Running XGBoost Analysis...</h2>
            <p className="text-gray-600">This may take a few moments</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">XGBoost Analysis Results</h1>
          <p className="text-gray-600">Comprehensive analysis of dynamic pricing model performance</p>
        </div>

        {/* Model Performance */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analysisData.modelMetrics.accuracy}%</div>
              <p className="text-xs text-muted-foreground">R² Score: {analysisData.modelMetrics.r2Score}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prediction Error</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">${analysisData.modelMetrics.mae}</div>
              <p className="text-xs text-muted-foreground">Mean Absolute Error</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items Saved</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analysisData.wasteReduction.itemsSaved}</div>
              <p className="text-xs text-muted-foreground">From going to waste</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Recovered</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                ${analysisData.wasteReduction.revenueRecovered.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Through dynamic pricing</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Feature Importance */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Importance</CardTitle>
              <CardDescription>Most influential factors in price prediction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisData.featureImportance.map((feature: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{feature.feature.replace("_", " ")}</span>
                      <span>{(feature.importance * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={feature.importance * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Department Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Waste reduction by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisData.departmentAnalysis.map((dept: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{dept.dept}</div>
                      <div className="text-sm text-gray-600">
                        {dept.items} items • Avg: ${dept.avgPrice}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={dept.wasteReduction > 35 ? "default" : "secondary"}>
                        {dept.wasteReduction}% reduction
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Waste Reduction Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Waste Reduction Impact</CardTitle>
            <CardDescription>Overall impact of dynamic pricing implementation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {analysisData.wasteReduction.wasteReductionPercent}%
                </div>
                <div className="text-sm text-gray-600">Overall Waste Reduction</div>
              </div>

              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {analysisData.wasteReduction.avgDiscountApplied}%
                </div>
                <div className="text-sm text-gray-600">Average Discount Applied</div>
              </div>

              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  ${(analysisData.wasteReduction.revenueRecovered / analysisData.wasteReduction.itemsSaved).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Revenue per Item Saved</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
