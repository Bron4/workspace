import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { History, CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { getMessageHistory } from '@/api/sms'
import { useToast } from '@/hooks/useToast'

interface Message {
  id: string
  sentAt: string // Changed from 'date' to 'sentAt' to match backend
  cityName: string // Changed from 'city' to 'cityName' to match backend
  technicianName: string // Changed from 'technician' to 'technicianName' to match backend
  customerName: string
  customerPhone: string // Changed from 'phoneNumber' to 'customerPhone' to match backend
  status: string
}

export function MessageHistory() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalMessages, setTotalMessages] = useState(0)
  const { toast } = useToast()

  const messagesPerPage = 10
  const totalPages = Math.ceil(totalMessages / messagesPerPage)

  useEffect(() => {
    loadMessages()
  }, [currentPage])

  const loadMessages = async () => {
    try {
      setLoading(true)
      console.log('Loading message history, page:', currentPage)
      const response = await getMessageHistory({ page: currentPage, limit: messagesPerPage })
      setMessages(response.messages)
      setTotalMessages(response.total || response.totalCount) // Handle both field names
    } catch (error) {
      console.error('Error loading message history:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load message history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    if (status === 'Sent') {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Sent
        </Badge>
      )
    } else {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Message History
          </h1>
          <p className="text-muted-foreground">
            Recent SMS review requests sent to customers
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            {totalMessages} Total Messages
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={loadMessages}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Last {messagesPerPage} SMS requests (Page {currentPage} of {totalPages})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4 p-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                      <TableCell className="font-medium">
                        {formatDate(message.sentAt)}
                      </TableCell>
                      <TableCell>{message.cityName}</TableCell>
                      <TableCell>{message.technicianName}</TableCell>
                      <TableCell>{message.customerName}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {message.customerPhone}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(message.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * messagesPerPage) + 1} to {Math.min(currentPage * messagesPerPage, totalMessages)} of {totalMessages} messages
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm font-medium px-3">
                      {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}