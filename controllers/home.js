
module.exports=function(async,Club,_){
  return {
    SetRouting:function(router){
        router.get('/home',this.homePage);
    },
    homePage:function(req,res){
      async.parallel([
        function(callback){
          Club.find({},(err,result)=>{
            callback(err,result);
          })
        },
        // function(callback){// how many friend requestto a user
        //   Users.findOne({'username':req.user.username})
        //        .populate('request.userId')
        //        .exec((err,result)=>{
        //          callback(err,result);
        //        })
        // }
        // function(callback){
        //   Club.aggregate({
        //     $group:{
        //       _id:"$country"
        //     }
        //   },(err,newResult)=>{
        //     callback(err,newResult);
        //   });
        // }

      ],(err,results)=>{
        const res1=results[0];//all data
        const res2=results[1];// group country data
         //console.log(res2);
        const dataChunk=[];//empty array to show 3 club image in a row
        const chunkSize=3;
        for(let i=0; i<res1.length; i+=chunkSize){
          dataChunk.push(res1.slice(i,i+chunkSize)); //slice kept a copy of every value of array
        }
        //console.log(dataChunk);
        res.render('home',{title:'Footballkik -Home',user:req.user,data: dataChunk});
      })

    }

  }
}
