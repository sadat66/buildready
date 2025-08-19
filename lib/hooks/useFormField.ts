'use client'

import { Control, FieldPath, FieldValues, Controller, ControllerRenderProps, PathValue } from "react-hook-form"
import { useState } from "react"

export interface UseFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName
  control: Control<TFieldValues>
}

export function useFormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ name, control }: UseFormFieldProps<TFieldValues, TName>) {
  const [value, setValue] = useState<PathValue<TFieldValues, TName> | undefined>(undefined)
  
  // Create a field object that matches ControllerRenderProps interface
  const field: ControllerRenderProps<TFieldValues, TName> = {
    name,
    value,
    onChange: (newValue: PathValue<TFieldValues, TName>) => {
      setValue(newValue)
    },
    onBlur: () => {},
    ref: () => {}, // Add the missing ref property
  }
  
  const error = undefined

  return {
    field,
    error,
  }
}
