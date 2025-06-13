"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface RuleCondition {
  parameter: string
  operator: string
  value: number
}

interface Product {
  id: string
  name: string
  store: string
  category: string
  stock: number
  daysToExpiry: number
  originalPrice: number
  currentPrice: number
  discount: number
  salesVelocity: number
  alerts: {
    expiry: boolean
    stock: boolean
    salesVelocity: boolean
    other: boolean
  }
  matchedRules: string[]
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

interface AppContextType {
  products: Product[]
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
  rawDataset: any[]
  setRawDataset: React.Dispatch<React.SetStateAction<any[]>>
  pricingRules: PricingRule[]
  setPricingRules: React.Dispatch<React.SetStateAction<PricingRule[]>>
  datasetUploaded: boolean
  setDatasetUploaded: React.Dispatch<React.SetStateAction<boolean>>
  datasetSummary: any
  setDatasetSummary: React.Dispatch<React.SetStateAction<any>>
  lastUpdate: Date
  refreshData: () => void
  applyPricingRules: (product: Product) => Product
  salesHistory: any[]
  addSale: (items: any[]) => void
  processRealDataset: (csvData: string) => void
  updateRule: (rule: PricingRule) => void
  deleteRule: (ruleId: string) => void
  addRule: (rule: PricingRule) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [rawDataset, setRawDataset] = useState<any[]>([])
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([
    {
      id: "rule-1",
      name: "Critical Expiry",
      conditions: [{ parameter: "daysToExpiry", operator: "<=", value: 1 }],
      discount: 50,
      priority: 1,
      isActive: true,
      alertType: "expiry",
      alertThreshold: 1,
    },
    {
      id: "rule-2",
      name: "Near Expiry",
      conditions: [{ parameter: "daysToExpiry", operator: "<=", value: 3 }],
      discount: 25,
      priority: 2,
      isActive: true,
      alertType: "expiry",
      alertThreshold: 3,
    },
    {
      id: "rule-3",
      name: "High Stock",
      conditions: [{ parameter: "stock", operator: ">", value: 150 }],
      discount: 15,
      priority: 3,
      isActive: true,
      alertType: "stock",
      alertThreshold: 150,
    },
    {
      id: "rule-4",
      name: "Low Demand",
      conditions: [{ parameter: "salesVelocity", operator: "<", value: 5 }],
      discount: 10,
      priority: 4,
      isActive: true,
      alertType: "salesVelocity",
      alertThreshold: 5,
    },
  ])
  const [datasetUploaded, setDatasetUploaded] = useState(false)
  const [datasetSummary, setDatasetSummary] = useState<any>(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [salesHistory, setSalesHistory] = useState<any[]>([])

  // Only update products when we have real data and rules change
  useEffect(() => {
    if (!datasetUploaded || rawDataset.length === 0) {
      setProducts([])
      return
    }

    generateProductsFromRealData()

    // Update every 30 seconds with real-time simulation
    const interval = setInterval(() => {
      generateProductsFromRealData()
      setLastUpdate(new Date())
    }, 30000)

    return () => clearInterval(interval)
  }, [datasetUploaded, rawDataset, pricingRules])

  const processRealDataset = (csvData: string) => {
    try {
      // Parse CSV data
      const lines = csvData.trim().split("\n")
      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

      const data = lines.slice(1).map((line, index) => {
        // Handle quoted values with commas inside them
        const values: string[] = []
        let inQuotes = false
        let currentValue = ""

        for (let i = 0; i < line.length; i++) {
          const char = line[i]

          if (char === '"' && (i === 0 || line[i - 1] !== "\\")) {
            inQuotes = !inQuotes
          } else if (char === "," && !inQuotes) {
            values.push(currentValue.trim().replace(/"/g, ""))
            currentValue = ""
          } else {
            currentValue += char
          }
        }

        // Add the last value
        values.push(currentValue.trim().replace(/"/g, ""))

        const row: any = {}

        headers.forEach((header, i) => {
          let value = values[i] || ""

          // Convert numeric fields
          if (["Stock", "Expiry (Days Left)", "Original Price", "Current Price", "Sales Velocity"].includes(header)) {
            value = Number.parseFloat(value) || 0
          }

          row[header] = value
        })

        // Calculate discount percentage if not provided
        if (!row["Discount"] && row["Original Price"] && row["Current Price"]) {
          const originalPrice = Number(row["Original Price"])
          const currentPrice = Number(row["Current Price"])

          if (originalPrice > 0 && currentPrice < originalPrice) {
            row["Discount"] = ((originalPrice - currentPrice) / originalPrice) * 100
          } else {
            row["Discount"] = 0
          }
        }

        row.id = `item-${index + 1}`
        return row
      })

      console.log("Processed dataset:", data.length, "items")
      setRawDataset(data)

      // Generate summary
      const summary = {
        totalItems: data.length,
        perishableItems: data.length,
        nearExpiry: data.filter((item) => item["Expiry (Days Left)"] <= 2).length,
        averageShelfLife: data.reduce((sum, item) => sum + (item["Expiry (Days Left)"] || 0), 0) / data.length,
        categories: [...new Set(data.map((item) => item.Category))],
        stores: [...new Set(data.map((item) => item.Store))],
        avgPrice: data.reduce((sum, item) => sum + (item["Original Price"] || 0), 0) / data.length,
        priceRange: [
          Math.min(...data.map((item) => item["Original Price"] || 0)),
          Math.max(...data.map((item) => item["Original Price"] || 0)),
        ],
        storeCount: [...new Set(data.map((item) => item.Store))].length,
        categoryCount: [...new Set(data.map((item) => item.Category))].length,
      }

      setDatasetSummary(summary)
      setDatasetUploaded(true)

      return summary
    } catch (error) {
      console.error("Error processing dataset:", error)
      throw new Error("Failed to process dataset")
    }
  }

  const generateProductsFromRealData = () => {
    if (rawDataset.length === 0) return

    const products = rawDataset.map((item, index) => {
      // Add some real-time variation to simulate changing conditions
      const timeVariation = Math.sin(Date.now() / 100000 + index) * 0.1 + 1 // ±10% variation
      const currentStock = Math.max(1, Math.floor((item.Stock || 50) * timeVariation))
      const daysToExpiry = Math.max(1, Math.floor((item["Expiry (Days Left)"] || 7) * timeVariation))
      const salesVelocity = Math.max(0.1, (item["Sales Velocity"] || 10) * timeVariation)

      // Get original and current prices
      const originalPrice = item["Original Price"] || 10
      const initialCurrentPrice = item["Current Price"] || originalPrice

      // Calculate initial discount
      let initialDiscount = 0
      if (originalPrice > 0 && initialCurrentPrice < originalPrice) {
        initialDiscount = ((originalPrice - initialCurrentPrice) / originalPrice) * 100
      }

      const baseProduct: Product = {
        id: item.id || `prod-${index + 1}`,
        name: item.Product || `Product ${index + 1}`,
        store: item.Store || "Unknown Store",
        category: item.Category || "Unknown Category",
        originalPrice: originalPrice,
        currentPrice: initialCurrentPrice,
        stock: currentStock,
        daysToExpiry: daysToExpiry,
        salesVelocity: salesVelocity,
        discount: initialDiscount,
        alerts: {
          expiry: false,
          stock: false,
          salesVelocity: false,
          other: false,
        },
        matchedRules: [],
      }

      return applyPricingRules(baseProduct)
    })

    setProducts(products)
  }

  // Evaluate a single condition
  const evaluateCondition = (condition: RuleCondition, product: Product): boolean => {
    const { parameter, operator, value } = condition
    const productValue = product[parameter as keyof Product] as number

    switch (operator) {
      case "==":
        return productValue === value
      case "!=":
        return productValue !== value
      case ">":
        return productValue > value
      case ">=":
        return productValue >= value
      case "<":
        return productValue < value
      case "<=":
        return productValue <= value
      default:
        return false
    }
  }

  // Evaluate all conditions for a rule (AND logic)
  const evaluateRule = (rule: PricingRule, product: Product): boolean => {
    return rule.conditions.every((condition) => evaluateCondition(condition, product))
  }

  const applyPricingRules = (product: Product): Product => {
    const sortedRules = [...pricingRules].sort((a, b) => a.priority - b.priority)
    const updatedProduct = {
      ...product,
      alerts: {
        expiry: false,
        stock: false,
        salesVelocity: false,
        other: false,
      },
      matchedRules: [],
    }

    let totalDiscount = 0

    for (const rule of sortedRules) {
      if (!rule.isActive) continue

      const conditionMet = evaluateRule(rule, product)

      if (conditionMet) {
        // Add rule to matched rules
        updatedProduct.matchedRules.push(rule.id)

        // Apply discount
        totalDiscount += rule.discount

        // Set alert flag based on rule type
        updatedProduct.alerts[rule.alertType] = true
      }
    }

    // No maximum discount cap - apply the full calculated discount
    updatedProduct.currentPrice = product.originalPrice * (1 - totalDiscount / 100)
    updatedProduct.discount = totalDiscount

    return updatedProduct
  }

  const refreshData = () => {
    if (rawDataset.length > 0) {
      generateProductsFromRealData()
      setLastUpdate(new Date())
    }
  }

  const addSale = (items: any[]) => {
    const sale = {
      id: `sale-${salesHistory.length + 1}`,
      timestamp: new Date(),
      items,
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }

    setSalesHistory((prev) => [sale, ...prev])

    // Update stock levels in raw dataset and regenerate products
    setRawDataset((prevDataset) => {
      const updatedDataset = prevDataset.map((dataItem) => {
        const soldItem = items.find((item) => item.id === dataItem.id)
        if (soldItem) {
          return {
            ...dataItem,
            Stock: Math.max(0, dataItem.Stock - soldItem.quantity),
          }
        }
        return dataItem
      })
      return updatedDataset
    })
  }

  const updateRule = (updatedRule: PricingRule) => {
    setPricingRules((prevRules) => prevRules.map((rule) => (rule.id === updatedRule.id ? updatedRule : rule)))
    refreshData()
  }

  const deleteRule = (ruleId: string) => {
    setPricingRules((prevRules) => prevRules.filter((rule) => rule.id !== ruleId))
    refreshData()
  }

  const addRule = (newRule: PricingRule) => {
    setPricingRules((prevRules) => [
      ...prevRules,
      {
        ...newRule,
        id: `rule-${Date.now()}`,
        priority: prevRules.length + 1,
      },
    ])
    refreshData()
  }

  return (
    <AppContext.Provider
      value={{
        products,
        setProducts,
        rawDataset,
        setRawDataset,
        pricingRules,
        setPricingRules,
        datasetUploaded,
        setDatasetUploaded,
        datasetSummary,
        setDatasetSummary,
        lastUpdate,
        refreshData,
        applyPricingRules,
        salesHistory,
        addSale,
        processRealDataset,
        updateRule,
        deleteRule,
        addRule,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
