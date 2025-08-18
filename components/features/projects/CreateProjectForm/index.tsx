"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { ExtendedUser } from "@/contexts/AuthContext";
import { CreateProjectFormInputData, createProjectFormInputSchema } from "@/lib/validation/projects";
import { BasicInformationSection } from "./BasicInformationSection";
import { BudgetSection } from "./BudgetSection";
import { TimelineSection } from "./TimelineSection";
import { VisibilitySettingsSection } from "./VisibilitySettingsSection";
import { FileUploadSection } from "./FileUploadSection";
import { FormActions } from "./FormActions";
import { FormHeader } from "./FormHeader";
import { ErrorDisplay } from "./ErrorDisplay";
import { useFileHandling } from "./useFileHandling";
import { CreateProjectHandler } from "./CreateProjectHandler";

// Force client-side rendering to avoid React 19 SSR issues
const LocationMap = dynamic(
  () =>
    import("@/components/features/projects").then((mod) => ({
      default: mod.LocationMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 bg-white rounded-lg flex items-center justify-center">
        Loading map...
      </div>
    ),
  }
);

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
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger,
  } = useForm<CreateProjectFormInputData>({
    resolver: zodResolver(
      createProjectFormInputSchema
    ) as Resolver<CreateProjectFormInputData>,
    mode: "onChange",
    defaultValues: {
      project_title: "",
      statement_of_work: "",
      budget: 1000, // Set a default budget
      category: [],
      pid: "",
      location: {
        address: "",
        city: "Vancouver", // Set default city
        province: "BC", // Set default province
        postalCode: "V6B 1A1", // Set default postal code
        latitude: 49.2827, // Vancouver coordinates
        longitude: -123.1207,
      },
      certificate_of_title: "",
      project_type: "Renovation",
      visibility_settings: "Public",
      start_date: new Date().toISOString().split('T')[0], // Today's date
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
      decision_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 21 days from now
      substantial_completion: "",
      permit_required: false,
      is_verified_project: false,
      project_photos: [{
        // Temporary placeholder photo to satisfy validation
        id: crypto.randomUUID(),
        filename: "placeholder.jpg",
        url: "https://via.placeholder.com/300x200?text=Upload+Photo",
        size: 1000,
        mimeType: "image/jpeg",
        uploadedAt: new Date(),
      }],
      files: [],
    },
  });

  // Use custom hook for file handling
  const {
    dragActive,
    selectedPhotos,
    selectedFiles,
    handleFileChange,
    removeFile,
    handleDrag,
    handleDrop,
  } = useFileHandling(setValue);

  const projectHandler = new CreateProjectHandler();

  // Test function to manually trigger validation and see what's wrong
  const testValidation = async () => {
    console.log("Testing form validation...");
    const isValid = await trigger();
    console.log("Form validation result:", isValid);
    console.log("Form errors:", errors);
    console.log("Current form values:", watch());
    
    // Show detailed error information
    if (!isValid) {
      console.log("Validation errors details:");
      Object.entries(errors).forEach(([field, error]) => {
        console.log(`${field}:`, error?.message);
      });
    }
  };

  // Test function to create a minimal valid project
  const testMinimalProject = async () => {
    console.log("Testing minimal project creation...");
    
    // Set minimal required values
    setValue("project_title", "Test Project");
    setValue("statement_of_work", "Test work description");
    setValue("budget", 1000);
    setValue("category", ["Electrical"]);
    setValue("pid", "TEST-123");
    setValue("location", {
      address: "123 Test St",
      city: "Vancouver",
      province: "BC",
      postalCode: "V6B 1A1",
      latitude: 49.2827,
      longitude: -123.1207,
    });
    setValue("start_date", "2024-01-01");
    setValue("end_date", "2024-02-01");
    setValue("expiry_date", "2024-01-15");
    setValue("decision_date", "2024-01-20");
    setValue("project_photos", [{
      id: crypto.randomUUID(),
      filename: "test.jpg",
      url: "https://example.com/test.jpg",
      size: 1000,
      mimeType: "image/jpeg",
      uploadedAt: new Date(),
    }]);

    // Trigger validation
    const isValid = await trigger();
    console.log("Minimal project validation result:", isValid);
    console.log("Minimal project errors:", errors);
    
    if (isValid) {
      console.log("Minimal project is valid, attempting submission...");
      const formData = watch();
      const result = await projectHandler.createProject(formData, user.id);
      console.log("Minimal project creation result:", result);
    }
  };

  const onSubmit = async (data: CreateProjectFormInputData) => {
    console.log("Form submission started");
    console.log("Form data:", data);
    console.log("Form errors:", errors);
    console.log("Form isValid:", isValid);
    console.log("User:", user);

    if ((user.user_metadata?.role || "homeowner") !== "homeowner") {
      setError("Only homeowners can create projects");
      return;
    }

    if (!isValid) {
      setError("Please fix form validation errors before submitting");
      console.log("Form validation failed");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // The form data already has properly formatted project_photos and files
      // No need to upload or transform them for now
      const result = await projectHandler.createProject(data, user.id);

      if (result.success) {
        console.log("Project created successfully");
        router.push("/homeowner/projects");
      } else {
        console.error("Project creation failed:", result.error);
        setError(result.error || "Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      setError("Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onFormError = (errors: any) => {
    console.log("Form validation errors:", errors);
    setError("Please fix the form errors before submitting");
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <FormHeader />

      <ErrorDisplay error={error} />

      {/* Debug info - remove in production */}
      <div className="bg-gray-100 p-4 rounded-lg text-sm">
        <p>Form Valid: {isValid ? "Yes" : "No"}</p>
        <p>Errors: {Object.keys(errors).length}</p>
        <p>User Role: {user.user_metadata?.role || "homeowner"}</p>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={testValidation}
            className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
          >
            Test Validation
          </button>
          <button
            type="button"
            onClick={testMinimalProject}
            className="bg-green-500 text-white px-3 py-1 rounded text-xs"
          >
            Test Minimal Project
          </button>
        </div>
        
        {/* Show detailed validation errors */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
            <p className="font-semibold text-red-700 mb-2">Validation Errors:</p>
            {Object.entries(errors).map(([field, error]) => (
              <p key={field} className="text-red-600 text-xs">
                {field}: {error?.message}
              </p>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-6">
        <BasicInformationSection
          control={control}
          watch={watch}
          setValue={setValue}
          errors={errors}
        />

        <BudgetSection control={control} />

        <TimelineSection control={control} />

        <VisibilitySettingsSection control={control} />

        <FileUploadSection
          control={control}
          dragActive={dragActive}
          selectedPhotos={selectedPhotos}
          selectedFiles={selectedFiles}
          errors={errors}
          handleDrag={handleDrag}
          handleDrop={handleDrop}
          handleFileChange={handleFileChange}
          removeFile={removeFile}
        />

        <FormActions loading={loading} />
      </form>
    </div>
  );
}
