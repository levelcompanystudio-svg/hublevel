export interface ClientAggregate {
  activeServices: number;
  openTasks: number;
  overdueTasks: number;
  checklistTotal: number;
  checklistDone: number;
  lastUpdateDate: string | null;
  hasRecentUpdate: boolean;
  nextMeetingDate: string | null;
  hasRecentOrUpcomingMeeting: boolean;
  recentDocuments: number;
}

export const emptyClientAggregate: ClientAggregate = {
  activeServices: 0,
  openTasks: 0,
  overdueTasks: 0,
  checklistTotal: 0,
  checklistDone: 0,
  lastUpdateDate: null,
  hasRecentUpdate: false,
  nextMeetingDate: null,
  hasRecentOrUpcomingMeeting: false,
  recentDocuments: 0,
};
