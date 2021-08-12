//this file is created for defining few functions that we use again and again for generating message objects
const generateMessage = (username,text)=>{
    return{
        username,
        text,
        createdAt: new Date().getTime() //sends timestamp of msg from server to client
    }
}
const generateLocationMessage = (username,url)=>{
    return{
        username,
        url,
        createdAt: new Date().getTime() //sends timestamp of msg from server to client
         
    }
}

module.exports = { //exporting this function so that other files like index.js could use it 
    generateMessage,
    generateLocationMessage
}