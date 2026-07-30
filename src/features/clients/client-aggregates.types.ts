export interface ClientAggregate {
  openTasks: number;
  overdueTasks: number;
  lastUpdateDate: string | null;
  hasRecentUpdate: boolean;
  nextMeetingDate: string | null;
  hasRecentOrUpcomingMeeting: boolean;
  recentDocuments: number;
}

export const emptyClientAggregate: ClientAggregate = {
  openTasks: 0,
  overdueTasks: 0,
  lastUpdateDate: null,
  hasRecentUpdate: false,
  nextMeetingDate: null,
  hasRecentOrUpcomingMeeting: false,
  recentDocuments: 0,
};
