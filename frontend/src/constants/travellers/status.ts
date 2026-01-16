export const TRIP_STATUS = {
  planning: { label: 'Planning', color: '#f59e0b', bgColor: '#fef3c7' },
  active: { label: 'Active', color: '#10b981', bgColor: '#d1fae5' },
  completed: { label: 'Completed', color: '#6b7280', bgColor: '#f3f4f6' },
} as const;

export const PROPOSAL_STATUS = {
  open: { label: 'Open', color: '#3b82f6', bgColor: '#dbeafe' },
  approved: { label: 'Approved', color: '#10b981', bgColor: '#d1fae5' },
  rejected: { label: 'Rejected', color: '#ef4444', bgColor: '#fee2e2' },
} as const;

export const INVITE_STATUS = {
  pending: { label: 'Pending', color: '#f59e0b', bgColor: '#fef3c7' },
  accepted: { label: 'Accepted', color: '#10b981', bgColor: '#d1fae5' },
  declined: { label: 'Declined', color: '#ef4444', bgColor: '#fee2e2' },
} as const;

export const MESSAGE_STATUS = {
  sent: { label: 'Sent' },
  delivered: { label: 'Delivered' },
  read: { label: 'Read' },
} as const;
