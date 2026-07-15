import type { ClientService } from './client-services.types';
import type { Document } from '../documents/documents.types';
import type { Meeting } from '../meetings/meetings.types';
import type { Task } from '../tasks/tasks.types';
import type { Update } from '../updates/updates.types';

export interface ClientOverviewData {
  tasks: Task[];
  updates: Update[];
  meetings: Meeting[];
  services: ClientService[];
  documents: Document[];
}

export interface ClientOverviewMetrics {
  activeServices: number;
  openTasks: number;
  overdueTasks: number;
  checklistTotal: number;
  checklistDone: number;
  lastUpdate: Update | null;
  nextMeeting: Meeting | null;
  recentDocuments: Document[];
}
