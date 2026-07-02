import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import type { Task } from "@prisma/client";

// Mock the service module
vi.mock("../../services/task.service.js", () => ({
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
}));

import * as taskService from "../../services/task.service.js";
import * as taskController from "../../controllers/task.controller.js";

const mockService = vi.mocked(taskService);

const mockTask: Task = {
    id: 1,
    title: "Test Task",
    description: "Test description",
    completed: false,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

function createMockResponse(): Response {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
    } as unknown as Response;
    return res;
}

function createMockRequest(overrides: Partial<Request> = {}): Request {
    return {
        params: {},
        body: {},
        query: {},
        ...overrides,
    } as unknown as Request;
}

describe("TaskController", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getAllTasks", () => {
        it("should return 200 with all tasks", async () => {
            const tasks = [mockTask];
            mockService.findAll.mockResolvedValue(tasks);
            const req = createMockRequest();
            const res = createMockResponse();

            await taskController.getAllTasks(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(tasks);
        });
    });

    describe("getTaskById", () => {
        it("should return 200 with the requested task if found", async () => {
            mockService.findById.mockResolvedValue(mockTask);
            const req = createMockRequest({ params: { id: "1" } });
            const res = createMockResponse();

            await taskController.getTaskById(req, res);

            expect(mockService.findById).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockTask);
        });

        it("should return 404 if the task is not found", async () => {
            mockService.findById.mockResolvedValue(null);
            const req = createMockRequest({ params: { id: "999" } });
            const res = createMockResponse();

            await taskController.getTaskById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: "Task not found" });
        });
    });

    describe("createTask", () => {
        it("should return 201 with the created task", async () => {
            const payload = { title: "New Task", description: "New Desc" };
            mockService.create.mockResolvedValue(mockTask);
            const req = createMockRequest({ body: payload });
            const res = createMockResponse();

            await taskController.createTask(req, res);

            expect(mockService.create).toHaveBeenCalledWith(payload);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockTask);
        });
    });

    describe("updateTask", () => {
        it("should return 200 with the updated task", async () => {
            const payload = { completed: true };
            mockService.update.mockResolvedValue(mockTask);
            const req = createMockRequest({ params: { id: "1" }, body: payload });
            const res = createMockResponse();

            await taskController.updateTask(req, res);

            expect(mockService.update).toHaveBeenCalledWith(1, payload);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockTask);
        });
    });

    describe("deleteTask", () => {
        it("should return 204 on successful deletion", async () => {
            mockService.remove.mockResolvedValue(mockTask);
            const req = createMockRequest({ params: { id: "1" } });
            const res = createMockResponse();

            await taskController.deleteTask(req, res);

            expect(mockService.remove).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(204);
        });
    });
});