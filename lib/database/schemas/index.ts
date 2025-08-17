export * from "./base";

export * from "./users";

export * from "./contractor_profiles";

export * from "./projects";

export * from "./proposals";

export * from "./communication";

import { userSchema } from "./users";
import { contractorProfileSchema } from "./contractor_profiles";
import { projectSchema } from "./projects";
import { proposalSchema } from "./proposals";
import { messageSchema, reviewSchema } from "./communication";

export const schemaRegistry = {
  users: userSchema,
  contractor_profiles: contractorProfileSchema,
  projects: projectSchema,
  proposals: proposalSchema,
  reviews: reviewSchema,
  messages: messageSchema,
} as const;

export const schemaMetadata = {
  users: {
    tableName: "users",
    description:
      "User profiles and authentication data with verification status",
    indexes: ["email", "user_role", "is_verified_email", "is_active"],
  },
  contractor_profiles: {
    tableName: "contractor_profiles",
    description:
      "Main business profile for contractors with company information, compliance data, and service areas",
    indexes: [
      "user_id",
      "business_name",
      "is_insurance_verified",
      "trade_category",
    ],
  },
  projects: {
    tableName: "projects",
    description: "Homeowner project requests",
    indexes: ["homeowner_id", "status", "category", "location"],
  },
  proposals: {
    tableName: "proposals",
    description: "Contractor project proposals",
    indexes: ["project_id", "contractor_id", "status"],
  },
  reviews: {
    tableName: "reviews",
    description: "User reviews and ratings",
    indexes: ["reviewer_id", "reviewed_id", "project_id"],
  },
  messages: {
    tableName: "messages",
    description: "User communication messages",
    indexes: ["sender_id", "receiver_id", "project_id"],
  },
} as const;

export type {
  User,
  UserUpdate,
  UserCreate,
  UserLogin,
  UserRegistration,
  UserVerification,
  PasswordReset,
  PasswordResetConfirm,
} from "./users";

export type {
  ContractorProfile,
  ContractorProfileCreate,
  ContractorProfileUpdate,
  ContractorVerification,
  ContractorSearch,
  ContractorAvailability,
} from "./contractor_profiles";

export type {
  Project,
  ProjectType,
  ProjectStatus,
  VisibilitySettings,
  TradeCategory,
} from "./projects";

export type {
  Proposal,
  ProposalCreate,
  ProposalUpdate,
  ProposalStatusUpdate,
  ProposalResubmission,
  ProposalSearch,
  ProposalComparison,
  ProposalFeedback,
  ProposalRevisionRequest,
} from "./proposals";

export type {
  Message,
  MessageCreate,
  MessageUpdate,
  MessageThread,
  MessageSearch,
  Review,
  ReviewCreate,
  ReviewUpdate,
  ReviewSearch,
  Notification,
  NotificationCreate,
  NotificationUpdate,
  ChatRoom,
} from "./communication";
