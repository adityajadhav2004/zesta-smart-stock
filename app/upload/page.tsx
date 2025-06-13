"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppContext } from "@/lib/context/app-context"
import { useRouter } from "next/navigation"

export default function UploadPage() {
  const router = useRouter()
  const { processRealDataset, datasetSummary } = useAppContext()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setUploadComplete(false)
      setAnalysisResults(null)
      setError(null)
    }
  }

  const processUpload = async () => {
    if (!file) return

    setUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      // Read the file
      const text = await file.text()

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 20
        })
      }, 100)

      // Process the actual CSV data
      setTimeout(async () => {
        try {
          const summary = processRealDataset(text)

          setUploadProgress(100)
          setUploading(false)
          setUploadComplete(true)
          setAnalysisResults(summary)

          clearInterval(progressInterval)
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to process dataset")
          setUploading(false)
          clearInterval(progressInterval)
        }
      }, 2000)
    } catch (err) {
      setError("Failed to read file")
      setUploading(false)
    }
  }

  // Load from the provided URL
  const loadFromURL = async () => {
    setUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      const response = await fetch(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/walmart_perishable_inventory-KhFUW8xKVlD5sTudgekpoz23bQldU3.csv",
      )

      if (!response.ok) {
        throw new Error("Failed to fetch dataset from URL")
      }

      const text = await response.text()

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 20
        })
      }, 100)

      setTimeout(() => {
        try {
          const summary = processRealDataset(text)

          setUploadProgress(100)
          setUploading(false)
          setUploadComplete(true)
          setAnalysisResults(summary)

          clearInterval(progressInterval)
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to process dataset")
          setUploading(false)
          clearInterval(progressInterval)
        }
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dataset")
      setUploading(false)
    }
  }

  const viewDashboard = () => {
    router.push("/dashboard")
  }

  const configurePricingRules = () => {
    router.push("/settings")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Inventory Dataset</h1>
          <p className="text-gray-600">Upload your product inventory to begin dynamic pricing analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Dataset Upload
              </CardTitle>
              <CardDescription>
                Upload CSV file containing product data, inventory, and pricing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dataset">Select Dataset File</Label>
                <Input id="dataset" type="file" accept=".csv" onChange={handleFileChange} className="mt-1" />
              </div>

              {file && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing dataset...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {uploadComplete && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Dataset processed successfully!</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Button onClick={processUpload} disabled={!file || uploading} className="w-full">
                  {uploading ? "Processing..." : "Upload & Analyze"}
                </Button>

                <div className="text-center text-sm text-gray-500">or</div>

                <Button onClick={loadFromURL} disabled={uploading} variant="outline" className="w-full">
                  Load Sample Inventory Dataset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Dataset Requirements</CardTitle>
              <CardDescription>Your CSV file should contain these columns for optimal analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Product Information</div>
                    <div className="text-sm text-gray-600">Product, Store, Category</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Inventory Data</div>
                    <div className="text-sm text-gray-600">Stock, Expiry (Days Left)</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Pricing</div>
                    <div className="text-sm text-gray-600">Original Price, Current Price, Discount</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Sales Data</div>
                    <div className="text-sm text-gray-600">Sales Velocity</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Results */}
        {analysisResults && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Dataset Analysis Results</CardTitle>
              <CardDescription>Analysis of your uploaded inventory dataset</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analysisResults.totalItems}</div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analysisResults.storeCount}</div>
                  <div className="text-sm text-gray-600">Stores</div>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{analysisResults.nearExpiry}</div>
                  <div className="text-sm text-gray-600">Near Expiry (≤2 days)</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {analysisResults.averageShelfLife.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Shelf Life (days)</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Dataset Overview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Stores:</span>
                      <span className="font-medium">{analysisResults.storeCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Categories:</span>
                      <span className="font-medium">{analysisResults.categoryCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Price:</span>
                      <span className="font-medium">${analysisResults.avgPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price Range:</span>
                      <span className="font-medium">
                        ${analysisResults.priceRange[0].toFixed(2)} - ${analysisResults.priceRange[1].toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Real-time Features</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Dynamic pricing enabled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Real-time inventory tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Automatic price adjustments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Sales impact tracking</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <Button onClick={viewDashboard}>View Dashboard</Button>
                <Button variant="outline" onClick={configurePricingRules}>
                  Configure Pricing Rules
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
