class Global{
  constructor(){
    this.globalRoom=[];//define a array

  }
  EnterRoom(id,name,room,img){//here id is socket.id
    var roomName={id,name,room,img};
    this.globalRoom.push(roomName);
    return roomName;

  }
  RemoveUser(id){
    var user=this.GetUser(id);
    if(user){
      this.globalRoom=this.globalRoom.filter((user)=>user.id !==id);//create an array without existing id..no repeat of same id
    }
    return user;
  }

  GetUser(id){
    var getUser=this.globalRoom.filter((userId)=>{
      return userId.id===id;
    })[0];
    return getUser;
  }



  GetRoomList(room){
    var roomName=this.globalRoom.filter((user)=>user.room===room);

    var namesArray=roomName.map((user)=>{
      return {
        name:user.name,
        img:user.img
      }
  });
  return namesArray;
  }

}

module.exports={Global};
