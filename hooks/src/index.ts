import express from 'express';
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";
const adapter=new PrismaPg({
    connectionString:process.env.DATABASE_URL
});
const prisma = new PrismaClient({adapter});
const app = express();

app.use(express.json());

app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
    const userId = req.params.userId;
    const zapId = req.params.zapId;

    await prisma.$transaction(async (tx) => {

        const run = await tx.zapRun.create({
            data: {
                zapId: zapId,
                metadata: req.body,
            }
        });

        await tx.zapRunOutbox.create({
            data: {
                zapRunId: run.id,
            }
        });

    }); // Transaction ends here

    console.log("userId", userId);
    console.log("zapId", zapId);

    res.send("ok");
});
app.listen(3000,()=>{
    console.log("Server isrunning on port 3000");
})