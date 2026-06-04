import { TaskPriority, TaskStatus } from '../task.entity';

export class CreateTaskDto {
  title!: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  categoryId?: string;
}
