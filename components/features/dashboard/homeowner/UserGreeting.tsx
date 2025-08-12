'use client'

interface UserGreetingProps {
  userEmail?: string
}

export default function UserGreeting({ userEmail }: UserGreetingProps) {
  const firstName = userEmail ? userEmail.split('@')[0] : 'Homeowner'
  
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {firstName}!
        </h1>
        <p className="text-lg text-muted-foreground">
          You are signed in as <span className="font-semibold">Homeowner</span>
        </p>
      </div>
      <p className="text-muted-foreground text-base max-w-2xl">
        Manage your home improvement projects and track their progress all in one place.
      </p>
    </div>
  )
}
