// "use client"

// import { useState, useEffect } from "react"
// import { Navigation } from "@/components/navigation"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Progress } from "@/components/ui/progress"
// import { Separator } from "@/components/ui/separator"
// import {
//   Heart,
//   Thermometer,
//   Activity,
//   Brain,
//   AlertTriangle,
//   CheckCircle,
//   TrendingUp,
//   FileText,
//   Pill,
//   Stethoscope,
// } from "lucide-react"
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// // Mock patient data
// const mockPatient = {
//   id: 1,
//   name: "Sarah Johnson",
//   age: 34,
//   gender: "Female",
//   mrn: "MRN-001234",
//   demographics: {
//     dob: "1989-06-15",
//     address: "123 Main St, City, State",
//     phone: "(555) 123-4567",
//     emergencyContact: "John Johnson - (555) 987-6543",
//   },
//   conditions: [
//     { name: "Hypertension", status: "Active", onset: "2022-03-15" },
//     { name: "Hyperlipidemia", status: "Active", onset: "2023-01-10" },
//   ],
//   medications: [
//     { name: "Lisinopril", dose: "10mg", frequency: "Daily", prescriber: "Dr. Smith" },
//     { name: "Atorvastatin", dose: "20mg", frequency: "Daily", prescriber: "Dr. Smith" },
//   ],
//   allergies: ["Penicillin", "Shellfish"],
//   vitals: {
//     bloodPressure: "128/82",
//     heartRate: 72,
//     temperature: 98.6,
//     oxygenSat: 98,
//     weight: 145,
//     height: "5'6\"",
//   },
//   labs: [
//     { test: "Cholesterol", value: "185", range: "<200", status: "Normal", date: "2024-01-10" },
//     { test: "HbA1c", value: "5.2", range: "<5.7", status: "Normal", date: "2024-01-10" },
//     { test: "Creatinine", value: "0.9", range: "0.6-1.2", status: "Normal", date: "2024-01-10" },
//   ],
// }

// // Mock vitals trend data
// const vitalsData = [
//   { date: "Jan 1", systolic: 130, diastolic: 85, heartRate: 75 },
//   { date: "Jan 8", systolic: 128, diastolic: 82, heartRate: 72 },
//   { date: "Jan 15", systolic: 125, diastolic: 80, heartRate: 70 },
//   { date: "Jan 22", systolic: 132, diastolic: 84, heartRate: 74 },
//   { date: "Jan 29", systolic: 128, diastolic: 82, heartRate: 72 },
// ]

// // Mock AI recommendations
// const mockRecommendations = [
//   {
//     id: 1,
//     title: "Blood Pressure Optimization",
//     summary: "Consider increasing Lisinopril dose to 15mg daily based on recent BP readings and patient tolerance.",
//     riskBenefit: { risk: "Low", benefit: "High" },
//     confidence: 85,
//     sources: 3,
//   },
//   {
//     id: 2,
//     title: "Lifestyle Modifications",
//     summary: "Recommend DASH diet and 150 minutes of moderate exercise weekly to improve cardiovascular outcomes.",
//     riskBenefit: { risk: "Very Low", benefit: "High" },
//     confidence: 92,
//     sources: 5,
//   },
//   {
//     id: 3,
//     title: "Monitoring Schedule",
//     summary: "Schedule follow-up in 4 weeks to assess BP response and medication tolerance.",
//     riskBenefit: { risk: "None", benefit: "Medium" },
//     confidence: 78,
//     sources: 2,
//   },
// ]

// export default function DashboardPage() {
//   const [aiQuery, setAiQuery] = useState("")
//   const [isGenerating, setIsGenerating] = useState(false)

//   const handleGenerateRecommendations = async () => {
//     setIsGenerating(true)
//     await new Promise((resolve) => setTimeout(resolve, 2000))
//     setIsGenerating(false)
//   }

//   const getStatusColor = (status: string) => {
//     switch (status.toLowerCase()) {
//       case "normal":
//         return "text-green-600"
//       case "high":
//         return "text-red-600"
//       case "low":
//         return "text-blue-600"
//       default:
//         return "text-muted-foreground"
//     }
//   }

