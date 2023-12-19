"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        return (0, queries_1.listProducts)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        const { id } = params;
        return (0, queries_1.getProductById)(Number(id));
    }),
    create: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        const { name, description, type, price, currency, wallet_type, category_id, inventory_quantity, file_path, image, } = body;
        return (0, queries_1.createProduct)(name, description, type, price, currency, wallet_type, category_id, inventory_quantity, file_path, image);
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ____, body) => {
        const { id } = params;
        const { name, description, type, price, currency, wallet_type, category_id, inventory_quantity, file_path, status, image, } = body;
        return (0, queries_1.updateProduct)(Number(id), name, description, type, price, currency, wallet_type, category_id, inventory_quantity, file_path, status, image);
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        const { id } = params;
        return (0, queries_1.deleteProduct)(Number(id));
    }),
};
