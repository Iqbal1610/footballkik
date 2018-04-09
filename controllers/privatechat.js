module.exports=function(async,Users,Message,FriendResult){
  return{
    SetRouting:function(router){
      router.get('/chat/:name',this.getchatPage);
      router.post('/chat/:name',this.chatPostPage);
    },
    getchatPage:function(req,res){
      async.parallel([
        function(callback){// how many friend requestto a user
          Users.findOne({'username':req.user.username})
               .populate('request.userId')
               .exec((err,result)=>{
                 callback(err,result);
               })
        },
        //get private message from database

        function(callback){
            const nameRegex=new RegExp("^"+req.user.username.toLowerCase(),"i");
          Message.aggregate([
            {$match:{$or:[{'senderName':nameRegex},{'receiverName':nameRegex}]}},
            {$sort:{'createdAt':-1}},
            {
              $group:{"_id":{
                "last_message_between":{
                  $cond:[//cond condition operator in mongodb
                    {
                      $gt:[//gt greaterthan operator in mongodb
                        {$substr:["$senderName",0,1]},//$substr sub String
                        {$substr:["$receiverName",0,1]}
                      ]
                    },
                    {$concat:["$senderName"," and ","$receiverName"]},//concat concatenation operator
                    {$concat:["$receiverName"," and ","$senderName"]}

                  ]
                }
              },"body":{$first:"$$ROOT"}//return the document of the current user update message
            }
          }
        ],function(err,newResult){
          //console.log(newResult);
          callback(err,newResult);
        });
      },
//this function returns the message between sender and receiver as array
      function(callback){
        Message.find({'$or':[{'senderName':req.user.username},
        {'receiverName':req.user.username}]})
        .populate('sender')
        .populate('receiver')
        .exec((err,result3)=>{
          //console.log(result3);
          callback(err,result3)
        })
      }
      ],(err,results)=>{
        const result1=results[0];
        const result2=results[1];
        const result3=results[2];
        //console.log(result1);
        const params=req.params.name.split('.');//get username and split it by . and return array
        const nameParams=params[0];// receiverName
        res.render('private/privatechat',{title:'Footballkik - Private Chat',
        user:req.user,data:result1,chat:result2, chats:result3,name:nameParams});
      });


    },

    chatPostPage:function(req,res,next){
      const params=req.params.name.split('.');//get username and split it by . and return array
      const nameParams=params[0];// receiverName
      const nameRegex=new RegExp("^"+nameParams.toLowerCase(),"i");

      async.waterfall([// if want to transfer one function value to another we use waterfall
        function(callback){
        if(req.body.message){// here message is the name of messagebox
          Users.findOne({'username':{$regex:nameRegex}},(err,data)=>{//$regex is a mongodb method
            callback(err,data);
          })

        }
      },
      function(data,callback){
        if(req.body.message){
          const newMessage= new Message();
          newMessage.sender=req.user._id;
          newMessage.receiver=data._id;
          newMessage.senderName=req.user.username;
          newMessage.receiverName=data.username;
          newMessage.message=req.body.message;
          newMessage.userImage=req.user.UserImage;
          newMessage.createdAt=new Date();

          newMessage.save((err,result)=>{
            if(err){
              return next(err);
            }
            //console.log(result);
            callback(err,result);
          })
        }
      }
    ],(err,results)=>{
      res.redirect('/chat'+req.params.name);
    });


    FriendResult.PostRequest(req,res,'/chat'+req.params.name);


    }
  }
}
