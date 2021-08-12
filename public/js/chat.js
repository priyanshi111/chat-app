//const messages = require("../../src/utils/messages")

//client's functionalities here
const socket = io() //function 

//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages') //location where we want to render the template

//template list
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#Location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix: true}) //this takes query string and parse it

const autoscroll = () =>{
    // new message element
    const $newMessage = $messages.lastElementChild


    //height of the new message 
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const containerHeight = $messages.scrollHeight

    //how far scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}


socket.on('message',(message)=>{ //listening for the msg 'message'
     console.log(message)
     //using mustache library we'll be able to render dynamic templates to the browser without needing to see the message in developer tool
     const html = Mustache.render(messageTemplate,{ //compile template with the data we wanna render inside of it
         username: message.username,
         message: message.text, //now our dynamic messages will show up
         createdAt: moment(message.createdAt).format('h:mm a') //refer moment.js for more methods
     }) 

     $messages.insertAdjacentHTML('beforeend',html) //to insert html ajacent to div element
     autoscroll()

})
//seperate handler for location bcoz we want to print it in developers tool not on browser
socket.on('locationMessage',(message)=>{ //listening to locationMessage event
     console.log(message)
     const html = Mustache.render(locationMessageTemplate,{ //rendering the template
         username: message.username,
         url: message.url,
         createdAt: moment(message.createdAt).format('h:mm a') //moment used to format 

     })
     $messages.insertAdjacentHTML('beforeend',html)
     autoscroll()
}) 
//rendering template
socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})
 
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault() //to prevent default behavior where browser goes through a full page refresh

    $messageFormButton.setAttribute('disabled','disabled')  //this disables the form once its submitted

    //disable 
    const message = e.target.elements.message.value //grabbing the input message

    socket.emit('sendMessage',message,(error)=>{ //emiting msg data 
        $messageFormButton.removeAttribute('disabled') //re-enable the button
        $messageFormInput.value = '' //clearing th input after it has been sent
        $messageFormInput.focus() //moving the focus back to input
        //enable

        if(error){
            return console.log(error)
        }
        console.log('Message delivered!')
    }) 
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    //disabling the button afte once clicked
    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },() => { //client acknow. funct
            $sendLocationButton.removeAttribute('disabled') //re enabling the button again
            console.log('Location shared') //this will show on client side who shared the location, after getting acknow from server
        })
    })
})

socket.emit('join',{username, room},(error)=>{
    if(error){
        alert(error)
        location.href = '/' //to redirect user to the join page so that they can again fill correct username and room
    }
}) //brand new event that the server is going to listen for i.e username and room values

