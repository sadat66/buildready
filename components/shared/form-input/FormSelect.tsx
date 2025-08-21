import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface FormSelectOption {
  value: string
  label: string
}

export interface FormSelectProps {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  containerClassName?: string
  placeholder?: string
  options: FormSelectOption[]
  value?: string
  onChange?: (value: string) => void
  onValueChange?: (value: string) => void
  disabled?: boolean
}

const FormSelect = React.forwardRef<HTMLButtonElement, FormSelectProps>(
  ({ 
    label, 
    error, 
    helperText, 
    required, 
    containerClassName,
    placeholder = "Select an option",
    options,
    value,
    onChange,
    onValueChange,
    disabled = false
  }, ref) => {
    const selectId = `form-select-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <Label htmlFor={selectId} className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <Select 
          value={value} 
          onValueChange={(val) => {
            onValueChange?.(val);
            onChange?.(val);
          }}
          disabled={disabled}
        >
          <SelectTrigger 
            ref={ref}
            className={cn(
              error && "border-red-500 focus:ring-red-500"
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
FormSelect.displayName = "FormSelect"

export { FormSelect }
