import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Send, RotateCcw, Eye, Phone, User, MapPin } from 'lucide-react'
import { getCities, getTechnicians, sendSMSRequest, getMessageTemplate } from '@/api/sms'
import { useToast } from '@/hooks/useToast'

interface FormData {
  cityId: string
  technicianId: string
  customerName: string
  phoneNumber: string
}

interface City {
  id: string
  name: string
  googleReviewLink: string
}

interface Technician {
  id: string
  name: string
}

export function SMSForm() {
  const [cities, setCities] = useState<City[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [messageTemplate, setMessageTemplate] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>()

  const watchedValues = watch()
  const selectedCity = cities.find(c => c.id === watchedValues.cityId)
  const selectedTechnician = technicians.find(t => t.id === watchedValues.technicianId)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        console.log('Loading cities, technicians, and message template')
        const [citiesResponse, techniciansResponse, templateResponse] = await Promise.all([
          getCities() as Promise<{ cities: City[] }>,
          getTechnicians() as Promise<{ technicians: Technician[] }>,
          getMessageTemplate() as Promise<{ template: string }>
        ])

        console.log('SMS Form: Received cities:', citiesResponse.cities)
        console.log('SMS Form: Received technicians:', techniciansResponse.technicians)
        console.log('SMS Form: Received template:', templateResponse.template)

        setCities(citiesResponse.cities)
        setTechnicians(techniciansResponse.technicians)
        setMessageTemplate(templateResponse.template)
      } catch (error) {
        console.error('Error loading form data:', error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load form data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const generatePreviewMessage = () => {
    if (!watchedValues.customerName || !selectedCity || !selectedTechnician || !messageTemplate) {
      return "Please fill in all fields to see the message preview..."
    }

    return messageTemplate
      .replace('{customerName}', watchedValues.customerName)
      .replace('{googleReviewLink}', selectedCity.googleReviewLink)
      .replace('{technicianName}', selectedTechnician.name)
  }

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`
    }
    return value
  }

  const onSubmit = async (data: FormData) => {
    try {
      setSending(true)
      console.log('Submitting SMS request:', data)

      // Map phoneNumber to customerPhone to match backend expectation
      const requestData = {
        cityId: data.cityId,
        technicianId: data.technicianId,
        customerName: data.customerName,
        customerPhone: data.phoneNumber
      }

      const response = await sendSMSRequest(requestData) as { success: boolean; message: string; messageId: string }

      toast({
        title: "Success!",
        description: response.message,
        variant: "default",
      })

      reset()
    } catch (error) {
      console.error('Error sending SMS:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send SMS request",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const messagePreview = generatePreviewMessage()
  const characterCount = messagePreview.length

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Send SMS Review Request
          </h1>
          <p className="text-muted-foreground">
            Send personalized review requests to customers
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          SMS Form
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              Customer Information
            </CardTitle>
            <CardDescription>
              Fill in the details to send a review request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cityId" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Service Location
                </Label>
                <Select onValueChange={(value) => setValue('cityId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="technicianId" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Technician
                </Label>
                <Select onValueChange={(value) => setValue('technicianId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map((technician) => (
                      <SelectItem key={technician.id} value={technician.id}>
                        {technician.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer First Name
                </Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer's first name"
                  {...register('customerName', { required: 'Customer name is required' })}
                />
                {errors.customerName && (
                  <p className="text-sm text-red-600">{errors.customerName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Mobile Number
                </Label>
                <Input
                  id="phoneNumber"
                  placeholder="XXX-XXX-XXXX"
                  {...register('phoneNumber', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\d{3}-\d{3}-\d{4}$/,
                      message: 'Please enter a valid phone number (XXX-XXX-XXXX)'
                    }
                  })}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value)
                    setValue('phoneNumber', formatted)
                  }}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={sending}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Review Request
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                  disabled={sending}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              Message Preview
            </CardTitle>
            <CardDescription>
              Preview of the SMS that will be sent to the customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                <div className="whitespace-pre-wrap text-sm min-h-[120px]">
                  {messagePreview}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Character count:</span>
                <Badge variant={characterCount > 160 ? "destructive" : "secondary"}>
                  {characterCount} / 160
                </Badge>
              </div>

              {characterCount > 160 && (
                <p className="text-sm text-orange-600 bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                  ⚠️ Message exceeds 160 characters and may be sent as multiple SMS messages
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}