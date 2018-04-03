const mongoose=require('mongoose');

var groupMessage=mongoose.Schema({

  sender:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
  body:{type:String},
  name:{type:String},//group name
  createdAt:{type:Date,default:Date.now}
  });

module.exports=mongoose.model('GroupMessage',groupMessage);
