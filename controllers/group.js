

module.exports=function(Users,async){

  return {
    SetRouting: function(router){
      router.get('/group/:name',this.groupPage);
      router.post('/group/:name',this.groupPostPage);
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
        }
      ],(err,results)=>{
        const result1=results[0];
        //console.log(result1);
        res.render('groupchat/group',{title:'Footballkik - Group',user:req.user,groupName:name,data:result1});
      });

    },
  groupPostPage:function(req,res){
    async.parallel([//sending friend request
      function(callback){
        if(req.body.receiverName){
          Users.update({
            'username':req.body.receiverName,
            'request.userId':{$ne: req.user._id},//$ne is the mongodb not equal sign
            'friendsList.friendId':{$ne:req.user._id}
            },
            {
              $push:{request:{
                userId:req.user._id,
                username:req.user.username
              }},
              $inc:{totalRequest:1}
            },(err,count)=>{
              callback(err,count);
            })
        }
      },
      function(callback){
        if(req.body.receiverName){
          Users.update({
            'username':req.user.username,
            'sentRequest.username':{$ne:req.body.receiverName}
          },
          {
            $push:{sentRequest:{
              username:req.body.receiverName
            }}
          },(err,count)=>{
            callback(err,count);
          })
        }
      }
    ],(err,results)=>{
      res.redirect('/group/'+req.params.name);
    });

  async.parallel([//Accepting friendRequest
//this func is updated for the receiver of the friend request when it is accepted
    function(callback){
      if(req.body.senderId){
        Users.update({
          '_id':req.user._id,
          'friendsList.friendId':{$ne:req.body.senderId}
        },{
          $push:{friendsList:{
            friendId:req.body.senderId,
            friendName:req.body.senderName
          }},
          $pull:{request:{//pull method used in mongodb to remove the data form database
            userId:req.body.senderId,
            username:req.body.senderName
          }},
          $inc:{totalRequest:-1}
        },(err,count)=>{
          callback(err,count);
        });
      }
    },
    //this func is updated for the sender of the friend request when it is accepted by the receiver
    function(callback){
      //for update sender data
      if(req.body.senderId){
        Users.update({
          '_id':req.body.senderId,
          'friendsList.friendId':{$ne:req.user._id}//here req.user._id of the receiver
        },{
          $push:{friendsList:{
            friendId:req.user._id,
            friendName:req.body.senderName
          }},
          $pull:{sentRequest:{//pull method used in mongodb to remove the data form database
          username:req.user.username
          }},

        },(err,count)=>{
          callback(err,count);
        });
      }
    },

    //this func is updated for the receiver of the friend request when it is cancel
    function(callback){

      if(req.body.user_Id){
        Users.update({
          '_id':req.user._id,
          'request.userId':{$eq:req.body.user_Id}//$eq stands for isequal
        },{
          $pull:{request:{//pull method used in mongodb to remove the data form database
          userId:req.body.user_Id
          }},
          $inc:{totalRequest:-1}

        },(err,count)=>{
          callback(err,count);
        });
      }
    },

    //this func is updated for the sender of the friend request when it is cancel
    function(callback){

      if(req.body.user_Id){
        Users.update({
          '_id':req.body.user_Id,
          'sentRequest.username':{$eq:req.user.username}//$eq stands for isequal
        },{
          $pull:{sentRequest:{//pull method used in mongodb to remove the data form database
          username:req.user.username
          }}
          },(err,count)=>{
          callback(err,count);
        });
      }
    }

  ],(err,results)=>{
      res.redirect('/group/'+req.params.name);
  });
   }
  }
}