//   return (
//     <div className="min-h-screen bg-chart-2">
//       <Navigation />
//       <div className="container mx-auto px-4 py-8">
//         <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
//           {/* Left Panel - Patient Snapshot */}
//           <div className="xl:col-span-4 space-y-6">
//             {/* Patient Header */}
//             <Card className="medical-card-gradient shadow-lg border-0 animate-slide-up">
//               <CardHeader className="pb-4">
//                 <div className="flex items-center gap-4">
//                   <div className="p-3 bg-primary/10 rounded-full">
//                     <Stethoscope className="h-6 w-6 text-primary" />
//                   </div>
//                   <div>
//                     <CardTitle className="text-xl">{mockPatient.name}</CardTitle>
//                     <CardDescription>
//                       {mockPatient.age} years • {mockPatient.gender} • MRN: {mockPatient.mrn}
//                     </CardDescription>
//                   </div>
//                 </div>
//               </CardHeader>
//             </Card>

//             {/* Demographics */}
//             <Card className="medical-card-gradient shadow-lg border-0 animate-fade-in">
//               <CardHeader>
//                 <CardTitle className="text-lg">Demographics</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="grid grid-cols-2 gap-4 text-sm">
//                   <div>
//                     <span className="text-muted-foreground">DOB:</span>
//                     <p className="font-medium">{new Date(mockPatient.demographics.dob).toLocaleDateString()}</p>
//                   </div>
//                   <div>
//                     <span className="text-muted-foreground">Phone:</span>
//                     <p className="font-medium">{mockPatient.demographics.phone}</p>
//                   </div>
//                 </div>
//                 <div>
//                   <span className="text-muted-foreground">Address:</span>
//                   <p className="font-medium">{mockPatient.demographics.address}</p>
//                 </div>
//                 <div>
//                   <span className="text-muted-foreground">Emergency Contact:</span>
//                   <p className="font-medium">{mockPatient.demographics.emergencyContact}</p>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Conditions */}
//             <Card className="medical-card-gradient shadow-lg border-0 animate-fade-in">
//               <CardHeader>
//                 <CardTitle className="text-lg">Active Conditions</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 {mockPatient.conditions.map((condition, index) => (
//                   <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
//                     <div>
//                       <p className="font-medium">{condition.name}</p>
//                       <p className="text-sm text-muted-foreground">
//                         Since {new Date(condition.onset).toLocaleDateString()}
//                       </p>
//                     </div>
//                     <Badge className="bg-primary/10 text-primary border-primary/20">{condition.status}</Badge>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>

//             {/* Medications & Allergies */}
//             <Card className="medical-card-gradient shadow-lg border-0 animate-fade-in">
//               <CardHeader>
//                 <CardTitle className="text-lg">Medications & Allergies</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div>
//                   <h4 className="font-medium mb-2 flex items-center gap-2">
//                     <Pill className="h-4 w-4 text-primary" />
//                     Current Medications
//                   </h4>
//                   <div className="space-y-2">
//                     {mockPatient.medications.map((med, index) => (
//                       <div key={index} className="text-sm p-2 bg-muted/20 rounded">
//                         <p className="font-medium">
//                           {med.name} {med.dose}
//                         </p>
//                         <p className="text-muted-foreground">
//                           {med.frequency} • {med.prescriber}
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <Separator />

