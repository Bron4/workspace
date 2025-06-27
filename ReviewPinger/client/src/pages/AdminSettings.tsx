import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, MapPin, MessageSquare, Save, Edit, Link, Shield, Plus, Trash2, Users } from 'lucide-react'
import { getCityConfigurations, createCity, updateCityConfiguration, deleteCity, getMessageTemplate, updateMessageTemplate } from '@/api/admin'
import { getTechnicians, createTechnician, deleteTechnician } from '@/api/technicians'
import { useToast } from '@/hooks/useToast'

interface CityConfig {
  id: string
  name: string
  googleReviewLink: string
  isActive: boolean
  createdAt: string
}

interface EditingCity {
  id: string
  name: string
  googleReviewLink: string
}

interface NewCityForm {
  name: string
  googleReviewLink: string
}

interface Technician {
  id: string
  name: string
  email: string
  phone: string
  cityId: string
  cityName: string
}

interface NewTechnicianForm {
  name: string
  email: string
  phone: string
  cityId: string
}

export function AdminSettings() {
  const [cityConfigs, setCityConfigs] = useState<CityConfig[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [messageTemplate, setMessageTemplate] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingCity, setEditingCity] = useState<EditingCity | null>(null)
  const [showAddCityDialog, setShowAddCityDialog] = useState(false)
  const [showAddTechnicianDialog, setShowAddTechnicianDialog] = useState(false)
  const { toast } = useToast()

  const { register, handleSubmit, setValue, watch } = useForm<{ template: string }>()
  const { register: registerNewCity, handleSubmit: handleSubmitNewCity, reset: resetNewCity, formState: { errors: newCityErrors } } = useForm<NewCityForm>()
  const { register: registerNewTechnician, handleSubmit: handleSubmitNewTechnician, reset: resetNewTechnician, setValue: setTechnicianValue, formState: { errors: newTechnicianErrors } } = useForm<NewTechnicianForm>()
  const templateValue = watch('template')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log('Frontend: Loading admin settings data')
      const [citiesResponse, templateResponse, techniciansResponse] = await Promise.all([
        getCityConfigurations() as Promise<{ cities: CityConfig[] }>,
        getMessageTemplate() as Promise<{ template: string }>,
        getTechnicians() as Promise<{ technicians: Technician[] }>
      ])

      console.log('Frontend: Received cities response:', citiesResponse)
      console.log('Frontend: Received template response:', templateResponse)
      console.log('Frontend: Received technicians response:', techniciansResponse)

      setCityConfigs(citiesResponse.cities)
      setMessageTemplate(templateResponse.template)
      setTechnicians(techniciansResponse.technicians)
      setValue('template', templateResponse.template)
    } catch (error) {
      console.error('Frontend: Error loading admin settings:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load admin settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCity = async (data: NewCityForm) => {
    try {
      setSaving(true)
      console.log('Frontend: Creating new city with data:', data)

      const response = await createCity(data) as { success: boolean; message: string; city: CityConfig }
      console.log('Frontend: Create city response:', response)

      if (response.success) {
        console.log('Frontend: Adding new city to state:', response.city)
        setCityConfigs(prev => [...prev, response.city])
        setShowAddCityDialog(false)
        resetNewCity()
        toast({
          title: "Success!",
          description: response.message,
          variant: "default",
        })
      }
    } catch (error) {
      console.error('Frontend: Error creating city:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create city",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCreateTechnician = async (data: NewTechnicianForm) => {
    try {
      setSaving(true)
      console.log('Frontend: Creating new technician with data:', data)

      const response = await createTechnician(data) as { message: string; technician: Technician }
      console.log('Frontend: Create technician response:', response)

      console.log('Frontend: Adding new technician to state:', response.technician)
      setTechnicians(prev => [...prev, response.technician])
      setShowAddTechnicianDialog(false)
      resetNewTechnician()
      toast({
        title: "Success!",
        description: response.message,
        variant: "default",
      })
    } catch (error) {
      console.error('Frontend: Error creating technician:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create technician",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateCity = async (cityId: string, name: string, googleReviewLink: string) => {
    try {
      setSaving(true)
      console.log('Frontend: Updating city with ID:', cityId)
      console.log('Frontend: Update data:', { name, googleReviewLink })

      const response = await updateCityConfiguration(cityId, { name, googleReviewLink }) as { success: boolean; message: string; city: CityConfig }
      console.log('Frontend: Update city response:', response)

      if (response.success) {
        console.log('Frontend: Updating city in state:', response.city)
        setCityConfigs(prev => prev.map(city =>
          city.id === cityId ? response.city : city
        ))
        setEditingCity(null)
        toast({
          title: "Success!",
          description: response.message,
          variant: "default",
        })
      }
    } catch (error) {
      console.error('Frontend: Error updating city configuration:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update city configuration",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCity = async (cityId: string) => {
    try {
      setSaving(true)
      console.log('Frontend: Deleting city with ID:', cityId)

      const response = await deleteCity(cityId) as { success: boolean; message: string }
      console.log('Frontend: Delete city response:', response)

      if (response.success) {
        console.log('Frontend: Removing city from state with ID:', cityId)
        setCityConfigs(prev => prev.filter(city => city.id !== cityId))
        toast({
          title: "Success!",
          description: response.message,
          variant: "default",
        })
      }
    } catch (error) {
      console.error('Frontend: Error deleting city:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete city",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTechnician = async (technicianId: string) => {
    try {
      setSaving(true)
      console.log('Frontend: Deleting technician with ID:', technicianId)

      const response = await deleteTechnician(technicianId) as { message: string }
      console.log('Frontend: Delete technician response:', response)

      console.log('Frontend: Removing technician from state with ID:', technicianId)
      setTechnicians(prev => prev.filter(technician => technician.id !== technicianId))
      toast({
        title: "Success!",
        description: response.message,
        variant: "default",
      })
    } catch (error) {
      console.error('Frontend: Error deleting technician:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete technician",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateTemplate = async (data: { template: string }) => {
    try {
      setSaving(true)
      console.log('Frontend: Updating message template:', data)

      const response = await updateMessageTemplate(data) as { success: boolean; message: string }
      console.log('Frontend: Update template response:', response)

      if (response.success) {
        setMessageTemplate(data.template)
        toast({
          title: "Success!",
          description: response.message,
          variant: "default",
        })
      }
    } catch (error) {
      console.error('Frontend: Error updating message template:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update message template",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const generatePreview = () => {
    if (!templateValue) return "No template available"

    return templateValue
      .replace('{customerName}', 'John Smith')
      .replace('{googleReviewLink}', 'https://g.page/r/bates-electric-atlanta/review')
      .replace('{technicianName}', 'Mike Johnson')
  }

  const handleEditClick = (city: CityConfig) => {
    console.log('Frontend: Starting edit for city:', city)
    setEditingCity({ id: city.id, name: city.name, googleReviewLink: city.googleReviewLink })
  }

  const handleCancelEdit = () => {
    console.log('Frontend: Cancelling edit')
    setEditingCity(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
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
            Admin Settings
          </h1>
          <p className="text-muted-foreground">
            Manage city configurations, technicians, and SMS message templates
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Admin Only
        </Badge>
      </div>

      <Tabs defaultValue="cities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cities" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            City Configurations
          </TabsTrigger>
          <TabsTrigger value="technicians" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Technician Management
          </TabsTrigger>
          <TabsTrigger value="template" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Message Template
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cities" className="space-y-6">
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    City Google Review Links
                  </CardTitle>
                  <CardDescription>
                    Configure the Google review link for each service location
                  </CardDescription>
                </div>
                <Dialog open={showAddCityDialog} onOpenChange={setShowAddCityDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add City
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New City</DialogTitle>
                      <DialogDescription>
                        Create a new city configuration with Google review link
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitNewCity(handleCreateCity)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">City Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter city name"
                          {...registerNewCity('name', { required: 'City name is required' })}
                        />
                        {newCityErrors.name && (
                          <p className="text-sm text-red-600">{newCityErrors.name.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="googleReviewLink">Google Review Link</Label>
                        <Input
                          id="googleReviewLink"
                          placeholder="Enter Google review link"
                          {...registerNewCity('googleReviewLink', { required: 'Google review link is required' })}
                        />
                        {newCityErrors.googleReviewLink && (
                          <p className="text-sm text-red-600">{newCityErrors.googleReviewLink.message}</p>
                        )}
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowAddCityDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={saving}>
                          {saving ? 'Creating...' : 'Create City'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>City</TableHead>
                    <TableHead>Google Review Link</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cityConfigs.map((city) => (
                    <TableRow key={city.id}>
                      <TableCell className="font-medium">
                        {editingCity?.id === city.id ? (
                          <Input
                            value={editingCity.name}
                            onChange={(e) => {
                              console.log('Frontend: Updating city name in edit state:', e.target.value)
                              setEditingCity({ ...editingCity, name: e.target.value })
                            }}
                            placeholder="Enter city name"
                            className="min-w-[150px]"
                          />
                        ) : (
                          city.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingCity?.id === city.id ? (
                          <Input
                            value={editingCity.googleReviewLink}
                            onChange={(e) => {
                              console.log('Frontend: Updating Google review link in edit state:', e.target.value)
                              setEditingCity({ ...editingCity, googleReviewLink: e.target.value })
                            }}
                            placeholder="Enter Google review link"
                            className="min-w-[300px]"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Link className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-mono truncate max-w-[300px]">
                              {city.googleReviewLink}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={city.isActive ? "default" : "secondary"}>
                          {city.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {editingCity?.id === city.id ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                console.log('Frontend: Save button clicked for city:', editingCity)
                                handleUpdateCity(city.id, editingCity.name, editingCity.googleReviewLink)
                              }}
                              disabled={saving}
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                              disabled={saving}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditClick(city)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the city "{city.name}" and remove all associated data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteCity(city.id)}
                                    disabled={saving}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {saving ? 'Deleting...' : 'Delete'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technicians" className="space-y-6">
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    Technician Management
                  </CardTitle>
                  <CardDescription>
                    Manage technicians and their city assignments
                  </CardDescription>
                </div>
                <Dialog open={showAddTechnicianDialog} onOpenChange={setShowAddTechnicianDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Technician
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Technician</DialogTitle>
                      <DialogDescription>
                        Create a new technician and assign them to a city
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitNewTechnician(handleCreateTechnician)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="techName">Technician Name</Label>
                        <Input
                          id="techName"
                          placeholder="Enter technician name"
                          {...registerNewTechnician('name', { required: 'Technician name is required' })}
                        />
                        {newTechnicianErrors.name && (
                          <p className="text-sm text-red-600">{newTechnicianErrors.name.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="techEmail">Email</Label>
                        <Input
                          id="techEmail"
                          type="email"
                          placeholder="Enter email address"
                          {...registerNewTechnician('email', {
                            required: 'Email is required',
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: 'Invalid email format'
                            }
                          })}
                        />
                        {newTechnicianErrors.email && (
                          <p className="text-sm text-red-600">{newTechnicianErrors.email.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="techPhone">Phone</Label>
                        <Input
                          id="techPhone"
                          placeholder="Enter phone number"
                          {...registerNewTechnician('phone', { required: 'Phone number is required' })}
                        />
                        {newTechnicianErrors.phone && (
                          <p className="text-sm text-red-600">{newTechnicianErrors.phone.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="techCity">City</Label>
                        <Select onValueChange={(value) => setTechnicianValue('cityId', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a city" />
                          </SelectTrigger>
                          <SelectContent>
                            {cityConfigs.map((city) => (
                              <SelectItem key={city.id} value={city.id}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {newTechnicianErrors.cityId && (
                          <p className="text-sm text-red-600">{newTechnicianErrors.cityId.message}</p>
                        )}
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowAddTechnicianDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={saving}>
                          {saving ? 'Creating...' : 'Create Technician'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {technicians.map((technician) => (
                    <TableRow key={technician.id}>
                      <TableCell className="font-medium">{technician.name}</TableCell>
                      <TableCell>{technician.email}</TableCell>
                      <TableCell>{technician.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{technician.cityName}</Badge>
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the technician "{technician.name}" and remove all associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTechnician(technician.id)}
                                disabled={saving}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {saving ? 'Deleting...' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="template" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  SMS Message Template
                </CardTitle>
                <CardDescription>
                  Customize the SMS message template sent to customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(handleUpdateTemplate)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template">Message Template</Label>
                    <Textarea
                      id="template"
                      placeholder="Enter your message template..."
                      className="min-h-[200px]"
                      {...register('template', { required: 'Template is required' })}
                    />
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p><strong>Available variables:</strong></p>
                      <p>• <code>{'{customerName}'}</code> - Customer's first name</p>
                      <p>• <code>{'{technicianName}'}</code> - Technician's first name</p>
                      <p>• <code>{'{googleReviewLink}'}</code> - City-specific Google review link</p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Template
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  Template Preview
                </CardTitle>
                <CardDescription>
                  Preview of how the message will appear to customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <div className="whitespace-pre-wrap text-sm">
                      {generatePreview()}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p><strong>Sample data used:</strong></p>
                    <p>• Customer: John Smith</p>
                    <p>• Technician: Mike Johnson</p>
                    <p>• City: Atlanta (sample link)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}