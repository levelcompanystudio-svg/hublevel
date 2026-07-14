export interface AdminDashboardMetrics {
  activeClients: number;
  overdueClients: number;
  clientsWithoutRecentUpdate: number;
  clientsWithoutRecentMeeting: number;
  expectedRevenue: number;
  receivedRevenue: number;
  overdueTasks: number;
  meetingsThisWeek: number;
}

export interface ManagerDashboardMetrics {
  myClients: number;
  clientsWithoutRecentUpdate: number;
  clientsWithoutRecentMeeting: number;
  overdueTasks: number;
  meetingsThisWeek: number;
}

export interface CollaboratorDashboardMetrics {
  myTasks: number;
  overdueTasks: number;
  myMeetingsThisWeek: number;
}
