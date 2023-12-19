"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showEscrow = exports.listEscrows = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// List all P2P Escrows
async function listEscrows() {
    return prisma_1.default.p2p_escrow.findMany();
}
exports.listEscrows = listEscrows;
// Get a single P2P Escrow
async function showEscrow(id) {
    return prisma_1.default.p2p_escrow.findUnique({
        where: { id },
    });
}
exports.showEscrow = showEscrow;
