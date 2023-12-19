"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        return (0, queries_1.listCategories)();
    }),
    create: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        const { name, description, image } = body;
        return (0, queries_1.createCategory)(name, description, image);
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ____, body) => {
        const { id } = params;
        const { name, description, image, status } = body;
        return (0, queries_1.updateCategory)(Number(id), name, description, status, image);
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        const { id } = params;
        return (0, queries_1.deleteCategory)(Number(id));
    }),
};