//                 <div>
//                   <h4 className="font-medium mb-2 flex items-center gap-2">
//                     <AlertTriangle className="h-4 w-4 text-red-500" />
//                     Allergies
//                   </h4>
//                   <div className="flex gap-2">
//                     {mockPatient.allergies.map((allergy, index) => (
//                       <Badge key={index} variant="destructive" className="text-xs">
//                         {allergy}
//                       </Badge>
//                     ))}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Recent Labs */}
//             <Card className="medical-card-gradient shadow-lg border-0 animate-fade-in">
//               <CardHeader>
//                 <CardTitle className="text-lg">Recent Lab Results</CardTitle>
//                 <CardDescription>January 10, 2024</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-3">
//                   {mockPatient.labs.map((lab, index) => (
//                     <div
//                       key={index}
//                       className="flex items-center justify-between p-2 hover:bg-muted/20 rounded transition-colors"
//                     >
//                       <div>
//                         <p className="font-medium">{lab.test}</p>
//                         <p className="text-sm text-muted-foreground">Range: {lab.range}</p>
//                       </div>
//                       <div className="text-right">
//                         <p className="font-medium">{lab.value}</p>
//                         <p className={`text-sm ${getStatusColor(lab.status)}`}>{lab.status}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Vitals Trend */}
//             <Card className="medical-card-gradient shadow-lg border-0 animate-fade-in">
//               <CardHeader>
//                 <CardTitle className="text-lg">Vitals Trend</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="h-48">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <LineChart data={vitalsData}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 160)" />
//                       <XAxis dataKey="date" stroke="oklch(0.5 0.02 180)" />
//                       <YAxis stroke="oklch(0.5 0.02 180)" />
//                       <Tooltip
//                         contentStyle={{
//                           backgroundColor: "oklch(1 0 0)",
//                           border: "1px solid oklch(0.88 0.02 160)",
//                           borderRadius: "8px",
//                         }}
//                       />
//                       <Line
//                         type="monotone"
//                         dataKey="systolic"
//                         stroke="oklch(0.45 0.08 180)"
//                         strokeWidth={2}
//                         name="Systolic BP"
//                       />
//                       <Line
//                         type="monotone"
//                         dataKey="heartRate"
//                         stroke="oklch(0.65 0.06 170)"
//                         strokeWidth={2}
//                         name="Heart Rate"
//                       />
//                     </LineChart>
//                   </ResponsiveContainer>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Center Panel - AI Query & Recommendations */}
//           <div className="xl:col-span-5 space-y-6">
//             {/* AI Query */}
//             <Card className="medical-card-gradient shadow-lg border-0 animate-scale-in">
//               <CardHeader>
//                 <CardTitle className="text-lg flex items-center gap-2">
//                   <Brain className="h-5 w-5 text-primary" />
//                   AI Clinical Assistant
//                 </CardTitle>
//                 <CardDescription>Ask questions about this patient for AI-powered recommendations</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <Input
//                   placeholder="Ask about this patient... (e.g., 'What are the best treatment options for hypertension?')"
//                   value={aiQuery}
//                   onChange={(e) => setAiQuery(e.target.value)}
//                   className="h-12"
//                 />
//                 <Button
//                   onClick={handleGenerateRecommendations}
//                   disabled={isGenerating}
//                   className="w-full h-11 bg-primary hover:bg-primary/90"
//                 >
//                   {isGenerating ? (
//                     <>
//                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                       Generating Recommendations...
//                     </>
//                   ) : (
//                     <>
//                       <Brain className="h-4 w-4 mr-2" />
//                       Generate Recommendations
//                     </>
//                   )}
//                 </Button>
//               </CardContent>
//             </Card>

//             {/* Recommendations */}
//             <div className="space-y-4">
//               <h3 className="text-xl font-semibold">AI Recommendations</h3>
//               {mockRecommendations.map((rec, index) => (
//                 <Card
//                   key={rec.id}
//                   className="medical-card-gradient shadow-lg border-0 card-hover animate-fade-in"
//                   style={{ animationDelay: `${index * 0.1}s` }}
//                 >
//                   <CardHeader className="pb-3">
//                     <div className="flex items-start justify-between">
//                       <CardTitle className="text-lg">{rec.title}</CardTitle>
//                       <div className="flex gap-2">
//                         <Badge
//                           className={`${
//                             rec.riskBenefit.risk === "Low" ||
//                             rec.riskBenefit.risk === "Very Low" ||
//                             rec.riskBenefit.risk === "None"
//                               ? "bg-green-100 text-green-800 border-green-200"
//                               : "bg-red-100 text-red-800 border-red-200"
//                           }`}
//                         >
//                           Risk: {rec.riskBenefit.risk}
//                         </Badge>
//                         <Badge className="bg-blue-100 text-blue-800 border-blue-200">
//                           Benefit: {rec.riskBenefit.benefit}
//                         </Badge>
//                       </div>
//                     </div>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <p className="text-muted-foreground">{rec.summary}</p>

//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <span className="text-sm text-muted-foreground">Confidence:</span>
//                         <Progress value={rec.confidence} className="w-20 h-2" />
//                         <span className="text-sm font-medium">{rec.confidence}%</span>
//                       </div>
//                       <Button variant="outline" size="sm" className="gap-2 bg-transparent">
//                         <FileText className="h-4 w-4" />
//                         View Sources ({rec.sources})
//                       </Button>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </div>

