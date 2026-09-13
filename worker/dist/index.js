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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const kafkajs_1 = require("kafkajs");
const connectionString = process.env.DATABASE_URL;
const topicName = "zap-events";
if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new client_1.PrismaClient({ adapter });
const kafka = new kafkajs_1.Kafka({
    clientId: "outbox-processor",
    brokers: ["localhost:9092"],
});
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const consumer = kafka.consumer({ groupId: "main-worker" });
        yield consumer.connect();
        yield consumer.subscribe({ topic: topicName, fromBeginning: true });
        yield consumer.run({
            autoCommit: false,
            eachMessage: (_a) => __awaiter(this, [_a], void 0, function* ({ topic, partition, message }) {
                var _b;
                console.log({ partition, offset: message.offset, value: (_b = message.value) === null || _b === void 0 ? void 0 : _b.toString() });
                yield new Promise((resolve) => setTimeout(resolve, 2000));
                console.log("hi after 2 sec");
                yield consumer.commitOffsets([
                    {
                        topic: topicName,
                        partition: partition,
                        offset: parseInt((message.offset + 1)).toString(),
                    },
                ]);
            })
        });
        // any expensive logic here
    });
}
main().catch((error) => {
    console.error("Worker startup failed:", error);
    process.exit(1);
});
