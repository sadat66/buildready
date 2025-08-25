"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Lock, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe, elementsOptions } from "~/lib/stripe/client";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  userType: "homeowner" | "contractor";
  projectTitle?: string;
}

interface PaymentFormProps {
  amount: number;
  title: string;
  description: string;
  userType: "homeowner" | "contractor";
  projectTitle?: string;
  onPaymentSuccess: () => void;
  onClose: () => void;
}

// Payment form component that handles Stripe Elements
function PaymentForm({
  amount,
  title,
  description,
  userType,
  projectTitle,
  onPaymentSuccess,
  onClose,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const { user } = useAuth();

  // Create payment intent when component mounts
  useEffect(() => {
    if (!user) return;

    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            amount: Math.round(amount * 100), // Convert to cents
            currency: "usd",
            description: title,
            userType,
            metadata: projectTitle ? { projectTitle } : undefined,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Payment intent creation error:', error);
        toast.error(error instanceof Error ? error.message : "Failed to initialize payment");
      }
    };

    createPaymentIntent();
  }, [amount, title, userType, projectTitle, user]);

  const handlePayment = async () => {
    if (!stripe || !elements || !clientSecret) {
      toast.error("Payment system not ready. Please try again.");
      return;
    }

    setIsProcessing(true);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Payment failed");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        const successMessage = userType === "homeowner"
          ? "Payment successful! You can now create projects."
          : "Payment successful! You can now submit proposals.";
        toast.success(successMessage);
        onPaymentSuccess();
      } else {
        toast.error("Payment was not completed. Please try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Fee Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">{title}</h3>
              {projectTitle && (
                <p className="text-sm text-blue-700 mt-1">
                  For: {projectTitle}
                </p>
              )}
              <p className="text-xs text-blue-600 mt-2">{description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">
                ${amount}
              </div>
              <div className="text-xs text-blue-600">USD</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      {clientSecret ? (
        <div className="space-y-4">
          <PaymentElement
            options={{
              layout: "tabs",
            }}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Initializing payment...</span>
        </div>
      )}

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
          disabled={isProcessing || !clientSecret || !stripe || !elements}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            `Pay $${amount}`
          )}
        </Button>
      </div>
    </div>
  );
}

export function PaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  userType,
  projectTitle,
}: PaymentModalProps) {
  const [stripePromise] = useState(() => getStripe());

  const isHomeowner = userType === "homeowner";
  const amount = isHomeowner ? 29.99 : 9.99;
  const title = isHomeowner
    ? "Project Creation Fee"
    : "Proposal Submission Fee";
  const description = isHomeowner
    ? "One-time fee to unlock project creation features"
    : "One-time fee to submit your proposal";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <Elements stripe={stripePromise} options={elementsOptions}>
          <PaymentForm
            amount={amount}
            title={title}
            description={description}
            userType={userType}
            projectTitle={projectTitle}
            onPaymentSuccess={onPaymentSuccess}
            onClose={onClose}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}
