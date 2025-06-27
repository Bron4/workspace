import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { MessageSquare, Plus, Edit, Trash2, Star, Calendar, Clock } from 'lucide-react'
import { getSMSTemplates, getSMSTemplateById, createSMSTemplate, updateSMSTemplate, deleteSMSTemplate } from '@/api/sms'
import { useToast } from '@/hooks/useToast'

interface SMSTemplate {
  id: string
  name: string
  content: string
  description?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

interface TemplateFormData {
  name: string
  content: string
  description?: string
  isDefault: boolean
}

export function SMSTemplates() {
  const [templates, setTemplates] = useState<SMSTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<SMSTemplate | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const { toast } = useToast()

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TemplateFormData>()
  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, setValue: setValueEdit, formState: { errors: errorsEdit } } = useForm<TemplateFormData>()

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      console.log('Frontend: Loading SMS templates')
      const response = await getSMSTemplates() as { templates: SMSTemplate[] }
      console.log('Frontend: Received templates response:', response)
      setTemplates(response.templates)
    } catch (error) {
      console.error('Frontend: Error loading SMS templates:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load SMS templates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async (data: TemplateFormData) => {
    try {
      setSaving(true)
      console.log('Frontend: Creating new SMS template:', data)

      const response = await createSMSTemplate(data) as { success: boolean; message: string; template: SMSTemplate }
      console.log('Frontend: Create template response:', response)

      if (response.success) {
        setTemplates(prev => [response.template, ...prev])
        setShowCreateDialog(false)
        reset()
        toast({
          title: "Success!",
          description: response.message,
          variant: "default",
        })
      }
    } catch (error) {
      console.error('Frontend: Error creating SMS template:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create SMS template",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateTemplate = async (data: TemplateFormData) => {
    if (!selectedTemplate) return

    try {
      setSaving(true)
      console.log('Frontend: Updating SMS template:', selectedTemplate.id, data)

      const response = await updateSMSTemplate(selectedTemplate.id, data) as { success: boolean; message: string; template: SMSTemplate }
      console.log('Frontend: Update template response:', response)

      if (response.success) {
        setTemplates(prev => prev.map(template =>
          template.id === selectedTemplate.id ? response.template : template
        ))
        setShowEditDialog(false)
        setSelectedTemplate(null)
        resetEdit()
        toast({
          title: "Success!",
          description: response.message,
          variant: "default",
        })
      }
    } catch (error) {
      console.error('Frontend: Error updating SMS template:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update SMS template",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      setSaving(true)
      console.log('Frontend: Deleting SMS template:', templateId)

      const response = await deleteSMSTemplate(templateId) as { success: boolean; message: string }
      console.log('Frontend: Delete template response:', response)

      if (response.success) {
        setTemplates(prev => prev.filter(template => template.id !== templateId))
        toast({
          title: "Success!",
          description: response.message,
          variant: "default",
        })
      }
    } catch (error) {
      console.error('Frontend: Error deleting SMS template:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete SMS template",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleViewTemplate = async (template: SMSTemplate) => {
    try {
      console.log('Frontend: Viewing SMS template:', template.id)
      const response = await getSMSTemplateById(template.id) as { template: SMSTemplate }
      setSelectedTemplate(response.template)
      setShowViewDialog(true)
    } catch (error) {
      console.error('Frontend: Error loading template details:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load template details",
        variant: "destructive",
      })
    }
  }

  const handleEditTemplate = (template: SMSTemplate) => {
    setSelectedTemplate(template)
    setValueEdit('name', template.name)
    setValueEdit('content', template.content)
    setValueEdit('description', template.description || '')
    setValueEdit('isDefault', template.isDefault)
    setShowEditDialog(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
            SMS Templates
          </h1>
          <p className="text-muted-foreground">
            Manage your SMS message templates for customer communications
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New SMS Template</DialogTitle>
              <DialogDescription>
                Create a new SMS template for customer communications
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleCreateTemplate)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  placeholder="Enter template name"
                  {...register('name', { required: 'Template name is required' })}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Template Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter your message template..."
                  className="min-h-[150px]"
                  {...register('content', { required: 'Template content is required' })}
                />
                {errors.content && (
                  <p className="text-sm text-red-600">{errors.content.message}</p>
                )}
                <div className="text-xs text-muted-foreground">
                  <p><strong>Available variables:</strong> {'{customerName}'}, {'{technicianName}'}, {'{googleReviewLink}'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Enter template description"
                  {...register('description')}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  onCheckedChange={(checked) => setValue('isDefault', checked)}
                />
                <Label htmlFor="isDefault">Set as default template</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Template'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            SMS Templates ({templates.length})
          </CardTitle>
          <CardDescription>
            Manage and organize your SMS message templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Content Preview</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {template.name}
                      {template.isDefault && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Default
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate text-sm text-muted-foreground">
                      {template.content}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(template.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(template.updatedAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewTemplate(template)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTemplate(template)}
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
                              This action cannot be undone. This will permanently delete the template "{template.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTemplate(template.id)}
                              disabled={saving}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {saving ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Template Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTemplate?.isDefault && <Star className="h-4 w-4 text-yellow-500" />}
              {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Template details and preview
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Content</Label>
                <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm">{selectedTemplate.content}</pre>
                </div>
              </div>
              {selectedTemplate.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedTemplate.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="mt-1 text-muted-foreground">{formatDate(selectedTemplate.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="mt-1 text-muted-foreground">{formatDate(selectedTemplate.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit SMS Template</DialogTitle>
            <DialogDescription>
              Update the SMS template information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit(handleUpdateTemplate)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Template Name</Label>
              <Input
                id="editName"
                placeholder="Enter template name"
                {...registerEdit('name', { required: 'Template name is required' })}
              />
              {errorsEdit.name && (
                <p className="text-sm text-red-600">{errorsEdit.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="editContent">Template Content</Label>
              <Textarea
                id="editContent"
                placeholder="Enter your message template..."
                className="min-h-[150px]"
                {...registerEdit('content', { required: 'Template content is required' })}
              />
              {errorsEdit.content && (
                <p className="text-sm text-red-600">{errorsEdit.content.message}</p>
              )}
              <div className="text-xs text-muted-foreground">
                <p><strong>Available variables:</strong> {'{customerName}'}, {'{technicianName}'}, {'{googleReviewLink}'}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDescription">Description (Optional)</Label>
              <Input
                id="editDescription"
                placeholder="Enter template description"
                {...registerEdit('description')}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="editIsDefault"
                onCheckedChange={(checked) => setValueEdit('isDefault', checked)}
                defaultChecked={selectedTemplate?.isDefault}
              />
              <Label htmlFor="editIsDefault">Set as default template</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Updating...' : 'Update Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}