import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart3, MapPin, Users, Download, TrendingUp, TrendingDown } from 'lucide-react'
import { getCityReport, getTechnicianReport } from '@/api/reports'
import { useToast } from '@/hooks/useToast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface CityStats {
  city: string
  totalRequests: number
  successRate: number
  failedRequests: number
}

interface TechnicianStats {
  technician: string
  totalRequests: number
  successRate: number
  failedRequests: number
}

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1']

export function Reports() {
  const [cityStats, setCityStats] = useState<CityStats[]>([])
  const [technicianStats, setTechnicianStats] = useState<TechnicianStats[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      console.log('Loading reports data')
      const [cityResponse, technicianResponse] = await Promise.all([
        getCityReport() as Promise<{ cityStats: CityStats[] }>,
        getTechnicianReport() as Promise<{ technicianStats: TechnicianStats[] }>
      ])

      setCityStats(cityResponse.cityStats)
      setTechnicianStats(technicianResponse.technicianStats)
    } catch (error) {
      console.error('Error loading reports:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load reports",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getSuccessRateBadge = (rate: number) => {
    if (rate >= 95) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Excellent</Badge>
    } else if (rate >= 90) {
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Good</Badge>
    } else if (rate >= 85) {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Fair</Badge>
    } else {
      return <Badge variant="destructive">Needs Attention</Badge>
    }
  }

  const cityChartData = cityStats.map(stat => ({
    name: stat.city,
    requests: stat.totalRequests,
    successRate: stat.successRate
  }))

  const technicianPieData = technicianStats.map(stat => ({
    name: stat.technician,
    value: stat.totalRequests
  }))

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Performance Reports
          </h1>
          <p className="text-muted-foreground">
            Analyze SMS request performance by city and technician
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="cities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cities" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            City Performance
          </TabsTrigger>
          <TabsTrigger value="technicians" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Technician Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cities" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Requests by City
                </CardTitle>
                <CardDescription>
                  Total SMS requests sent per service location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cityChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="requests" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  City Statistics
                </CardTitle>
                <CardDescription>
                  Detailed performance metrics by location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>City</TableHead>
                      <TableHead>Requests</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cityStats.map((stat) => (
                      <TableRow key={stat.city}>
                        <TableCell className="font-medium">{stat.city}</TableCell>
                        <TableCell>{stat.totalRequests}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          {stat.successRate}%
                          {stat.successRate >= 95 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : stat.successRate < 90 ? (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          ) : null}
                        </TableCell>
                        <TableCell>
                          {getSuccessRateBadge(stat.successRate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technicians" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Request Distribution
                </CardTitle>
                <CardDescription>
                  SMS requests sent by each technician
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={technicianPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {technicianPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Technician Statistics
                </CardTitle>
                <CardDescription>
                  Individual performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Technician</TableHead>
                      <TableHead>Requests</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {technicianStats.map((stat) => (
                      <TableRow key={stat.technician}>
                        <TableCell className="font-medium">{stat.technician}</TableCell>
                        <TableCell>{stat.totalRequests}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          {stat.successRate}%
                          {stat.successRate >= 95 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : stat.successRate < 90 ? (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          ) : null}
                        </TableCell>
                        <TableCell>
                          {getSuccessRateBadge(stat.successRate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}