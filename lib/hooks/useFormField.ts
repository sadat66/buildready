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
  const { getFieldState, formState } = useFormContext<TFieldValues>()
  
  const fieldState = getFieldState(name, formState)
  const error = fieldState?.error?.message
  
  // Create a properly typed field object that matches ControllerRenderProps exactly
  const field: ControllerRenderProps<TFieldValues, TName> = {
    name,
    value: formState.defaultValues?.[name] as PathValue<TFieldValues, TName>,
    onChange: () => {
      // This will be handled by the parent form
    },
    onBlur: () => {
      // This will be handled by the parent form
    },
    ref: () => {},
  }

  return {
    field,
    error,
  }
}
