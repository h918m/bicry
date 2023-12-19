"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, query) => {
        try {
            return await (0, queries_1.getDurations)();
        }
        catch (error) {
            throw new Error(`Failed to fetch durations: ${error.message}`);
        }
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            return await (0, queries_1.getDuration)(Number(params.id));
        }
        catch (error) {
            throw new Error(`Failed to fetch duration: ${error.message}`);
        }
    }),
    create: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const newDuration = await (0, queries_1.createDuration)(body.duration.duration, body.duration.timeframe);
            return newDuration;
        }
        catch (error) {
            throw new Error(`Failed to create duration: ${error.message}`);
        }
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        try {
            const updatedDuration = await (0, queries_1.updateDuration)(Number(params.id), body.duration.duration, body.duration.timeframe);
            return updatedDuration;
        }
        catch (error) {
            throw new Error(`Failed to update duration: ${error.message}`);
        }
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            const deletedDuration = await (0, queries_1.deleteDuration)(Number(params.id));
            return deletedDuration;
        }
        catch (error) {
            throw new Error(`Failed to delete duration: ${error.message}`);
        }
    }),
};
