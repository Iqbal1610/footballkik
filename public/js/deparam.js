(function($){
$.deparam=$.deparam || function(uri){
  if(uri===undefined){
    uri=window.location.pathname;
  }
  var value1=window.location.pathname;//take the url like /chat/hridoy.khalil
  var value2=value1.split('/');// split the uri {"","chat","hridoy.khalil"}
  var value3=value2.pop();// return last value of array value2 thats the "hridoy.khalil"
  return value3;
}
})(jQuery);
