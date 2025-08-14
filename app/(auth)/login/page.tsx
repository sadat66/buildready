"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthFooter, AuthHero, LoginForm } from "@/components/features/auth";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/shared/loading-spinner";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmingEmail, setIsConfirmingEmail] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signIn, userRole } = useAuth();

  useEffect(() => {
    // Check for confirmation error from URL parameters
    const confirmationError = searchParams.get('error');
    if (confirmationError === 'confirmation_failed') {
      setError("Email confirmation failed. Please try signing up again or contact support.");
    }
    
    // Check if we have a pending confirmation from sessionStorage (page refresh case)
    const tempUserRole = sessionStorage.getItem('tempUserRole');
    if (tempUserRole && !user) {
      setEmailConfirmed(true);
    }
    
    // Handle email confirmation tokens in URL hash (when Supabase redirects here)
    const handleEmailConfirmation = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        setIsConfirmingEmail(true);
        setError(null);
        
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');
        
        if (type === 'signup' && accessToken && refreshToken) {
          try {
            // Use the main Supabase client from the app context
            const { createClient } = await import('~/lib/supabase');
            const supabase = createClient();
            
            // Set the session
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (!error && data.user) {
              // Get user's role from metadata
              const userRole = data.user.user_metadata?.role || 'homeowner';
              
              // Update user's is_verified_email field to true in the database
              try {
                const { error: updateError } = await supabase
                  .from('users')
                  .update({ is_verified_email: true })
                  .eq('id', data.user.id);
                
                if (updateError) {
                  console.error('Failed to update email verification status:', updateError);
                  // Don't fail the whole process for this, just log it
                } else {
                  console.log('Successfully updated is_verified_email to true for user:', data.user.id);
                }
              } catch (updateError) {
                console.error('Error updating email verification status:', updateError);
              }
              
              // Clear the hash from URL to prevent re-processing
              window.location.hash = '';
              
              // Show success state briefly before redirect
              setEmailConfirmed(true);
              setIsConfirmingEmail(false);
              
              // Store the role temporarily for the success message
              sessionStorage.setItem('tempUserRole', userRole);
              
              // Instead of manually redirecting, let the AuthContext handle it
              // The onAuthStateChange listener should detect the new session
              // and the useEffect in this component will redirect to dashboard
              return;
            } else {
              setError("Failed to confirm email. Please try signing up again or contact support.");
              setIsConfirmingEmail(false);
            }
          } catch (error) {
            console.error('Failed to handle email confirmation:', error);
            setError("An error occurred while confirming your email. Please try again or contact support.");
          } finally {
            setIsConfirmingEmail(false);
          }
        } else {
          // No valid tokens found, stop loading
          setIsConfirmingEmail(false);
        }
      }
    };
    
    handleEmailConfirmation();
  }, [searchParams, router, user]);

  // Auto-clear success state after 3 seconds as fallback
  useEffect(() => {
    if (emailConfirmed) {
      const timeout = setTimeout(() => {
        setEmailConfirmed(false);
        // Clean up sessionStorage
        sessionStorage.removeItem('tempUserRole');
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [emailConfirmed]);

  // Clean up sessionStorage when user is authenticated and redirected
  useEffect(() => {
    if (user && userRole) {
      sessionStorage.removeItem('tempUserRole');
      const roleDashboard = `/${userRole}/dashboard`;
      router.push(roleDashboard);
    }
  }, [user, userRole, router]);

  // Show loading state while confirming email
  if (isConfirmingEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center">
            <LoadingSpinner 
              text="Confirming your email..."
              subtitle="Please wait while we set up your account"
              size="lg"
              className="py-12"
            />
          </div>
        </div>
      </div>
    );
  }

  // Show success state briefly after email confirmation
  if (emailConfirmed) {
    const tempUserRole = sessionStorage.getItem('tempUserRole') || 'homeowner';
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Email Confirmed!</h2>
            <p className="text-gray-600 mb-4">
              Welcome to BuildReady! Your {tempUserRole} account has been successfully verified.
            </p>
            <LoadingSpinner 
              text="Redirecting to dashboard..."
              subtitle="Setting up your account"
              size="md"
            />
          </div>
        </div>
      </div>
    );
  }

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Attempting sign-in with:", email);
      const {
        user: signedInUser,
        userRole: signInUserRole,
        error,
      } = await signIn(email, password);

      console.log("Sign-in result:", { signedInUser, signInUserRole, error });

      if (error) {
        if (error.includes("Invalid login credentials")) {
          setError(
            "Invalid email or password. Please check your credentials and try again."
          );
        } else if (error.includes("Email not confirmed")) {
          setError(
            "Please check your email and confirm your account before signing in."
          );
        } else if (error.includes("Too many requests")) {
          setError(
            "Too many failed attempts. Please wait a moment before trying again."
          );
        } else {
          setError(error);
        }
      } else if (signedInUser) {
        console.log(
          "Sign-in successful, redirecting to role-specific dashboard..."
        );

        if (signInUserRole) {
          const roleDashboard = `/${signInUserRole}/dashboard`;
          console.log(`Redirecting to ${roleDashboard}`);

          try {
            router.push(roleDashboard);

            setTimeout(() => {
              if (window.location.pathname !== roleDashboard) {
                console.log("Router failed, using window.location fallback");
                window.location.href = roleDashboard;
              }
            }, 1000);
          } catch (error) {
            console.error(
              "Router error, using window.location fallback:",
              error
            );
            window.location.href = roleDashboard;
          }
        } else {
          console.log(
            "User role not available, redirecting to generic dashboard"
          );
          router.push("/dashboard");
        }
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (data: { email: string; password: string }) => {
    await handleSignIn(data.email, data.password);
  };

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-lg space-y-6">
        <AuthHero
          title={
            <>
              Welcome Back to
              <span className="block text-orange-600">BuildReady</span>
            </>
          }
          description="Sign in to access your projects, manage contracts, and continue building your home improvement journey."
          maxWidth="md"
        />

        <LoginForm
          onSubmit={handleLogin}
          isLoading={isLoading}
          error={error || undefined}
        />

        <AuthFooter />
      </div>
    </div>
  );
}
