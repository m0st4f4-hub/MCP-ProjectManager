import { TaskStatus } from './task';

export interface StatusTransition {
  id: number;
  from_status: TaskStatus;
  to_status: TaskStatus;
}
