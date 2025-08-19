"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Resolver, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExtendedUser } from "@/contexts/AuthContext";
import { CreateProjectFormInputData, createProjectFormInputSchema } from "@/lib/validation/projects";
import { useFileHandling } from "@/lib/hooks";
import { ProjectService } from "@/lib/services";
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

  const {
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<CreateProjectFormInputData>({
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
      project_type: "Renovation",
      visibility_settings: "Public",
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

      <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-6">
        <BasicInformationSection
          watch={watch}
          setValue={setValue}
        />

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

        {/* Debug upload states */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-semibold mb-2">Debug: Upload States</h3>
          <div className="text-sm space-y-1">
            <div>Auto-Upload: <span className="font-medium text-green-600">ENABLED</span></div>
            <div>Is Uploading: {isUploading ? 'YES' : 'NO'}</div>
            <div>Photos: {uploadStates.photos.length} files</div>
            <div>Documents: {uploadStates.documents.length} files</div>
            {uploadStates.photos.map((state, index) => (
              <div key={index} className="ml-4">
                Photo {index + 1}: {state.file.name} - Status: {state.status} - Progress: {state.progress}%
                {state.status === 'idle' && <span className="text-blue-500"> (Waiting for auto-upload)</span>}
                {state.error && <span className="text-red-500"> - Error: {state.error}</span>}
              </div>
            ))}
            {uploadStates.documents.map((state, index) => (
              <div key={index} className="ml-4">
                Doc {index + 1}: {state.file.name} - Status: {state.status} - Progress: {state.progress}%
                {state.error && <span className="text-red-500"> - Error: {state.error}</span>}
              </div>
            ))}
          </div>
          
          {/* Debug form values */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium mb-2">Form Values:</h4>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => {
                  console.log('Current form values:', watch())
                  console.log('Form errors:', errors)
                  console.log('Form is valid:', isValid)
                  console.log('Upload states:', uploadStates)
                }}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                Log Form State to Console
              </button>
              
              {/* Manual upload buttons */}
              <button
                type="button"
                onClick={() => {
                  console.log('Manually triggering photo uploads')
                  handleUpload('photos')
                }}
                className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
              >
                Manual Upload Photos
              </button>
              
              <button
                type="button"
                onClick={() => {
                  console.log('Force uploading idle files')
                  forceUploadIdleFiles()
                }}
                className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
              >
                Force Upload Idle Files
              </button>
            </div>
          </div>
        </div>

        {/* Manual reset button for stuck uploads */}
        {isUploading && (
          <div className="flex justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <button
              type="button"
              onClick={resetUploadState}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
            >
              Reset Upload State (if stuck)
            </button>
          </div>
        )}
        
        <FormActions loading={loading || isUploading} />
      </form>
    </div>
  );
}
