// Group Status Types based on Rust enum
export type GroupStatus = 
  | { forming: {} }
  | { active: {} }
  | { paused: {} }
  | { completed: {} }
  | { cancelled: {} }

export interface GroupStatusInfo {
  status: 'forming' | 'active' | 'paused' | 'completed' | 'cancelled'
  label: string
  description: string
  color: string
  icon: string
  canStartGroup: boolean
  canStartRound: boolean
  canJoin: boolean
  isActive: boolean
}

/**
 * Converts Rust GroupStatus enum to TypeScript-friendly format with UI metadata
 */
export function getGroupStatusInfo(groupStatus: GroupStatus): GroupStatusInfo {
  if ('forming' in groupStatus) {
    return {
      status: 'forming',
      label: 'Forming',
      description: 'Accepting new members',
      color: '#FFA726', // Orange
      icon: 'group-add',
      canStartGroup: true,
      canStartRound: false,
      canJoin: true,
      isActive: false,
    }
  }
  
  if ('active' in groupStatus) {
    return {
      status: 'active',
      label: 'Active',
      description: 'Running rounds',
      color: '#66BB6A', // Green
      icon: 'play-circle-fill',
      canStartGroup: false,
      canStartRound: true,
      canJoin: false,
      isActive: true,
    }
  }
  
  if ('paused' in groupStatus) {
    return {
      status: 'paused',
      label: 'Paused',
      description: 'Temporarily suspended',
      color: '#FF7043', // Deep Orange
      icon: 'pause-circle-fill',
      canStartGroup: false,
      canStartRound: false,
      canJoin: false,
      isActive: false,
    }
  }
  
  if ('completed' in groupStatus) {
    return {
      status: 'completed',
      label: 'Completed',
      description: 'All rounds finished',
      color: '#42A5F5', // Blue
      icon: 'checkmark-circle-fill',
      canStartGroup: false,
      canStartRound: false,
      canJoin: false,
      isActive: false,
    }
  }
  
  if ('cancelled' in groupStatus) {
    return {
      status: 'cancelled',
      label: 'Cancelled',
      description: 'Group disbanded',
      color: '#EF5350', // Red
      icon: 'x-circle-fill',
      canStartGroup: false,
      canStartRound: false,
      canJoin: false,
      isActive: false,
    }
  }
  
  // Fallback for unknown status
  return {
    status: 'forming',
    label: 'Unknown',
    description: 'Status unknown',
    color: '#9E9E9E', // Grey
    icon: 'questionmark-circle',
    canStartGroup: false,
    canStartRound: false,
    canJoin: false,
    isActive: false,
  }
}

/**
 * Helper function to check if group is in forming state
 */
export function isGroupForming(groupStatus: GroupStatus): boolean {
  return 'forming' in groupStatus
}

/**
 * Helper function to check if group is active
 */
export function isGroupActive(groupStatus: GroupStatus): boolean {
  return 'active' in groupStatus
}

/**
 * Helper function to check if group can accept new members
 */
export function canJoinGroup(groupStatus: GroupStatus): boolean {
  return getGroupStatusInfo(groupStatus).canJoin
}

/**
 * Helper function to check if admin can start the group
 */
export function canStartGroup(groupStatus: GroupStatus): boolean {
  return getGroupStatusInfo(groupStatus).canStartGroup
}

/**
 * Helper function to check if admin can start a new round
 */
export function canStartRound(groupStatus: GroupStatus): boolean {
  return getGroupStatusInfo(groupStatus).canStartRound
}

/**
 * Get status color for UI components
 */
export function getStatusColor(groupStatus: GroupStatus): string {
  return getGroupStatusInfo(groupStatus).color
}

/**
 * Get status icon for UI components
 */
export function getStatusIcon(groupStatus: GroupStatus): string {
  return getGroupStatusInfo(groupStatus).icon
}

/**
 * Format status for display with additional context
 */
export function formatGroupStatus(groupStatus: GroupStatus, currentRound?: number, totalRounds?: number): string {
  const statusInfo = getGroupStatusInfo(groupStatus)
  
  if (statusInfo.status === 'active' && currentRound !== undefined && totalRounds !== undefined) {
    return `${statusInfo.label} - Round ${currentRound + 1}/${totalRounds}`
  }
  
  return `${statusInfo.label} - ${statusInfo.description}`
}
