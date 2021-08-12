const users = [] //array where we will store the users

//addUser, removeUser, getUser, getUsersInRoom
const addUser = ({id,username,room})=>{ //id is unique for every user connecting and it is not assigned by us
    
    //clean the data
    username = username.trim().toLowerCase(),
    room = room.trim().toLowerCase()
    
    //validate the data
    if(!username || !room){
        return{
            error: 'Username and room are required.'
        }
    }

    //check for existing user
    const existingUser = users.find((user)=>{ //we are trying to find a match
        return user.room === room && user.username===username//we need to check if the user is trying to join the same room as the existing user with same username 
    })

    //id existingUser exists return error msg
    if(existingUser){
        return{
            error: 'Username is already taken!'
        }
    }

    //store user when existingUser not found
    const user = {id,username,room}
    users.push(user) //will push the three attributes of user in array
    return {user}
}

const removeUser = (id)=>{
    const index = users.findIndex((user)=>{ //findindex gives index of user back
        return user.id === id  //returns -1 is match not found
    })
    if(index !== -1){
        return users.splice(index,1)[0] //removing 1 user and returning array of items we removed.once match is found this method will stop searching unlike filter method
    }
}

//to find the user with given id
const getUser= (id)=>{ //return the user if id matches
    return users.find((user) => user.id === id) //shorthand syntax used

} 
 
//will list out all users in that room
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user)=> user.room===room) //if both matched it will return true and we will keep that user in the array else filter that user
}
 
module.exports = { //exporting these functions so that can be used in index.js
    addUser,
    removeUser,
    getUser,
    getUsersInRoom 
}

