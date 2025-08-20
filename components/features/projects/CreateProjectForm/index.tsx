"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Resolver, FieldErrors, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExtendedUser } from "@/contexts/AuthContext";
import { CreateProjectFormInputData, createProjectFormInputSchema } from "@/lib/validation/projects";
import { useFileHandling } from "@/lib/hooks";
import { ProjectService } from "@/lib/services";
import { VISIBILITY_SETTINGS, PROJECT_TYPES } from "@/lib/constants";
import { BasicInformationSection } from "./BasicInformationSection";
import { BudgetSection } from "./BudgetSection";
import { TimelineSection } from "./TimelineSection";
import { VisibilitySettingsSection } from "./VisibilitySettingsSection";
import { FileUploadSection } from "./FileUploadSection";
import { FormActions } from "./FormActions";
import { ErrorDisplay } from "./ErrorDisplay";

interface CreateProjectFormProps {
  user: ExtendedUser;
  className?: string;
}

export default function CreateProjectForm({
  user,
  className = "",
}: CreateProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<CreateProjectFormInputData>({
    resolver: zodResolver(
      createProjectFormInputSchema
    ) as Resolver<CreateProjectFormInputData>,
    mode: "onChange",
    defaultValues: {
      project_title: "",
      statement_of_work: "",
      budget: 1000,
      category: [],
      pid: "",
      location: {
        address: "",
        city: "Vancouver",
        province: "BC",
        postalCode: "V6B 1A1",
        latitude: 49.2827,
        longitude: -123.1207,
      },
      certificate_of_title: "",
      project_type: PROJECT_TYPES.RENOVATION,
      visibility_settings: VISIBILITY_SETTINGS.PUBLIC_TO_MARKETPLACE,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      decision_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      substantial_completion: "",
      permit_required: false,
      is_verified_project: false,
      project_photos: [],
      files: [],
    },
  });

  const { handleSubmit, formState: { errors, isValid }, setValue, watch } = form;

  const {
    dragActive,
    selectedPhotos,
    selectedFiles,
    uploadStates,
    isUploading,
    handleFileChange,
    removeFile,
    handleDrag,
    handleDrop,
    resetUploadState,
    handleUpload,
    forceUploadIdleFiles,
  } = useFileHandling(setValue, { autoUpload: true });

  const projectService = new ProjectService();

  const onSubmit = async (data: CreateProjectFormInputData) => {
    console.log('Form submitted with data:', data)
    console.log('Project photos:', data.project_photos)
    console.log('Files:', data.files)
    console.log('Upload states:', uploadStates)
    console.log('Is uploading:', isUploading)
    
    // Debug form state
    console.log('Form errors:', errors)
    console.log('Form is valid:', isValid)
    console.log('Current form values:', watch())
    
    // Check if uploads are still in progress
    if (isUploading) {
      setError("Please wait for file uploads to complete before submitting");
      return;
    }
    
    // Check if there are any files that haven't been uploaded yet
    const hasUnuploadedFiles = uploadStates.photos.some(state => state.status === 'idle') || 
                               uploadStates.documents.some(state => state.status === 'idle')
    
    // Check if there are any failed uploads
    const hasFailedUploads = uploadStates.photos.some(state => state.status === 'error') || 
                             uploadStates.documents.some(state => state.status === 'error')
    
    if (hasUnuploadedFiles) {
      setError("Please wait for all files to finish uploading before submitting");
      return;
    }
    
    if (hasFailedUploads) {
      setError("Some files failed to upload. Please remove failed files or try again.");
      return;
    }
    
    if ((user.user_metadata?.role || "homeowner") !== "homeowner") {
      setError("Only homeowners can create projects");
      return;
    }

    if (!isValid) {
      setError("Please fix form validation errors before submitting");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log('Submitting project with user ID:', user.id)
      console.log('User ID type:', typeof user.id)
      console.log('User ID length:', user.id?.length)
      
      const result = await projectService.createProject(data, user.id);

      if (result.success) {
        router.push("/homeowner/projects");
      } else {
        setError(result.error || "Failed to create project");
      }

    } catch (error) {
      console.error('Project creation failed:', error);
      setError("Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onFormError = (formErrors: FieldErrors<CreateProjectFormInputData>) => {
    console.log('Form validation errors:', formErrors)
    console.log('Current form values:', watch())
    setError("Please fix the form errors before submitting");
  };

  return (
    <div className={`space-y-6 ${className}`}>
       
      <ErrorDisplay error={error} />

      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-6">
          <BasicInformationSection />

          <BudgetSection />
          <TimelineSection />
          <VisibilitySettingsSection />

          <FileUploadSection
            dragActive={dragActive}
            selectedPhotos={selectedPhotos}
            selectedFiles={selectedFiles}
            handleDrag={handleDrag}
            handleDrop={handleDrop}
            handleFileChange={handleFileChange}
            removeFile={removeFile}
          />


        
        <FormActions loading={loading || isUploading} />
        </form>
      </FormProvider>
    </div>
  );
}
