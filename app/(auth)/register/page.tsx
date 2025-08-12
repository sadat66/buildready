"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AuthFooter,
  AuthHero,
  RegistrationForm,
} from "@/components/features/auth";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/components/providers/TRPCProvider";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, userRole } = useAuth();

  useEffect(() => {
    if (user && userRole) {
      const roleDashboard = `/${userRole}/dashboard`;
      router.push(roleDashboard);
    }
  }, [user, userRole, router]);

  const signUpMutation = api.auth.signUp.useMutation({
    onError: (error) => {
      let errorMessage = "";
      if (error.message.includes("User already registered")) {
        errorMessage =
          "An account with this email already exists. Please sign in instead.";
      } else if (error.message.includes("Password should be at least")) {
        errorMessage = "Password must be at least 6 characters long.";
      } else {
        errorMessage = error.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    },
    onSuccess: (result) => {
      if (result.user) {
        toast.success(
          "Registration successful! Please check your email to confirm your account before signing in."
        );
      }
      setIsLoading(false);
    },
  });

  const handleRegistration = async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    user_role: "homeowner" | "contractor";
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      if (
        !data.email ||
        !data.password ||
        !data.first_name ||
        !data.user_role
      ) {
        const errorMessage = "Please fill in all required fields";
        setError(errorMessage);
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      signUpMutation.mutate({
        email: data.email,
        password: data.password,
        fullName: `${data.first_name} ${data.last_name}`,
        role: data.user_role,
      });
    } catch (error) {
      console.error("Unexpected error in handleRegistration:", error);
      const errorMessage = "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-4xl space-y-6">
        <AuthHero
          title={
            <>
              Join the Future of
              <span className="block text-orange-600">Home Improvement</span>
            </>
          }
          description="Connect with qualified contractors, manage your projects, and transform your home with confidence. Join thousands of homeowners and contractors who trust BuildReady."
          maxWidth="2xl"
        />

        <RegistrationForm
          onSubmit={handleRegistration}
          isLoading={isLoading}
          error={error || undefined}
        />

        <AuthFooter />
      </div>
    </div>
  );
}
