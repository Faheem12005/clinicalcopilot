"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Brain, Search, FileText, ArrowLeft, User } from "lucide-react"
import { useRouter } from "next/navigation"

interface SearchResult {
  id: number
  text: string
  type: string
  relevance: number
  distance: number
}

interface SearchResponse {
  query: string
  results: SearchResult[]
  total_results: number
}

export default function CopilotPage() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchError, setSearchError] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const router = useRouter()

  const handleSearch = async () => {
    if (!query.trim()) {
      alert("Please enter a search query")
      return
    }

    setIsSearching(true)
    setSearchError("")
    
    try {
      const response = await fetch("http://127.0.0.1:5000/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: query,
          n_results: 10 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }
      
      const result: SearchResponse = await response.json()
      
      // Remove duplicates based on text content and limit to top 3
      const uniqueResults: SearchResult[] = []
      const seenTexts = new Set<string>()
      
      for (const resultItem of result.results) {
        const normalizedText = resultItem.text.toLowerCase().trim()
        if (!seenTexts.has(normalizedText) && uniqueResults.length < 3) {
          seenTexts.add(normalizedText)
          uniqueResults.push(resultItem)
        }
      }
      
      setSearchResults(uniqueResults)
      setHasSearched(true)
      
    } catch (error) {
      console.error("Search error:", error)
      setSearchError((error as Error).message)
      setSearchResults([])
      setHasSearched(true)
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      handleSearch()
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'condition': return "bg-red-100 text-red-800 border-red-200"
      case 'medication': return "bg-blue-100 text-blue-800 border-blue-200"
      case 'observation': return "bg-green-100 text-green-800 border-green-200"
      case 'procedure': return "bg-purple-100 text-purple-800 border-purple-200"
      case 'patient': return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 0.8) return "text-green-600 font-medium"
    if (relevance >= 0.6) return "text-yellow-600 font-medium"
    return "text-red-600 font-medium"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/patients')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Upload
            </Button>
            
            {/* Patient Info Display */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <div className="text-sm">
                    <span className="font-medium">Abdul218 Harris789</span>
                    <span className="text-muted-foreground ml-2">Male, DOB: 1952-12-05</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">AI Clinical Copilot</h1>
          </div>
          <p className="text-muted-foreground">
            Search your uploaded patient data using natural language queries
          </p>
        </div>

        {/* Search Interface */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Patient Data</CardTitle>
            <CardDescription>
              Ask questions about the patient data using natural language
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="e.g., 'What medications is the patient taking?' or 'Show me recent lab results'"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                  disabled={isSearching}
                />
              </div>
              <Button onClick={handleSearch} disabled={!query.trim() || isSearching}>
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
            
            {/* Example Queries */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Try:</span>
              {[
                "What conditions does the patient have?",
                "Show me all medications",
                "Recent lab results"
              ].map((example) => (
                <Button
                  key={example}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(example)}
                  disabled={isSearching}
                  className="text-xs"
                >
                  {example}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {hasSearched && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Search Results
                {searchResults.length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({searchResults.length} results)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {searchError ? (
                <div className="text-center py-8">
                  <div className="text-red-600 mb-2">Search Error</div>
                  <p className="text-sm text-muted-foreground">{searchError}</p>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/patients')} 
                    className="mt-4"
                  >
                    Upload Data First
                  </Button>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No results found for your query.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try different keywords or check if your data has been uploaded and indexed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((result) => (
                    <Card key={result.id} className="border-l-4 border-l-primary/30">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getTypeColor(result.type)}>
                                {result.type}
                              </Badge>
                            </div>
                            <p className="text-sm leading-relaxed">{result.text}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}