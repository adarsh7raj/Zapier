import "dotenv/config";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Kafka } from "kafkajs";

const connectionString = process.env.DATABASE_URL;
const topicName = "zap-events";
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: ["localhost:9092"],
});

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

async function main() {
  const consumer=kafka.consumer({groupId:"main-worker"});
  await consumer.connect();
  await consumer.subscribe({topic:topicName,fromBeginning:true});
  await consumer.run({
    autoCommit:false,
    eachMessage:async({topic,partition,message})=>{
      console.log({partition,offset:message.offset,value:message.value?.toString()});
    await new Promise((resolve)=>setTimeout(resolve,2000));
    console.log("hi after 2 sec");
    await consumer.commitOffsets([
      {
        topic: topicName,
        partition: partition,
        offset: (parseInt(message.offset)+1).toString(),
      },
    ]);
    }
  });

  // any expensive logic here

}

main().catch((error) => {
  console.error("Worker startup failed:", error);
  process.exit(1);
});
