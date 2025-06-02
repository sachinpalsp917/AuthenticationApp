import express from "express"

const app = express()

app.get("/",(req,res)=>{
    res.status(200).json({
        message:"healthy"
    })
})

app.listen(3000,()=>{
    console.log("Server is listening on port 3000 in development enviourment");
})