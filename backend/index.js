import express from"express"
import cors from "cors";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();



const app = express()

const corsOptions={
    origin:process.env.APPLICATION_URL
}

app.use(cors(corsOptions))
app.use(express.json())

mongoose.connect(process.env.MONGODB_URL).then(function(){
    console.log("connected to db")
}).catch(function(){
    console.log("failled to connect with db")
})

const credential =mongoose.model("credential",{},"bulkmail")


app.post("/sendemail",async function (req, res) {

await credential.find().then(function(data){
    const transporter=nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:data[0].toJSON().user,
            pass:data[0].toJSON().pass
        }
    })
    
     const msg = req.body.msg
    const emaillist = req.body.emaillist

    new Promise(async function (resolve, reject) {

        try {
            for (var i = 0; i < emaillist.length; i++) {

                await transporter.sendMail(
                    {
                        from: "toknow0000@gmail.com",
                        to: emaillist[i],
                        subject: "message from bulkmail",
                        text: msg
                    }
                )
            }
            resolve("sucess")
        }
        catch (error) {
            reject("failed"+error)
        }

    }).then(function () {
        res.send(true)
    }).catch(function (error) {
        console.log(error)
        res.send(false)
    })
})


})

// module.exports=app

 app.listen(5000, () => {
    console.log("server started sucrssfully...")
 })