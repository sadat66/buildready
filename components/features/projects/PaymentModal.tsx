"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Lock, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, onPaymentSuccess }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardholderName: "",
  });

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    // Format card number with spaces
    if (field === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };



  const handlePayment = async () => {
    if (!formData.cardNumber.trim() || !formData.cardholderName.trim()) {
      toast.error("Please fill in all payment details");
      return;
    }

    setIsProcessing(true);

    // Simulate quick payment processing
    setTimeout(() => {
      setPaymentComplete(true);
      setIsProcessing(false);
      toast.success("Payment successful! You can now create projects.");
      
      // Show success briefly, then complete
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
        setPaymentComplete(false);
        setFormData({
          cardNumber: "",
          cardholderName: "",
        });
      }, 1000);
    }, 1000);
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Demo Payment Required
          </DialogTitle>
          <DialogDescription>
            For demo purposes, please complete a $29 payment to unlock project creation features.
          </DialogDescription>
        </DialogHeader>

        {paymentComplete ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-700">Payment Successful!</h3>
            <p className="text-sm text-gray-600 text-center mt-2">
              You can now create unlimited projects.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Payment Amount */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Demo Access Fee</span>
                  <span className="text-2xl font-bold">$29.00</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  One-time payment for demo access
                </p>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  placeholder="John Doe"
                  value={formData.cardholderName}
                  onChange={(e) => handleInputChange("cardholderName", e.target.value)}
                  disabled={isProcessing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                  maxLength={19}
                  disabled={isProcessing}
                />
              </div>



              <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                <Lock className="h-3 w-3" />
                <span>Your payment information is secure and encrypted</span>
              </div>
            </div>
          </div>
        )}

        {!paymentComplete && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="min-w-[120px]"
            >
              {isProcessing ? "Processing..." : "Pay $29.00"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}