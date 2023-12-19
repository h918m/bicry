"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, query) => {
        return (0, queries_1.getTags)(query.posts);
    }),
    show: (0, utils_1.handleController)(async (_, __, params, query) => {
        return (0, queries_1.getTag)(params.slug, query.posts);
    }),
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        return (0, queries_1.createTag)(body.tag);
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ____, body) => {
        return (0, queries_1.updateTag)(Number(params.id), body.tag);
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        return (0, queries_1.deleteTag)(Number(params.id));
    }),
};
