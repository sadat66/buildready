import { User } from "./auth";
import { FileReference, GeospatialLocation } from "../common";

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
  project_type:
    | "New Build"
    | "Renovation"
    | "Maintenance"
    | "Repair"
    | "Inspection";
  status:
    | "Draft"
    | "Published"
    | "Bidding"
    | "Awarded"
    | "In Progress"
    | "Completed"
    | "Cancelled";
  visibility_settings: "Public" | "Private" | "Invitation Only";
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
