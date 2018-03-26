const express=require('express');
const bodyParser=require('body-parser');
const ejs=require('ejs');
var https = require('https');
const http=require('http');
var fs = require('fs');
const path=require('path');
const cookieParser=require('cookie-parser');
const validator=require('express-validator');
const session=require('express-session');
const MongoStore=require('connect-mongo')(session);
const mongoose=require('mongoose');
const flash=require('connect-flash');
const passport=require('passport');
const socketIO=require('socket.io');
const {Users}=require('./helpers/UsersClass');


const container=require('./container');


container.resolve(function(users,_,admin,home,group){

  mongoose.Promise=global.Promise;
  mongoose.connect('mongodb://localhost/footballkik');


  const app=SetupExpress();



function SetupExpress(){
  // var options = {
  //   key: fs.readFileSync('abels-key.pem'),
  //   cert: fs.readFileSync('abels-cert.pem')
  // };
  const app=express();

  //const server=https.createServer(options,app);
  const server=http.createServer(app);
  const io=socketIO(server);
  server.listen(3000,()=>{
    console.log('Listening on port 3000');
  });
  // const server=https.createServer(options,app);
  // server.listen(443,()=>{
  //   console.log('Listening on port 443');
  // });

  ConfigureExpress(app);

  require('./socket/groupchat')(io,Users);//pass the UsersClass data to the groupchat
  require('./socket/friend')(io);

  //Setup router
  const router=require('express-promise-router')();
  users.SetRouting(router);
  admin.SetRouting(router);
  home.SetRouting(router);
  group.SetRouting(router);


  app.use(router);
}



function ConfigureExpress(app){

  require('./passport/passport-local');
  require('./passport/passport-facebook');
  require('./passport/passport-google');
  app.use(express.static('public'));
  app.use(cookieParser());
  app.set('view engine','ejs');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));

  app.use(validator());

  app.use(session({
    secret:'thisisasecretkey',
    resave:true,
    saveInitialized:true,
    store:new MongoStore({mongooseConnection:mongoose.connection})
  }))
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.locals._=_;//for use lodash in any type of file like js,ejs etc
}

});
