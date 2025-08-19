"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface FormMultiSelectOption {
  value: string
  label: string
}

export interface FormMultiSelectProps {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  containerClassName?: string
  placeholder?: string
  options: FormMultiSelectOption[]
  value?: string[]
  onChange?: (value: string[]) => void
  disabled?: boolean
  searchable?: boolean
  maxDisplayItems?: number
}

const FormMultiSelect = React.forwardRef<HTMLButtonElement, FormMultiSelectProps>(
  ({ 
    label, 
    error, 
    helperText, 
    required, 
    containerClassName,
    placeholder = "Select options...",
    options,
    value = [],
    onChange,
    disabled = false,
    searchable = true,
    maxDisplayItems = 3
  }, ref) => {
    const [open, setOpen] = React.useState(false)
    const selectId = `form-multi-select-${Math.random().toString(36).substr(2, 9)}`
    
    const handleSelect = (currentValue: string) => {
      if (disabled) return
      
      const currentValues = value || []
      let newValues: string[]
      
      if (currentValues.includes(currentValue)) {
        newValues = currentValues.filter(v => v !== currentValue)
      } else {
        newValues = [...currentValues, currentValue]
      }
      
      onChange?.(newValues)
      // Keep popover open for multi-selection
    }
    
    const handleRemoveItem = (itemToRemove: string) => {
      if (disabled) return
      const newValues = value?.filter(item => item !== itemToRemove) || []
      onChange?.(newValues)
    }
    
    const handleClearAll = () => {
      if (disabled) return
      onChange?.([])
    }
    
    const selectedOptions = options.filter(option => value?.includes(option.value))
    const displayText = React.useMemo(() => {
      if (!value || value.length === 0) return placeholder
      if (value.length === 1) {
        const option = options.find(opt => opt.value === value[0])
        return option?.label || value[0]
      }
      return `${value.length} selected`
    }, [value, options, placeholder])
    
    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <Label htmlFor={selectId} className="text-sm font-medium text-gray-900">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className={cn(
                "w-full justify-between h-auto min-h-[40px] px-3 py-2 text-left font-normal",
                "focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                error && "border-red-500 focus:ring-red-500",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex-1 min-w-0">
                {selectedOptions.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedOptions.slice(0, maxDisplayItems).map((option) => (
                      <Badge 
                        key={option.value} 
                        variant="secondary" 
                        className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {option.label}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveItem(option.value)
                          }}
                          className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove {option.label}</span>
                        </button>
                      </Badge>
                    ))}
                    {selectedOptions.length > maxDisplayItems && (
                      <Badge variant="outline" className="text-xs px-2 py-1">
                        +{selectedOptions.length - maxDisplayItems} more
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command>
              {searchable && (
                <CommandInput 
                  placeholder="Search options..." 
                  className="h-9"
                />
              )}
              <CommandList>
                <CommandEmpty>No options found.</CommandEmpty>
                
                {selectedOptions.length > 0 && (
                  <CommandGroup heading={`Selected (${selectedOptions.length})`}>
                    {selectedOptions.map((option) => (
                      <CommandItem
                        key={`selected-${option.value}`}
                        value={option.value}
                        onSelect={() => handleSelect(option.value)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <Check className="mr-2 h-4 w-4 text-blue-600" />
                          {option.label}
                        </div>
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                          Selected
                        </Badge>
                      </CommandItem>
                    ))}
                    
                    {selectedOptions.length > 0 && (
                      <CommandItem
                        value="clear-all"
                        onSelect={() => handleClearAll()}
                        className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Clear all selections
                      </CommandItem>
                    )}
                  </CommandGroup>
                )}
                
                <CommandGroup heading="Available">
                  {options
                    .filter(option => !value?.includes(option.value))
                    .map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => handleSelect(option.value)}
                        className="flex items-center"
                      >
                        <div className="mr-2 h-4 w-4 border border-gray-300 rounded"></div>
                        {option.label}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        {helperText && (
          <p className="text-xs text-gray-600">{helperText}</p>
        )}
        
        {error && (
          <p className="text-sm text-red-600 font-medium">{error}</p>
        )}
      </div>
    )
  }
)

FormMultiSelect.displayName = "FormMultiSelect"

export { FormMultiSelect }