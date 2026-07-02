import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Task } from "@prisma/client";

vi.mock("../../lib/prisma.js", () => {
    return {
        default: {
            task: {
                findMany: vi.fn(),
                findUnique: vi.fn(),
                create: vi.fn(),
                update: vi.fn(),
                delete: vi.fn(),
            },
        },
    };
});

import prisma from "../../lib/prisma.js";
import * as taskService from "../../services/task.service.js";

const mockPrisma = vi.mocked(prisma);

const mockTask: Task = {
    id: 1,
    title: "Test Task",
    description: "A test task description",
    completed: false,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("TaskService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("findAll", () => {
        it("should return all tasks ordered by createdAt desc", async () => {
            const tasks = [mockTask];
            (mockPrisma.task.findMany as any).mockResolvedValue(tasks);

            const result = await taskService.findAll();

            expect(result).toEqual(tasks);
            expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
                orderBy: { createdAt: "desc" },
            });
        });
    });

    describe("findById", () => {
        it("should return a task by its ID", async () => {
            (mockPrisma.task.findUnique as any).mockResolvedValue(mockTask);

            const result = await taskService.findById(1);

            expect(result).toEqual(mockTask);
            expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
            });
        });
    });

    describe("create", () => {
        it("should create a new task", async () => {
            const inputData = { title: "New Task", description: "Desc" };
            const createdTask = { ...mockTask, ...inputData };
            (mockPrisma.task.create as any).mockResolvedValue(createdTask);

            const result = await taskService.create(inputData);

            expect(result).toEqual(createdTask);
            expect(mockPrisma.task.create).toHaveBeenCalledWith({
                data: inputData,
            });
        });
    });

    describe("update", () => {
        it("should update an existing task", async () => {
            const updateData = { completed: true };
            const updatedTask = { ...mockTask, ...updateData };
            (mockPrisma.task.update as any).mockResolvedValue(updatedTask);

            const result = await taskService.update(1, updateData);

            expect(result).toEqual(updatedTask);
            expect(mockPrisma.task.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData,
            });
        });
    });

    describe("deleteTask", () => {
        it("should delete a task by ID", async () => {
            (mockPrisma.task.delete as any).mockResolvedValue(mockTask);

            const result = await taskService.deleteTask(1);

            expect(result).toEqual(mockTask);
            expect(mockPrisma.task.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
        });
    });
});