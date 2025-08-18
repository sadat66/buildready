import * as React from "react"
import { Control, FieldPath, FieldValues, ControllerRenderProps } from "react-hook-form"
import { useFormField } from "@/lib/hooks"
import { FormInput } from "./FormInput"
import { FormTextarea } from "./FormTextarea"
import { FormSelect } from "./FormSelect"
import { FormSwitch } from "./FormSwitch"
import { LocationInput, LocationData } from "./LocationInput"

export interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName
  control: Control<TFieldValues>
  children: (props: { field: ControllerRenderProps<TFieldValues, TName>; error?: string }) => React.ReactNode
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ name, control, children }: FormFieldProps<TFieldValues, TName>) {
  const { field, error } = useFormField({ name, control })

  return <>{children({ field, error: error?.message })}</>
}

// Convenience components for common field types
export interface FormFieldInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName
  control: Control<TFieldValues>
  label: string
  placeholder?: string
  required?: boolean
  type?: string
  helperText?: string
}

export function FormFieldInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ name, control, ...props }: FormFieldInputProps<TFieldValues, TName>) {
  return (
    <FormField name={name} control={control}>
      {({ field, error }) => (
        <FormInput
          {...field}
          {...props}
          error={error}
        />
      )}
    </FormField>
  )
}

export interface FormFieldTextareaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName
  control: Control<TFieldValues>
  label: string
  placeholder?: string
  required?: boolean
  rows?: number
  helperText?: string
}

export function FormFieldTextarea<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ name, control, ...props }: FormFieldTextareaProps<TFieldValues, TName>) {
  return (
    <FormField name={name} control={control}>
      {({ field, error }) => (
        <FormTextarea
          {...field}
          {...props}
          error={error}
        />
      )}
    </FormField>
  )
}

export interface FormFieldSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName
  control: Control<TFieldValues>
  label: string
  placeholder?: string
  required?: boolean
  options: Array<{ value: string; label: string }>
  helperText?: string
}

export function FormFieldSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ name, control, ...props }: FormFieldSelectProps<TFieldValues, TName>) {
  return (
    <FormField name={name} control={control}>
      {({ field, error }) => (
        <FormSelect
          {...props}
          value={field.value}
          onValueChange={field.onChange}
          error={error}
        />
      )}
    </FormField>
  )
}

export interface FormFieldSwitchProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName
  control: Control<TFieldValues>
  label: string
  helperText?: string
}

export function FormFieldSwitch<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ name, control, ...props }: FormFieldSwitchProps<TFieldValues, TName>) {
  return (
    <FormField name={name} control={control}>
      {({ field, error }) => (
        <FormSwitch
          {...props}
          checked={field.value}
          onCheckedChange={field.onChange}
          error={error}
        />
      )}
    </FormField>
  )
}

export interface FormFieldLocationProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName
  control: Control<TFieldValues>
  label?: string
  placeholder?: string
  required?: boolean
  helperText?: string
  showMap?: boolean
}

export function FormFieldLocation<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ name, control, ...props }: FormFieldLocationProps<TFieldValues, TName>) {
  return (
    <FormField name={name} control={control}>
      {({ field, error }) => (
        <LocationInput
          {...props}
          value={field.value as LocationData}
          onChange={field.onChange}
          onBlur={field.onBlur}
          error={error}
        />
      )}
    </FormField>
  )
}
