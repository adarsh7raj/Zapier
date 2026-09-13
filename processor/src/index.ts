import express from 'express';
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { Kafka,EachMessagePayload } from "kafkajs";
import "dotenv/config";
const kafka=new Kafka({
    clientId:'outbox-processor',
    brokers:["localhost:9092"]
});
const topic_name="zap-events";
const producer=kafka.producer();

const adapter=new PrismaPg({
    connectionString:process.env.DATABASE_URL
});
const prisma = new PrismaClient({adapter});

async function main(){
    const producer=kafka.producer();
    await producer.connect();
    while(1){
        const pendingRows=await prisma.zapRunOutbox.findMany({
            where:{},
            take:10
        });
     await  producer.send({ // pushing to queue
        topic:topic_name,
        messages:pendingRows.map((row)=>({
            value:row.zapRunId,
            key:row.id.toString()
        }))
      });
      await prisma.zapRunOutbox.deleteMany({
        where:{id:{in:pendingRows.map(row=>row.id)}}
      });
            
       
    }
}

main();