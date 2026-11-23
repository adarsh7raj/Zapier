import {z} from "zod";

export const SignupSchema=z.object({
    username:z.email(),
    password:z.string().min(6).max(20),
    name:z.string().min(3).max(20)
});

export const SigninSchema=z.object({
    username:z.email(),
    password:z.string().min(6).max(20),
})

export const ZapSchema=z.object({
availableTriggerId:z.string(),
triggerMetadata:z.any().optional(),
actions: z.array(z.object({
    availableActionId:z.string(),
    actionMetadata:z.any().optional()
}))

})