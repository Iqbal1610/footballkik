module.exports=function(async,Club,Users){
  return{
    SetRouting:function(router){
      router.get('/results',this.getResults);
      router.post('/results',this.postResults);

      router.get('/members',this.viewMembers);
      router.post('/members',this.searchMembers);
    },
    getResults:function(req,res){
    res.redirect('/home');
    },
    postResults:function(req,res){
      async.parallel([
        function(callback){//RegExp is a pattern matching constructor
          const regex=new RegExp((req.body.country),'gi');//gi g for global search and i for ignore lower or uppercase letter
          Club.find({'$or':[{'country':regex},{'name':regex}]},(err,result)=>{//search by country or name in club
            callback(err,result);
          })
        }
      ],(err,results)=>{
        const res1=results[0];
        const dataChunk=[];//empty array to show 3 club image in a row
        const chunkSize=3;
        for(let i=0; i<res1.length; i+=chunkSize){
          dataChunk.push(res1.slice(i,i+chunkSize)); //slice kept a copy of every value of array
        }
          res.render('results',{title:'Footballkik - Results',user:req.user,chunks: dataChunk});
      })

    },

    viewMembers:function(req,res){

      async.parallel([
        function(callback){//RegExp is a pattern matching constructor

          Users.find({},(err,result)=>{
            callback(err,result);
          });
        }
      ],(err,results)=>{
        const res1=results[0];
        const dataChunk=[];//empty array to show 3 club image in a row
        const chunkSize=4;
        for(let i=0; i<res1.length; i+=chunkSize){
          dataChunk.push(res1.slice(i,i+chunkSize)); //slice kept a copy of every value of array
        }
          res.render('members',{title:'Footballkik - Results',user:req.user,chunks: dataChunk});
      })


    },

    searchMembers:function(req,res){
      async.parallel([
        function(callback){
          const regex=new RegExp((req.body.username),'gi');

          Users.find({'username':regex},(err,result)=>{
            callback(err,result);
          });
        }
      ],(err,results)=>{
        const res1=results[0];
        const dataChunk=[];
        const chunkSize=4;
        for(let i=0; i<res1.length; i+=chunkSize){
          dataChunk.push(res1.slice(i,i+chunkSize)); //slice kept a copy of every value of array
        }
          res.render('members',{title:'Footballkik - Results',user:req.user,chunks: dataChunk});
      })
    }
  }
}
