import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../categories/category.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  findAll(): Promise<Task[]> {
    return this.tasksRepository.find({
      relations: { category: true },
      order: { dueDate: 'ASC', title: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: { category: true },
    });

    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    return task;
  }

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const { categoryId, dueDate, ...taskData } = createTaskDto;
    const task = this.tasksRepository.create({
      ...taskData,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    if (categoryId) {
      task.category = await this.findCategory(categoryId);
    }

    return this.tasksRepository.save(task);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    const { categoryId, dueDate, ...taskData } = updateTaskDto;

    Object.assign(task, taskData);

    if (dueDate !== undefined) {
      task.dueDate = dueDate === null ? undefined : new Date(dueDate);
    }

    if (categoryId !== undefined) {
      task.category = categoryId === null ? undefined : await this.findCategory(categoryId);
    }

    return this.tasksRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    const result = await this.tasksRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException(`Task ${id} not found`);
    }
  }

  private async findCategory(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }

    return category;
  }
}
