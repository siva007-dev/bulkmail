import { useState } from "react";
import axios from "axios"
import * as XLSX from "xlsx"

function App() {

  const [sts,setsts]=useState(false)
  const[msg,setmsg]=useState("")
  const[emaillist,setemaillist]=useState([])

  function change(e){
    setmsg(e.target.value)
  }
  function send(){
    setsts(true)
    axios.post(process.env.API_URL,{msg:msg , emaillist:emaillist})
    .then(function(data)
    {
      if(data.data=== true){
        alert("email sent successfully")
        setsts(false)
      }
      else{
        alert("email not sent")
      }
    })
  }

  function handlefile(event){

     const file = event.target.files[0]
    const reader = new FileReader()

    reader.onload = function(event){
        const data = event.target.result
        const workbook = XLSX.read(data, { type: "binary" })
        const sheetname = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetname]
        const emaillist = XLSX.utils.sheet_to_json(worksheet, {header:"A"})
        const totalemail=emaillist.map(function(item){return item.A})
        setemaillist(totalemail)
    }
    reader.readAsBinaryString(file)

  }
  return (
   <div>

    <div className="bg-blue-950 text-white text-center">
      <h1 className="text-2xl font-medium px-5 py-3">Bulk mail</h1>
    </div>

     <div className="bg-blue-800 text-white text-center">
      <h1 className="text-2xl font-medium px-5 py-3">We can help your business with sending multiple emails at once</h1>
    </div>

    <div className="bg-blue-600 text-white text-center">
      <h1 className="text-2xl font-medium px-5 py-3">Drag and Drop</h1>
    </div>

     <div className="bg-blue-400 flex flex-col items-center text-black px-5 py-3 ">
      <textarea onChange={change} className="w-[80%] h-32 px-2 py-2 outline-none border border-black rounded-md" placeholder="Enter the  email text"></textarea>
    
    <div>
      <input onChange={handlefile} className="border-4 border-dashed px-5 py-4  mt-5 mb-5" type="file"></input>
    </div>

    <p>Total emails in this file {emaillist.length}</p>

    <button onClick={send} className="bg-blue-950 px-2 py-2 text-white rounded-md mt-5">{sts?"sending":"send"}</button>

    </div>

    <div className="bg-blue-300 text-white text-center p-8">
 
    </div>

    <div className="bg-blue-200 text-white text-center p-8">
  
    </div>

    
   </div>
  );
}

export default App;
