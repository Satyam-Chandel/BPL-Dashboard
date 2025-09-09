import React, { useState } from 'react'
import { centralizedDb } from '../utils/centralizedDb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Alert, AlertDescription } from './ui/alert'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { 
  Key, 
  Mail, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'

interface ForgotPasswordProps {
  isOpen: boolean
  onClose: () => void
}

interface PasswordResetRequest {
  id: string
  email: string
  userId: string
  token: string
  createdAt: string
  expiresAt: string
  used: boolean
}

export function ForgotPassword({ isOpen, onClose }: ForgotPasswordProps) {
  const [step, setStep] = useState<'request' | 'verify' | 'reset' | 'success'>('request')
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentRequest, setCurrentRequest] = useState<PasswordResetRequest | null>(null)

  // Demo reset requests storage (in real app, this would be in backend)
  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>([])

  const generateResetToken = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setLoading(true)

    try {
      // Find user by email
      const users = centralizedDb.getUsers()
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())

      if (!user) {
        // Don't reveal if email exists for security
        toast.success('If the email exists in our system, you will receive a password reset link')
        setTimeout(() => {
          setLoading(false)
          onClose()
        }, 2000)
        return
      }

      // Generate reset request
      const resetRequest: PasswordResetRequest = {
        id: `reset-${Date.now()}`,
        email: user.email,
        userId: user.id,
        token: generateResetToken(),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        used: false
      }

      setResetRequests(prev => [...prev, resetRequest])
      setCurrentRequest(resetRequest)

      // In real app, send email here
      console.log('🔐 Password Reset Request:', resetRequest)

      toast.success('Password reset instructions sent to your email!')
      setStep('verify')
    } catch (error) {
      console.error('Password reset request error:', error)
      toast.error('Failed to process reset request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetToken) {
      toast.error('Please enter the reset token')
      return
    }

    setLoading(true)

    try {
      // Find valid reset request
      const request = resetRequests.find(r => 
        r.token === resetToken && 
        !r.used && 
        new Date(r.expiresAt) > new Date()
      )

      if (!request) {
        toast.error('Invalid or expired reset token')
        setLoading(false)
        return
      }

      setCurrentRequest(request)
      toast.success('Token verified successfully!')
      setStep('reset')
    } catch (error) {
      console.error('Token verification error:', error)
      toast.error('Failed to verify token. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    if (!currentRequest) {
      toast.error('Invalid reset session')
      return
    }

    setLoading(true)

    try {
      // Update user password in database
      const success = centralizedDb.updateUser(currentRequest.userId, {
        password: newPassword
      })

      if (!success) {
        throw new Error('Failed to update password')
      }

      // Mark reset request as used
      setResetRequests(prev => 
        prev.map(r => 
          r.id === currentRequest.id 
            ? { ...r, used: true }
            : r
        )
      )

      toast.success('Password reset successfully!')
      setStep('success')
    } catch (error) {
      console.error('Password reset error:', error)
      toast.error('Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    // Reset all state when closing
    setStep('request')
    setEmail('')
    setResetToken('')
    setNewPassword('')
    setConfirmPassword('')
    setCurrentRequest(null)
    setLoading(false)
    onClose()
  }

  const getStepProgress = () => {
    switch (step) {
      case 'request': return 25
      case 'verify': return 50
      case 'reset': return 75
      case 'success': return 100
      default: return 0
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            Follow the steps to reset your password securely
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="mb-6">
            <Progress value={getStepProgress()} className="w-full" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Request</span>
              <span>Verify</span>
              <span>Reset</span>
              <span>Complete</span>
            </div>
          </div>

          {step === 'request' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Step 1: Request Reset
                </CardTitle>
                <CardDescription>
                  Enter your email address to receive a reset token
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div>
                    <Label htmlFor="reset-email">Email Address</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@company.com"
                      required
                    />
                  </div>
                  
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      For security, we'll send a reset token to your email. In demo mode, 
                      check the browser console for the token.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 'verify' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Step 2: Verify Token
                </CardTitle>
                <CardDescription>
                  Enter the reset token sent to {email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerifyToken} className="space-y-4">
                  <div>
                    <Label htmlFor="reset-token">Reset Token</Label>
                    <Input
                      id="reset-token"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Enter the token from your email"
                      required
                    />
                  </div>

                  {currentRequest && (
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Demo Mode:</strong> Your reset token is: 
                        <Badge variant="outline" className="mx-2">
                          {currentRequest.token}
                        </Badge>
                        <br />
                        <small>Token expires: {new Date(currentRequest.expiresAt).toLocaleTimeString()}</small>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setStep('request')}
                    >
                      Back
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify Token'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 'reset' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Step 3: Set New Password
                </CardTitle>
                <CardDescription>
                  Choose a strong new password for your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-new-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>Passwords do not match</AlertDescription>
                    </Alert>
                  )}

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Your password should be at least 6 characters long and contain a mix of letters and numbers.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setStep('verify')}
                    >
                      Back
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Updating...' : 'Reset Password'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 'success' && (
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Password Reset Successful!</h3>
                <p className="text-muted-foreground mb-6">
                  Your password has been updated successfully. You can now login with your new password.
                </p>
                
                <Alert className="mb-6">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    For security, you'll need to login again with your new password.
                  </AlertDescription>
                </Alert>

                <Button onClick={handleClose} className="w-full">
                  Close & Login
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}