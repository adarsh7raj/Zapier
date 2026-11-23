import {NextFunction,Request,Response} from "express";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "./config";
export const authMiddleware=(req:Request,res:Response,next:NextFunction)=>{
  const token=req.headers.authorization;
  try{
  if(!token){
    return res.status(401).json({message:"Unauthorized"});
  }
  const payload=jwt.verify(token,JWT_SECRET) 
  // @ts-ignore
  req.id=payload.id;
    next();
  }
  catch(err){
    return res.status(401).json({message:"Unauthorized"});
  }
}