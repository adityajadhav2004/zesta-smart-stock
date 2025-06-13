"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingDown, Clock, Package, DollarSign, AlertTriangle, RefreshCw, AlertCircle } from "lucide-react"
import { useAppContext } from "@/lib/context/app-context"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const { products, lastUpdate, refreshData, datasetUploaded, pricingRules } = useAppContext()

  useEffect(() => {
    if (!datasetUploaded) {
      router.push("/upload")
    }
  }, [datasetUploaded, router])

  const urgentItems = products.filter((p) => p.alerts.expiry)
  const highStockItems = products.filter((p) => p.alerts.stock)
  const lowDemandItems = products.filter((p) => p.alerts.salesVelocity)
  const totalAlertItems = products.filter(
    (p) => p.alerts.expiry || p.alerts.stock || p.alerts.salesVelocity || p.alerts.other,
  ).length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Inventory Dashboard</h1>
            <p className="text-gray-600">Real-time dynamic pricing and inventory management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">Last updated: {lastUpdate.toLocaleTimeString()}</div>
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">Active inventory items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alert Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{totalAlertItems}</div>
              <p className="text-xs text-muted-foreground">Items needing attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Price Adjustments</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{products.filter((p) => p.discount > 0).length}</div>
              <p className="text-xs text-muted-foreground">Items with reduced prices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Discount</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(products.reduce((acc, p) => acc + p.discount, 0) / products.length).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Average price reduction</p>
            </CardContent>
          </Card>
        </div>

        {/* Alert Sections */}
        <div className="space-y-8 mb-8">
          {/* Expiry Alerts */}
          {urgentItems.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Expiry Alert: Items Expiring Soon
                </CardTitle>
                <CardDescription className="text-red-700">
                  {urgentItems.length} items need immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {urgentItems.slice(0, 6).map((product) => (
                    <div key={product.id} className="bg-white p-4 rounded-lg border border-red-200">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-600">{product.store}</div>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant="destructive">
                          {product.daysToExpiry} day{product.daysToExpiry !== 1 ? "s" : ""} left
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm line-through text-gray-500">${product.originalPrice.toFixed(2)}</div>
                          <div className="font-bold text-green-600">${product.currentPrice.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stock Alerts */}
          {highStockItems.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Stock Alert: High Inventory Levels
                </CardTitle>
                <CardDescription className="text-orange-700">
                  {highStockItems.length} items with excessive stock
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {highStockItems.slice(0, 6).map((product) => (
                    <div key={product.id} className="bg-white p-4 rounded-lg border border-orange-200">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-600">{product.store}</div>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                          {product.stock} units in stock
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm line-through text-gray-500">${product.originalPrice.toFixed(2)}</div>
                          <div className="font-bold text-green-600">${product.currentPrice.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sales Velocity Alerts */}
          {lowDemandItems.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Demand Alert: Low Sales Velocity
                </CardTitle>
                <CardDescription className="text-blue-700">
                  {lowDemandItems.length} items with slow sales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lowDemandItems.slice(0, 6).map((product) => (
                    <div key={product.id} className="bg-white p-4 rounded-lg border border-blue-200">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-600">{product.store}</div>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                          {product.salesVelocity.toFixed(1)} sales/day
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm line-through text-gray-500">${product.originalPrice.toFixed(2)}</div>
                          <div className="font-bold text-green-600">${product.currentPrice.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Product Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
            <CardDescription>Real-time inventory with dynamic pricing adjustments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-blue-50">
                    <th className="text-left p-2">Product</th>
                    <th className="text-left p-2">Store</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Stock</th>
                    <th className="text-left p-2">Expiry</th>
                    <th className="text-left p-2">Sales</th>
                    <th className="text-left p-2">Original Price</th>
                    <th className="text-left p-2">Current Price</th>
                    <th className="text-left p-2">Discount</th>
                    <th className="text-left p-2">Alerts</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{product.name}</td>
                      <td className="p-2 text-sm">{product.store}</td>
                      <td className="p-2">
                        <Badge variant="outline">{product.category}</Badge>
                      </td>
                      <td className={`p-2 ${product.alerts.stock ? "text-orange-600 font-medium" : ""}`}>
                        {product.stock}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Clock className={`h-4 w-4 ${product.alerts.expiry ? "text-red-600" : "text-gray-400"}`} />
                          <span className={product.alerts.expiry ? "text-red-600 font-medium" : ""}>
                            {product.daysToExpiry} days
                          </span>
                        </div>
                      </td>
                      <td className={`p-2 ${product.alerts.salesVelocity ? "text-blue-600 font-medium" : ""}`}>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={product.salesVelocity * 5}
                            className={`w-16 ${product.alerts.salesVelocity ? "bg-blue-200" : ""}`}
                          />
                          <span className="text-sm">{product.salesVelocity.toFixed(1)}/day</span>
                        </div>
                      </td>
                      <td className="p-2 text-gray-500 line-through">${product.originalPrice.toFixed(2)}</td>
                      <td className="p-2 font-bold text-green-600">${product.currentPrice.toFixed(2)}</td>
                      <td className="p-2">
                        {product.discount > 0 ? (
                          <Badge
                            variant="secondary"
                            className={`${
                              product.discount > 50
                                ? "bg-red-100 text-red-800"
                                : product.discount > 25
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            -{product.discount.toFixed(1)}%
                          </Badge>
                        ) : (
                          <span className="text-gray-400">No change</span>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          {product.alerts.expiry && (
                            <AlertCircle className="h-4 w-4 text-red-500" title="Expiry Alert" />
                          )}
                          {product.alerts.stock && <Package className="h-4 w-4 text-orange-500" title="Stock Alert" />}
                          {product.alerts.salesVelocity && (
                            <TrendingDown className="h-4 w-4 text-blue-500" title="Sales Alert" />
                          )}
                          {product.alerts.other && (
                            <AlertTriangle className="h-4 w-4 text-purple-500" title="Other Alert" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
