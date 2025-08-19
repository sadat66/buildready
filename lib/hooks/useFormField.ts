'use client'

import { useFormContext, FieldPath, FieldValues, ControllerRenderProps, PathValue } from "react-hook-form"

export interface UseFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName
}

export function useFormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ name }: UseFormFieldProps<TFieldValues, TName>) {
  const { getFieldState, formState, getValues, setValue, watch } = useFormContext<TFieldValues>()
  
  const fieldState = getFieldState(name, formState)
  const error = fieldState?.error?.message
  
  // Create a properly typed field object that matches ControllerRenderProps exactly
  const field: ControllerRenderProps<TFieldValues, TName> = {
    name,
    value: watch(name) as PathValue<TFieldValues, TName>,
    onChange: (event: any) => {
      // Handle different input types properly
      let value: any
      
      if (event && typeof event === 'object') {
        // Handle React synthetic events
        if (event.target) {
          const target = event.target
          if (target.type === 'checkbox') {
            value = target.checked
          } else if (target.type === 'file') {
            value = target.files
          } else {
            value = target.value
          }
        } else if (event.value !== undefined) {
          // Handle custom components that pass { value } directly
          value = event.value
        } else {
          // Fallback: use the event itself if it's a primitive
          value = event
        }
      } else {
        // Handle primitive values directly
        value = event
      }
      
      setValue(name, value, { shouldValidate: true })
    },
    onBlur: () => {
      // Trigger validation on blur if needed
    },
    ref: () => {},
  }

  return {
    field,
    error,
  }
}
