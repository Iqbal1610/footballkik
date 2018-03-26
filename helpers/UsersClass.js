class Users{
  constructor(){
    this.users=[];//define a array

  }
  AddUserData(id,name,room){//here id is socket.id
    var users={id,name,room};
    this.users.push(users);
    return users;

  }

  RemoveUser(id){
    var user=this.GetUser(id);
    if(user){
      this.users=this.users.filter((user)=>user.id !==id);//create an array without existing id..no repeat of same id
    }
    return user;
  }

  GetUser(id){
    var getUser=this.users.filter((userId)=>{
      return userId.id===id;
    })[0];
    return getUser;
  }

  GetUsersList(room){
    var users=this.users.filter((user)=>user.room===room);

    var namesArray=users.map((user)=>{
      return user.name;
  });
  return namesArray;
  }

}

module.exports={Users};
