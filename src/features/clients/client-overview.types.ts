import type { Document } from '../documents/documents.types';
import type { Meeting } from '../meetings/meetings.types';
import type { Task } from '../tasks/tasks.types';
import type { Update } from '../updates/updates.types';

export interface ClientOverviewData {
  tasks: Task[];
  updates: Update[];
  meetings: Meeting[];
  documents: Document[];
}

export interface ClientOverviewMetrics {
  openTasks: number;
  overdueTasks: number;
  lastUpdate: Update | null;
  nextMeeting: Meeting | null;
  recentDocuments: Document[];
}
