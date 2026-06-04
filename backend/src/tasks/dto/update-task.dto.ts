import { TaskPriority, TaskStatus } from '../task.entity';

export class UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string | null;
  categoryId?: string | null;
}