//           {/* Right Panel - Evidence & Explanations */}
//           <div className="xl:col-span-3 space-y-6">
//             {/* Current Vitals */}
//             <Card className="medical-card-gradient shadow-lg border-0 animate-fade-in">
//               <CardHeader>
//                 <CardTitle className="text-lg">Current Vitals</CardTitle>
//                 <CardDescription>Latest measurements</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="text-center p-3 bg-muted/20 rounded-lg">
//                     <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
//                     <p className="text-sm text-muted-foreground">Blood Pressure</p>
//                     <p className="font-bold text-lg">{mockPatient.vitals.bloodPressure}</p>
//                   </div>
//                   <div className="text-center p-3 bg-muted/20 rounded-lg">
//                     <Activity className="h-6 w-6 text-primary mx-auto mb-2" />
//                     <p className="text-sm text-muted-foreground">Heart Rate</p>
//                     <p className="font-bold text-lg">{mockPatient.vitals.heartRate} bpm</p>
//                   </div>
//                   <div className="text-center p-3 bg-muted/20 rounded-lg">
//                     <Thermometer className="h-6 w-6 text-orange-500 mx-auto mb-2" />
//                     <p className="text-sm text-muted-foreground">Temperature</p>
//                     <p className="font-bold text-lg">{mockPatient.vitals.temperature}°F</p>
//                   </div>
//                   <div className="text-center p-3 bg-muted/20 rounded-lg">
//                     <TrendingUp className="h-6 w-6 text-blue-500 mx-auto mb-2" />
//                     <p className="text-sm text-muted-foreground">O2 Sat</p>
//                     <p className="font-bold text-lg">{mockPatient.vitals.oxygenSat}%</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Evidence Sources */}
//             <Card className="medical-card-gradient shadow-lg border-0 animate-fade-in">
//               <CardHeader>
//                 <CardTitle className="text-lg">Evidence Sources</CardTitle>
//                 <CardDescription>Supporting research and guidelines</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="p-3 bg-muted/20 rounded-lg">
//                   <h4 className="font-medium text-sm mb-1">AHA/ACC Hypertension Guidelines</h4>
//                   <p className="text-xs text-muted-foreground">2017 Guidelines for Management of High Blood Pressure</p>
//                   <Button variant="link" className="p-0 h-auto text-xs text-primary">
//                     View Source →
//                   </Button>
//                 </div>
//                 <div className="p-3 bg-muted/20 rounded-lg">
//                   <h4 className="font-medium text-sm mb-1">SPRINT Trial Results</h4>
//                   <p className="text-xs text-muted-foreground">Intensive vs Standard BP Control</p>
//                   <Button variant="link" className="p-0 h-auto text-xs text-primary">
//                     View Source →
//                   </Button>
//                 </div>
//                 <div className="p-3 bg-muted/20 rounded-lg">
//                   <h4 className="font-medium text-sm mb-1">Cochrane Review</h4>
//                   <p className="text-xs text-muted-foreground">ACE Inhibitors for Hypertension</p>
//                   <Button variant="link" className="p-0 h-auto text-xs text-primary">
//                     View Source →
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* AI Explanation */}
//             <Card className="medical-card-gradient shadow-lg border-0 animate-fade-in">
//               <CardHeader>
//                 <CardTitle className="text-lg">Why This Was Recommended</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
//                   <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
//                     <CheckCircle className="h-4 w-4 text-green-600" />
//                     Patient Factors Considered
//                   </h4>
//                   <ul className="text-xs text-muted-foreground space-y-1">
//                     <li>• Current BP: 128/82 mmHg</li>
//                     <li>• Age: 34 years (low cardiovascular risk)</li>
//                     <li>• No contraindications to ACE inhibitors</li>
//                     <li>• Good medication adherence history</li>
//                   </ul>
//                 </div>

//                 <div className="space-y-2">
//                   <h4 className="font-medium text-sm">Confidence Factors</h4>
//                   <div className="space-y-2">
//                     <div className="flex justify-between items-center">
//                       <span className="text-xs">Evidence Quality</span>
//                       <Progress value={90} className="w-16 h-1" />
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-xs">Patient Match</span>
//                       <Progress value={85} className="w-16 h-1" />
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-xs">Safety Profile</span>
//                       <Progress value={95} className="w-16 h-1" />
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// import {
//   fetchPatient,
//   fetchConditions,
//   fetchMedications,
//   fetchAllergies,
//   fetchLabResults,
//   fetchVitals
// } from "../../lib/api"

// import { Patient, Condition, Medication, Allergy, LabResult, Vital } from "../../lib/types"


// export default function DashboardPage() {
//   const [patient, setPatient] = useState<Patient | null>(null)
//   const [conditions, setConditions] = useState<Condition[]>([])
//   const [medications, setMedications] = useState<Medication[]>([])
//   const [allergies, setAllergies] = useState<Allergy[]>([])
//   const [labResults, setLabResults] = useState<LabResult[]>([])
//   const [vitals, setVitals] = useState<Vital[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     async function loadData() {
//       const [p, c, m, a, l, v] = await Promise.all([
//         fetchPatient(),
//         fetchConditions(),
//         fetchMedications(),
//         fetchAllergies(),
//         fetchLabResults(),
//         fetchVitals(),
//       ])
//       setPatient(p)
//       setConditions(c)
//       setMedications(m)
//       setAllergies(a)
//       setLabResults(l)
//       setVitals(v)
//       setLoading(false)
//     }
//     loadData()
//   }, [])

