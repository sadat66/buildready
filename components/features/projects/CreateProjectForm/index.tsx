"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Resolver } from "react-hook-form";
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
    control,
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
      project_photos: [{
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

  const {
    dragActive,
    selectedPhotos,
    selectedFiles,
    handleFileChange,
    removeFile,
    handleDrag,
    handleDrop,
  } = useFileHandling(setValue);

  const projectService = new ProjectService();

  const onSubmit = async (data: CreateProjectFormInputData) => {
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
      const result = await projectService.createProject(data, user.id);

      if (result.success) {
        router.push("/homeowner/projects");
      } else {
        setError(result.error || "Failed to create project");
      }
    } catch (error) {
      setError("Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onFormError = () => {
    setError("Please fix the form errors before submitting");
  };

  return (
    <div className={`space-y-6 ${className}`}>
       
      <ErrorDisplay error={error} />

      <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-6">
        <BasicInformationSection
          control={control}
          watch={watch}
          setValue={setValue}
        />

        <BudgetSection control={control} />
        <TimelineSection control={control} />
        <VisibilitySettingsSection control={control} />

        <FileUploadSection
          control={control}
          dragActive={dragActive}
          selectedPhotos={selectedPhotos}
          selectedFiles={selectedFiles}
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
