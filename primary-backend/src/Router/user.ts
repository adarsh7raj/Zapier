import {Router} from "express";
import {authMiddleware} from "../middleware";
import {SignupSchema,SigninSchema} from "../types";
import {prisma} from "../db";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "../config";
const router=Router();
router.post("/signup",async (req,res)=>{
    const body=req.body;
  const parsedData = SignupSchema.safeParse(req.body);

if (!parsedData.success) {
    return res.status(400).json({
        message: "Incorrect inputs",
        errors: parsedData.error.issues
    });
}

 const user= await prisma.user.findFirst({
    where:{
        email:parsedData.data.username
    }
    
 });

 if(user){

    return res.status(403).json({message:"User already exists"});
 }

 const newuser =await prisma.user.create({
    data:{
        name:parsedData.data.name,
        email: parsedData.data.username,
        password:parsedData.data.password
    }
 });
 res.status(200).json({message:"Verify your email"});
});

router.post("/signin",async(req,res)=>{
    const body=req.body;
    const parsedData=SigninSchema.safeParse(body);
    if(!parsedData.success){
        return res.status(411).json({message:"Incorrect inputs"});
    }
    // Add logic to verify user credentials and generate token

    const signinUser= await prisma.user.findFirst({

        where:{
            email:parsedData.data.username,
            password:parsedData.data.password
        }

    });
    if(!signinUser){
        return res.status(403).json({message:"Invalid credentials"});
    }
    const token= jwt.sign({id:signinUser.id},JWT_SECRET,{expiresIn:"1h"});
    res.send({message:"Signin successful",token:token});
});


router.get("/",authMiddleware,async(req,res)=>{
   // @ts-ignore
    const id=req.id;
    const user=await prisma.user.findFirst({
        where:{
            id:id
        },
        select:{
            name:true,
            email:true
        }
});
res.send({user});
});
export const userRouter= router;