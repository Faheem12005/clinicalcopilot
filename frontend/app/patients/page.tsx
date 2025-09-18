"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Upload, Search, Eye, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatients, setSelectedPatients] = useState<number[]>([])
  const [fhirData, setFhirData] = useState("")
  const router = useRouter()

  const handleSubmitFHIR = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/upload_fhir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: fhirData, // raw JSON pasted
      })

      if (!response.ok) throw new Error("Failed to upload FHIR")
      alert("FHIR uploaded successfully!")
      setFhirData("")
    } catch (error) {
      console.error(error)
      alert("Error uploading FHIR")
    }
  }

  // --- mock data (later will come from backend) ---
  const mockPatients = [
    { id: 1, name: "Sarah Johnson", age: 34, gender: "Female", condition: "Hypertension", lastVisit: "2024-01-15", status: "Active", riskLevel: "Low" },
    { id: 2, name: "Michael Chen", age: 67, gender: "Male", condition: "Type 2 Diabetes", lastVisit: "2024-01-12", status: "Active", riskLevel: "High" },
    { id: 3, name: "Emily Rodriguez", age: 45, gender: "Female", condition: "Asthma", lastVisit: "2024-01-10", status: "Active", riskLevel: "Medium" },
  ]

  const filteredPatients = mockPatients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.condition.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenDashboard = (patientId: number) => {
    router.push(`/dashboard?patient=${patientId}`)
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "High": return "bg-red-100 text-red-800 border-red-200"
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-chart-1/10 text-dbbg border-primary/20"
      case "Follow-up": return "bg-orange-100 text-orange-800 border-orange-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen medical-gradient">
      <Navigation />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Actions */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6 flex justify-between items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-chart-2" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 w-full"
              />
            </div>

            <div className="flex gap-3">
              {/* FHIR upload dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 h-11 bg-transparent">
                    <Upload className="h-4 w-4" />
                    Upload FHIR
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Upload FHIR JSON</DialogTitle>
                  </DialogHeader>

                  <Textarea
                    placeholder="Paste FHIR JSON here..."
                    className="min-h-[200px]"
                    value={fhirData}
                    onChange={(e) => setFhirData(e.target.value)}
                  />

                  <DialogFooter>
                    <Button onClick={handleSubmitFHIR} className="bg-primary text-white hover:bg-primary/90">
                      Submit
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button className="gap-2 h-11 bg-primary text-chart-2 hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Add Patient
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patient list table */}
        {/* ... rest of your table exactly as you had it ... */}
      </div>
    </div>
  )
}
