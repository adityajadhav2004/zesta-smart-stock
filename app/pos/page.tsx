"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Scan, Plus, Minus, Trash2, CreditCard, Clock, Package, TrendingDown } from "lucide-react"
import { useAppContext } from "@/lib/context/app-context"
import { useRouter } from "next/navigation"

interface CartItem {
  id: string
  name: string
  store: string
  category: string
  price: number
  originalPrice: number
  quantity: number
  daysToExpiry: number
  discount: number
  alerts: {
    expiry: boolean
    stock: boolean
    salesVelocity: boolean
    other: boolean
  }
}

export default function POSPage() {
  const router = useRouter()
  const { products, addSale, datasetUploaded } = useAppContext()
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [transactionCount, setTransactionCount] = useState(47)
  const [dailyRevenue, setDailyRevenue] = useState(1247.83)
  const [itemsSold, setItemsSold] = useState(156)

  useEffect(() => {
    if (!datasetUploaded) {
      router.push("/upload")
    }
  }, [datasetUploaded, router])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.store.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [
        ...prev,
        {
          ...product,
          quantity: 1,
          price: product.currentPrice,
          originalPrice: product.originalPrice,
        },
      ]
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id))
    } else {
      setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
    }
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  const clearCart = () => {
    setCart([])
  }

  const processPayment = () => {
    if (cart.length === 0) return

    // Update sales history
    addSale(cart)

    // Update stats
    setTransactionCount((prev) => prev + 1)
    setDailyRevenue((prev) => prev + total)
    setItemsSold((prev) => prev + cart.reduce((sum, item) => sum + item.quantity, 0))

    alert(`Payment processed! Total: $${total.toFixed(2)}`)
    setCart([])
  }

  const getAlertBadge = (product: any) => {
    if (product.alerts.expiry) {
      return (
        <Badge variant="outline" className="mt-2 bg-red-100 text-red-800 border-red-300 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Expires in {product.daysToExpiry} days
        </Badge>
      )
    }
    
    if (product.alerts.stock) {
      return (
        <Badge variant="outline" className="mt-2 bg-orange-100 text-orange-800 border-orange-300 flex items-center gap-1">
          <Package className="h-3 w-3" />
          High stock: {product.stock} units
        </Badge>
      )
    }
    
    if (product.alerts.salesVelocity) {
      return (
        <Badge variant="outline" className="mt-2 bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1">
          <TrendingDown className="h-3 w-3" />
          Low demand: {product.salesVelocity.toFixed(1)}/day
        </Badge>
      )
    }
    
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">POS Simulation</h1>
            <p className="text-gray-600">Point of Sale with Dynamic Pricing</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Current Time</div>
            <div className="font-mono text-lg">{currentTime.toLocaleTimeString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <Scan className="h-5 w-5" />
                  Product Selection
                </CardTitle>
                <CardDescription>Scan or search for products to add to cart</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                        product.alerts.expiry ? 'border-red-300 bg-red-50' : 
                        product.alerts.stock ? 'border-orange-300 bg-orange-50' :
                        product.alerts.salesVelocity ? 'border-blue-300 bg-blue-50' : ''
                      }`}
                      onClick={() => addToCart(product)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{product.name}</h3>
                          <div className="text-xs text-gray-500">{product.store}</div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {product.category}
                          </Badge>
                        </div>
                        <div className="text-right">
                          {product.discount > 0 && (
                            <div className="text-sm line-through text-gray-500">
                              ${product.originalPrice.toFixed(2)}
                            </div>
                          )}
                          <div className="font-bold text-green-600">${product.currentPrice.toFixed(2)}</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className={`h-4 w-4 ${product.alerts.expiry ? 'text-red-600' : 'text-gray-400'}`} />
                          <span className={product.alerts.expiry ? "text-red-600" : "text-gray-600"}>
                            {product.daysToExpiry} days left
                          </span>
                        </div>
                        <div className={`text-gray-600 ${product.alerts.stock ? 'text-orange-600 font-medium' : ''}`}>
                          Stock: {product.stock}
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {product.discount > 0 && (
                          <Badge 
                            variant="secondary" 
                            className={`${
                              product.discount > 50 ? 'bg-red-100 text-red-800' : 
                              product.discount > 25 ? 'bg-orange-100 text-orange-800' : 
                              'bg-green-100 text-green-800'
                            }`}
                          >
                            -{product.discount.toFixed(0)}% OFF
                          </Badge>
                        )}
                        
                        {getAlertBadge(product)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shopping Cart */}
          <div>
            <Card>
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Shopping Cart
                </CardTitle>
                <CardDescription>
                  {cart.length} item{cart.length !== 1 ? "s" : ""} in cart
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Cart is empty</div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm flex items-center gap-1">
                            {item.name}
                            {item.alerts.expiry && <Clock className="h-3 w-3 text-red-500" />}
                            {item.alerts.stock && <Package className="h-3 w-3 text-orange-500" />}
                            {item.alerts.salesVelocity && <TrendingDown className="h-3 w-3 text-blue-500" />}
                          </div>
                          <div className="text-xs text-gray-500">${item.price.toFixed(2)} each</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => removeFromCart(item.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (8%):</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4">
                      <Button onClick={processPayment} className="w-full bg-blue-600 hover:bg-blue-700">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Process Payment
                      </Button>
                      <Button onClick={clearCart} variant="outline" className="w-full">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Cart
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-sm">Today's Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">\
