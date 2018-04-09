
module.exports=function(async,Club,_,Users,Message,FriendResult){
  return {
    SetRouting:function(router){
        router.get('/home',this.homePage);
        router.post('/home',this.postHomePage);
        router.get('/logout',this.logout)
    },
    homePage:function(req,res){
      async.parallel([
        function(callback){
          Club.find({},(err,result)=>{
            callback(err,result);
          })
        },

        function(callback){
          Club.aggregate([{
            $group:{
              _id:"$country"
            }
          }],(err,newResult)=>{
            callback(err,newResult);
          });
        },

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
          //for getting Notifications message user userImage
          const arr=[
            {path:'body.sender',model:'User'},
            {path:'body.receiver',model:'User'}
          ];
          Message.populate(newResult,arr,(err,newResult1)=>{
            //console.log(newResult1);
            callback(err,newResult1);
          })
        });
      }


      ],(err,results)=>{
        const res1=results[0];//all data
        const res2=results[1];// group country data
        const res3=results[2];
        const res4=results[3];

         //console.log(res2);
        const dataChunk=[];//empty array to show 3 club image in a row
        const chunkSize=3;
        for(let i=0; i<res1.length; i+=chunkSize){
          dataChunk.push(res1.slice(i,i+chunkSize)); //slice kept a copy of every value of array
        }

        const countrySort=_.sortBy(res2,'_id');


        //console.log(dataChunk);
        res.render('home',{title:'Footballkik -Home',user:req.user,chunks: dataChunk,
        country:countrySort,data:res3,chat:res4});
      })

    },
    postHomePage:function(req,res){
      async.parallel([
        function(callback){
          Club.update({
            '_id':req.body.id,
            'fans.username':{$ne:req.user.username}

          },{
            $push:{fans:{
              username:req.user.username,
              email:req.user.email
            }}
          },(err,count)=>{
            console.log(count);
            callback(err,count);
          });
        },



      ],(err,results)=>{
        res.redirect('/home');
      });
      //used for friend request functionality
      FriendResult.PostRequest(req,res,'/home');
    },
    logout:function(req,res){
      req.logout();
      req.session.destroy((err)=>{
        res.redirect('/');
      })
    }

  }
}
