"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, TrendingDown, DollarSign, Package, BarChart3, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useAppContext } from "@/lib/context/app-context"

export default function HomePage() {
  const { datasetUploaded, datasetSummary, products } = useAppContext()

  // Calculate real stats from actual data
  const urgentItems = products.filter((p) => p.daysToExpiry <= 2).length
  const itemsWithDiscounts = products.filter((p) => p.discount > 0).length
  const avgDiscount = products.length > 0 ? products.reduce((sum, p) => sum + p.discount, 0) / products.length : 0
  const totalRevenue = products.reduce((sum, p) => sum + (p.originalPrice - p.currentPrice) * p.stock * 0.1, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-700 mb-4">Stock Zesta</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Smart insights for fresh goods - Reduce waste, maximize revenue
          </p>
        </div>

        {!datasetUploaded ? (
          /* No Dataset State */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Dataset Uploaded</h2>
              <p className="text-gray-600 mb-8">
                Upload your inventory dataset to start analyzing fresh goods and enable dynamic pricing.
              </p>
              <Link href="/upload">
                <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Upload className="h-5 w-5" />
                  Upload Dataset
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards - Real Data */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Items at Risk</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{urgentItems}</div>
                  <p className="text-xs text-muted-foreground">Expiring ≤2 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue Impact</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">${totalRevenue.toFixed(0)}</div>
                  <p className="text-xs text-muted-foreground">Potential recovery</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Items Tracked</CardTitle>
                  <Package className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                  <p className="text-xs text-muted-foreground">Total products</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Discount</CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{avgDiscount.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Applied automatically</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Inventory Dashboard
                  </CardTitle>
                  <CardDescription>View real-time inventory and dynamic pricing</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">View Dashboard</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    POS Simulation
                  </CardTitle>
                  <CardDescription>Simulate point-of-sale with dynamic pricing</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/pos">
                    <Button className="w-full" variant="outline">
                      Open POS
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Configure Rules
                  </CardTitle>
                  <CardDescription>Set up dynamic pricing rules and thresholds</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/settings">
                    <Button className="w-full" variant="outline">
                      Settings
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* How It Works */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">How Stock Zesta Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Upload Real Data</h3>
              <p className="text-gray-600">Upload your actual inventory dataset with product and sales information</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Real-time Analysis</h3>
              <p className="text-gray-600">
                AI analyzes your data and automatically adjusts prices based on expiry and demand
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Track Results</h3>
              <p className="text-gray-600">Monitor waste reduction and revenue recovery in real-time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
