

module.exports=function(Users,async,Message,FriendResult,Group){

  return {
    SetRouting: function(router){
      router.get('/group/:name',this.groupPage);
      router.post('/group/:name',this.groupPostPage);
      router.get('/logout',this.logout)
    },
    groupPage:function(req,res){
      const name=req.params.name;
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
    // find all groupmessage from database for a particular group
      function(callback){
        Group.find({})
        .populate('sender')
        .exec((err,result)=>{
          callback(err,result);
        });
      }

      ],(err,results)=>{
        const result1=results[0];
        const result2=results[1];
        const result3=results[2];
        //console.log(result1);
        res.render('groupchat/group',{title:'Footballkik - Group',user:req.user,
        groupName:name,data:result1,chat:result2,groupMsg:result3});
      });

    },
  groupPostPage:function(req,res){//friendRequest request functionality is in helper folder
    FriendResult.PostRequest(req,res,'/group/'+req.params.name);

    async.parallel([
      function(callback){
        if(req.body.message){//message is the name of the textarea in group.ejs
          const group=new Group();
          group.sender=req.user._id;
          group.body=req.body.message;
          group.name=req.body.groupName;
          group.createdAt=new Date();

          group.save((err,msg)=>{
            //console.log(msg);
            callback(err,msg);
          })

        }
      }
    ],(err,results)=>{
      res.redirect('/group/'+req.params.name);
    })

},
logout:function(req,res){
  req.logout();
  req.session.destroy((err)=>{
    res.redirect('/');
  })
}
  }
}
