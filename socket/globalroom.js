var uniqBy = require('lodash.uniqby');
var remove = require('lodash.remove');

module.exports=function(io,Global,_){
  const clients=new Global();
  io.on('connection',(socket)=>{
    socket.on('global room',(global)=>{
      socket.join(global.room);

      clients.EnterRoom(socket.id,global.name,global.room,global.img);
      const nameProp=clients.GetRoomList(global.room);
      //console.log(nameProp);
       const arr=uniqBy(nameProp,'name');//uniqBy is a lodash method to return unique array
      //console.log(arr);
      io.to(global.room).emit('loggedInUser',arr);
    });

    socket.on('disconnect',()=>{
      var user=clients.RemoveUser(socket.id);
      if(user){
        const userData=clients.GetRoomList(user.room);
        const arr=uniqBy(userData,'name');
        const removeData=remove(arr,{'name':user.name});
        io.to(user.room).emit('loggedInUser',arr);
      }
    })
  });
}
