import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface FormActionsProps {
  loading: boolean
}

export function FormActions({ loading }: FormActionsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-end space-x-4">
        <Link href="/homeowner/dashboard">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating Project..." : "Post Project"}
        </Button>
      </div>
    </div>
  )
}
