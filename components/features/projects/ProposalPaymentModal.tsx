'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { CreditCard, Lock, Shield } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ProposalPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess: () => void
  projectTitle?: string
}

export function ProposalPaymentModal({ 
  isOpen, 
  onClose, 
  onPaymentSuccess,
  projectTitle 
}: ProposalPaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    // Basic validation
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      toast.error('Please fill in all payment details')
      return
    }

    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      toast.success('Demo payment successful! You can now submit proposals.')
      onPaymentSuccess()
      
      // Reset form
      setCardNumber('')
      setExpiryDate('')
      setCvv('')
      setCardholderName('')
    }, 2000)
  }

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Proposal Submission Fee
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Fee Information */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">Proposal Submission</h3>
                  {projectTitle && (
                    <p className="text-sm text-blue-700 mt-1">
                      For: {projectTitle}
                    </p>
                  )}
                  <p className="text-xs text-blue-600 mt-2">
                    One-time fee to submit your proposal
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-900">$9.99</div>
                  <div className="text-xs text-blue-600">USD</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demo Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Demo Mode</span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              This is a demonstration. Enter any card details to proceed.
            </p>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={4}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                placeholder="John Doe"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
              />
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Lock className="h-3 w-3" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePayment}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Pay $9.99'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}