//   if (loading) return <div className="p-6">Loading...</div>

//   return (
//     <div className="grid grid-cols-12 gap-6 p-6">
//       {/* Left Column */}
//       <div className="col-span-3 space-y-6">
//         <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
//           <h2 className="text-xl font-bold mb-2">{patient?.name}</h2>
//           <p className="text-sm text-gray-500">
//             {patient?.age} • {patient?.gender}
//           </p>
//           <p className="text-sm text-gray-500">MRN: {patient?.mrn}</p>
//         </div>

//         <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
//           <h3 className="font-semibold mb-2">Active Conditions</h3>
//           <ul className="space-y-1">
//             {conditions.map(c => (
//               <li key={c.name} className="text-sm">
//                 {c.name} <span className="text-gray-400">({c.onset})</span>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Do the same for medications, allergies, lab results, and vitals chart */}
//       </div>

//       {/* Center Column and Right Column ... */}
//     </div>
//   )
// }


"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Heart,
  Thermometer,
  Activity,
  Brain,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  FileText,
  Pill,
  Stethoscope,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function DashboardPage() {
  const [patient, setPatient] = useState<any>(null)
  const [vitals, setVitals] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aiQuery, setAiQuery] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const patientId = 1 // Change if needed

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [patientRes, vitalsRes, recRes] = await Promise.all([
          fetch(`http://localhost:5000/api/patient/${patientId}`),
          fetch(`http://localhost:5000/api/patient/${patientId}/vitals`),
          fetch(`http://localhost:5000/api/patient/${patientId}/recommendations`),
        ])
        if (!patientRes.ok || !vitalsRes.ok || !recRes.ok) throw new Error("Failed to fetch data")
        const patientData = await patientRes.json()
        const vitalsData = await vitalsRes.json()
        const recData = await recRes.json()
        setPatient(patientData)
        setVitals(vitalsData)
        setRecommendations(recData)
        setLoading(false)
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleGenerateRecommendations = async () => {
    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsGenerating(false)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "normal":
        return "text-green-600"
      case "high":
        return "text-red-600"
      case "low":
        return "text-blue-600"
      default:
        return "text-muted-foreground"
    }
  }

  if (loading) return <p className="text-center mt-10">Loading patient data...</p>
  if (error) return <p className="text-center mt-10 text-red-600">Error: {error}</p>

  return (
    <div className="min-h-screen bg-chart-2">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Panel */}
          <div className="xl:col-span-4 space-y-6">
            {/* Patient Header */}
            <Card className="medical-card-gradient shadow-lg border-0 animate-slide-up">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Stethoscope className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{patient.name}</CardTitle>
                    <CardDescription>
                      {patient.age} years • {patient.gender} • MRN: {patient.mrn}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Demographics */}
            <Card className="medical-card-gradient shadow-lg border-0 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg">Demographics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">DOB:</span>
                    <p className="font-medium">{new Date(patient.demographics.dob).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{patient.demographics.phone}</p>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Address:</span>
                  <p className="font-medium">{patient.demographics.address}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Emergency Contact:</span>
                  <p className="font-medium">{patient.demographics.emergencyContact}</p>
                </div>
              </CardContent>
            </Card>

            {/* Conditions */}
            <Card className="medical-card-gradient shadow-lg border-0 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg">Active Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patient.conditions.map((condition: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">{condition.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Since {new Date(condition.onset).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20">{condition.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Medications & Allergies */}
            <Card className="medical-card-gradient shadow-lg border-0 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg">Medications & Allergies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Pill className="h-4 w-4 text-primary" />
                    Current Medications
                  </h4>
                  <div className="space-y-2">
                    {patient.medications.map((med: any, index: number) => (
                      <div key={index} className="text-sm p-2 bg-muted/20 rounded">
                        <p className="font-medium">
                          {med.name} {med.dose}
                        </p>
                        <p className="text-muted-foreground">
                          {med.frequency} • {med.prescriber}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Allergies
                  </h4>
                  <div className="flex gap-2">
                    {patient.allergies.map((allergy: string, index: number) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Labs */}
            <Card className="medical-card-gradient shadow-lg border-0 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg">Recent Lab Results</CardTitle>
                <CardDescription>January 10, 2024</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patient.labs.map((lab: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 hover:bg-muted/20 rounded transition-colors"
                    >
                      <div>
                        <p className="font-medium">{lab.test}</p>
                        <p className="text-sm text-muted-foreground">Range: {lab.range}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{lab.value}</p>
                        <p className={`text-sm ${getStatusColor(lab.status)}`}>{lab.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Vitals Trend */}
            <Card className="medical-card-gradient shadow-lg border-0 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg">Vitals Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={vitals}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 160)" />
                      <XAxis dataKey="date" stroke="oklch(0.5 0.02 180)" />
                      <YAxis stroke="oklch(0.5 0.02 180)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(1 0 0)",
                          border: "1px solid oklch(0.88 0.02 160)",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="systolic"
                        stroke="oklch(0.45 0.08 180)"
                        strokeWidth={2}
                        name="Systolic BP"
                      />
                      <Line
                        type="monotone"
                        dataKey="heartRate"
                        stroke="oklch(0.65 0.06 170)"
                        strokeWidth={2}
                        name="Heart Rate"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel */}
          <div className="xl:col-span-5 space-y-6">
            <Card className="medical-card-gradient shadow-lg border-0 animate-scale-in">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Clinical Assistant
                </CardTitle>
                <CardDescription>Ask questions about this patient for AI-powered recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Ask about this patient... (e.g., 'What are the best treatment options for hypertension?')"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  className="h-12"
                />
                <Button
                  onClick={handleGenerateRecommendations}
                  disabled={isGenerating}
                  className="w-full h-11 bg-primary hover:bg-primary/90"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Recommendations...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate Recommendations
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">AI Recommendations</h3>
              {recommendations.map((rec, index) => (
                <Card
                  key={rec.id}
                  className="medical-card-gradient shadow-lg border-0 card-hover animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{rec.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge
                          className={`${["Low", "Very Low", "None"].includes(rec.riskBenefit.risk)
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-red-100 text-red-800 border-red-200"
                            }`}
                        >
                          Risk: {rec.riskBenefit.risk}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          Benefit: {rec.riskBenefit.benefit}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{rec.summary}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Confidence:</span>
                        <Progress value={rec.confidence} className="w-20 h-2" />
                        <span className="text-sm font-medium">{rec.confidence}%</span>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <FileText className="h-4 w-4" />
                        View Sources ({rec.sources})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <div className="xl:col-span-3 space-y-6">
            <Card className="medical-card-gradient shadow-lg border-0 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg">Current Vitals</CardTitle>
                <CardDescription>Latest measurements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Blood Pressure</p>
                    <p className="font-bold text-lg">{patient.vitals.bloodPressure}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <Activity className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Heart Rate</p>
                    <p className="font-bold text-lg">{patient.vitals.heartRate} bpm</p>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <Thermometer className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Temperature</p>
                    <p className="font-bold text-lg">{patient.vitals.temperature}°F</p>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">O2 Sat</p>
                    <p className="font-bold text-lg">{patient.vitals.oxygenSat}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="medical-card-gradient shadow-lg border-0 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg">Evidence Sources</CardTitle>
                <CardDescription>Supporting research and guidelines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-muted/20 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">AHA/ACC Hypertension Guidelines</h4>
                  <p className="text-xs text-muted-foreground">2017 Guidelines for Management of High Blood Pressure</p>
                  <Button variant="link" className="p-0 h-auto text-xs text-primary">
                    View Source →
                  </Button>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">SPRINT Trial Results</h4>
                  <p className="text-xs text-muted-foreground">Intensive vs Standard BP Control</p>
                  <Button variant="link" className="p-0 h-auto text-xs text-primary">
                    View Source →
                  </Button>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Cochrane Review</h4>
                  <p className="text-xs text-muted-foreground">ACE Inhibitors for Hypertension</p>
                  <Button variant="link" className="p-0 h-auto text-xs text-primary">
                    View Source →
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="medical-card-gradient shadow-lg border-0 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg">Why This Was Recommended</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-medium text-sm mb-1">Clinical Evidence</h4>
                  <p className="text-xs text-muted-foreground">
                    Recommendations are based on patient vitals, lab trends, and established clinical guidelines.
                  </p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-medium text-sm mb-1">AI Analysis</h4>
                  <p className="text-xs text-muted-foreground">
                    The AI engine evaluates risk vs benefit, confidence level, and supporting literature to suggest actions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

