module.exports=function(io,Users){//here Users come from helpers

  const users=new Users();
  //var users=[];
  io.on('connection',(socket)=>{
    console.log('User Connected');
    socket.on('join',(params,callback)=>{
      socket.join(params.room);//join to particular group
      // users.push(params.name);//it is implement in ES6 class in UsersClass.js file
      // users.push(params.room);
      // users.push(socket.id);

      users.AddUserData(socket.id,params.name,params.room);
      //console.log(users);
      io.to(params.room).emit('usersList',users.GetUsersList(params.room));
      callback();
    });
    socket.on('createMessage',(message,callback)=>{
      //console.log(message);
      io.to(message.room).emit('newMessage',{//io,to() is used for send message every member of the group
        text:message.text,
        room:message.room,
        from:message.sender
      });
      callback();
    });
    socket.on('disconnect',()=>{
      var user=users.RemoveUser(socket.id);
      if(user){
        io.to(user.room).emit('usersList',users.GetUsersList(user.room));
      }
    })
  });

}
