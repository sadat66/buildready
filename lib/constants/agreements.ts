export const AGREEMENT_STATUSES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export type AgreementStatus = typeof AGREEMENT_STATUSES[keyof typeof AGREEMENT_STATUSES];

export const AGREEMENT_STATUS_VALUES = Object.values(AGREEMENT_STATUSES);

// Agreement status descriptions for better context
export const AGREEMENT_STATUS_DESCRIPTIONS: Record<AgreementStatus, string> = {
  [AGREEMENT_STATUSES.DRAFT]: 'The agreement is being created and not yet sent to the other party.',
  [AGREEMENT_STATUSES.ACTIVE]: 'The agreement is in force and work is underway.',
  [AGREEMENT_STATUSES.COMPLETED]: 'The agreement has been fulfilled and all milestones are closed.',
  [AGREEMENT_STATUSES.CANCELLED]: 'The agreement was terminated before completion by one or both parties.'
};
