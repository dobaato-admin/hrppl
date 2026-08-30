import type { ComponentType } from 'react'

import { template as leaveSubmittedManager } from './leave-submitted-manager'
import { template as leaveSubmittedEmployee } from './leave-submitted-employee'
import { template as leaveApproved } from './leave-approved'
import { template as leaveRejected } from './leave-rejected'
import { template as leaveCancelledManager } from './leave-cancelled-manager'
import { template as wfhApproved } from './wfh-approved'
import { template as wfhRejected } from './wfh-rejected'
import { template as payslipReady } from './payslip-ready'
import { template as reviewReminder } from './review-reminder'
import { template as onboardingOverdue } from './onboarding-overdue'
import { template as staffInvitation } from './staff-invitation'
import { template as documentSent } from './document-sent'
import { template as documentSigned } from './document-signed'
import { template as documentDeclined } from './document-declined'
import { template as documentCompleted } from './document-completed'
import { template as documentReminder } from './document-reminder'
import { template as securityFindingAlert } from './security-finding-alert'
import { template as mfaOtpCode } from './mfa-otp-code'
import { template as trainingOverdue } from './training-overdue'
import { template as orgTrialInvitation } from './org-trial-invitation'
import { template as billingOpsAlert } from './billing-ops-alert'
import { template as onboardingTaskStatus } from './onboarding-task-status'
import { template as employmentVariationStatus } from './employment-variation-status'
import { template as timesheetStatus } from './timesheet-status'
import { template as onboardingTaskReminder } from './onboarding-task-reminder'
import { template as kpiCycleStatus } from './kpi-cycle-status'




export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'leave-submitted-manager': leaveSubmittedManager,
  'leave-submitted-employee': leaveSubmittedEmployee,
  'leave-approved': leaveApproved,
  'leave-rejected': leaveRejected,
  'leave-cancelled-manager': leaveCancelledManager,
  'wfh-approved': wfhApproved,
  'wfh-rejected': wfhRejected,
  'payslip-ready': payslipReady,
  'review-reminder': reviewReminder,
  'onboarding-overdue': onboardingOverdue,
  'staff-invitation': staffInvitation,
  'document-sent': documentSent,
  'document-signed': documentSigned,
  'document-declined': documentDeclined,
  'document-completed': documentCompleted,
  'document-reminder': documentReminder,
  'security-finding-alert': securityFindingAlert,
  'mfa-otp-code': mfaOtpCode,
  'training-overdue': trainingOverdue,
  'org-trial-invitation': orgTrialInvitation,
  'billing-ops-alert': billingOpsAlert,
  'onboarding-task-status': onboardingTaskStatus,
  'employment-variation-status': employmentVariationStatus,
  'timesheet-status': timesheetStatus,
  'onboarding-task-reminder': onboardingTaskReminder,
  'kpi-cycle-status': kpiCycleStatus,
}

