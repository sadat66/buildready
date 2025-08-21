import { User } from "./auth";
import { FileReference, GeospatialLocation } from "../common";
import { ProjectType, ProjectStatus, VisibilitySettings } from "@/lib/constants";

export interface Project {
  id: string;
  project_title: string;
  statement_of_work: string;
  budget: number;
  category: string[];
  pid: string;
  location: GeospatialLocation;
  location_geom?: any;
  certificate_of_title?: string | null;
  project_type: ProjectType;
  status: ProjectStatus;
  visibility_settings: VisibilitySettings;
  start_date: Date;
  end_date: Date;
  expiry_date: Date;
  decision_date?: Date | null;
  permit_required: boolean;
  substantial_completion?: Date | null;
  is_verified_project: boolean;
  project_photos: FileReference[];
  files: FileReference[];
  creator: string;
  proposal_count: number;
  created_at: Date;
  updated_at: Date;
  homeowner?: User;
}
