"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        return (0, queries_1.listFaqs)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        const { id } = params;
        return (0, queries_1.getFaqById)(Number(id));
    }),
    create: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        const { question, answer, faq_category_id } = body;
        return (0, queries_1.createFaq)(question, answer, Number(faq_category_id));
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ____, body) => {
        const { id } = params;
        const { question, answer } = body;
        return (0, queries_1.updateFaq)(Number(id), question, answer);
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        const { id } = params;
        return (0, queries_1.deleteFaq)(Number(id));
    }),
};
