import {Router} from "express";
import {authMiddleware} from "../middleware";
import {ZapSchema} from "../types/index";
import {prisma} from "../db";
const router=Router();
router.post("/",authMiddleware,async(req,res)=>{

   const body=req.body;
   const parsedData=ZapSchema.safeParse(body);
   if(!parsedData.success){
      return res.status(411).json({error:parsedData.error, message:"Invalid data"});
   }
   await prisma.$transaction(async tx=>{
       const zap= await  tx.zap.create({
    data: {
      triggerId:"",
      actions:{
      create: parsedData.data.actions.map((action, index) => ({
   actionId: action.availableActionId,
   sortingOrder: index
}))
      }
    }
 });

 const trigger=await tx.trigger.create({
   data:{
      triggerId:parsedData.data.availableTriggerId,
      zapId:zap.id
   }

 }) ;

  await tx.zap.update({
   where:{
      id:zap.id,
   },
   data:{
      triggerId:trigger.id
   }
  })
   })
return res.status(201).json({
   message: "Zap created successfully"
 });

});

router.get("/",authMiddleware,(req,res)=>{
console.log("zap handler");
});
router.get(":zapId", authMiddleware,(req,res)=>{
   console.log("zap handler with zapId");
});

export const zapRouter= router;