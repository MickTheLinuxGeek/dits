"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./prisma");
describe('Prisma Database Connection', () => {
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, prisma_1.disconnectDatabase)();
    }));
    describe('testDatabaseConnection', () => {
        it('should successfully connect to the database', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield (0, prisma_1.testDatabaseConnection)();
            expect(result).toBe(true);
        }));
    });
    describe('getDatabaseConnectionInfo', () => {
        it('should return connection info', () => __awaiter(void 0, void 0, void 0, function* () {
            const info = yield (0, prisma_1.getDatabaseConnectionInfo)();
            expect(info).toHaveProperty('connected');
            expect(info.connected).toBe(true);
            expect(info).toHaveProperty('poolSize');
            expect(typeof info.poolSize).toBe('number');
        }));
    });
    describe('prisma client', () => {
        it('should be defined', () => {
            expect(prisma_1.prisma).toBeDefined();
        });
        it('should execute a simple query', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield prisma_1.prisma.$queryRaw `SELECT 1 as value`;
            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
        }));
    });
});
