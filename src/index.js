const path = require('path') //core node module so no need to install it
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage,generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)//instance of socket.io to configure web sockets with our server

const port = process.env.PORT || 3000 //default port value is 3000 which we are using locally on our machine
const publicDirectoryPath = path.join(__dirname,'../public') //join current directory for this file with public folder

app.use(express.static(publicDirectoryPath))

io.on('connection',(socket)=>{ //connection event will happen whenevr the socket.io server gets a new connection
   // console.log('New websocket connection')
     
    socket.on('join',(options,callback)=>{ //listener for join event
         const {error,user} = addUser({id: socket.id, ...options})    
         
         if(error){
              return callback(error)
         }

         socket.join(user.room) //this method we can only use on the server...this method allows us to join a given chatroom whose name we provided
         
         socket.emit('message',generateMessage('Admin','Welcome!')) //emit the message to the user who has joined a new room
         //when a new comnection is set up send msg to everyone
         socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined`)) //sending msg to everybody in that room except the sender
         io.to(user.room).emit('roomData',{
              room: user.room,
              users: getUsersInRoom(user.room)
         })

         callback() //letting the client know that they were able to join
    })

    //acknowledgment for sent msg 
    socket.on('sendMessage',(message,callback)=>{ //listening for sendMessage event
         const user = getUser(socket.id)
         const filter = new Filter()

         if(filter.isProfane(message)){
              return callback('Profanity is not allowed') //if profinity is there provide this string
         }

         io.to(user.room).emit('message', generateMessage(user.username,message))  //sending the msg data (that came from another user) to every connected client in that room
         callback() //if profinity is not there then provide nothing
    }) 


    //setting up new listener for sendLOcation and get the location object we set up in chat.js
    socket.on('sendLocation',(coords,callback)=>{ //listener for sendLocation event
     const user = getUser(socket.id)  
     io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`)) //server is sharing the location of the user with everyone else
         callback() //acknow. send to client
    }) 

    //when client gets disconnected display msg to everyone 
    socket.on('disconnect',()=>{ //disconnect is builtin event 
         const user = removeUser(socket.id) 

         if(user){ //if user has been removed
             io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`))
             io.to(user.room).emit('roomData',{
               room: user.room,
               users: getUsersInRoom(user.room)
             })
         }
    })  
})

server.listen(port,()=>{
    console.log('server is up')
})