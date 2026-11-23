"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SigninSchema = exports.SignupSchema = void 0;
const zod_1 = require("zod");
exports.SignupSchema = zod_1.z.object({
    username: zod_1.z.email(),
    password: zod_1.z.string().min(6).max(20),
    name: zod_1.z.string().min(3).max(20)
});
exports.SigninSchema = zod_1.z.object({
    username: zod_1.z.email(),
    password: zod_1.z.string().min(6).max(20),
});
