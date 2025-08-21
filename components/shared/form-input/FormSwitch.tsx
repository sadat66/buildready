import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export interface FormSwitchProps {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  containerClassName?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}

const FormSwitch = React.forwardRef<HTMLButtonElement, FormSwitchProps>(
  ({ 
    label, 
    error, 
    helperText, 
    required, 
    containerClassName,
    checked,
    onCheckedChange,
    disabled = false
  }, ref) => {
    const switchId = `form-switch-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className={cn("space-y-2", containerClassName)}>
        <div className="flex items-center space-x-2">
          <Switch
            id={switchId}
            ref={ref}
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
          />
          {label && (
            <Label htmlFor={switchId} className="text-sm font-medium text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          )}
        </div>
        {helperText && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)
FormSwitch.displayName = "FormSwitch"

export { FormSwitch }
