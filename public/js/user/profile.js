

$(document).ready(function(){
  $('.add-btn').on('click',function(){
    $('#add-input').click();
  });

  $('#add-input').on('change',function(){
    var addInput=$('#add-input');

    if(addInput.val() !=''){
      var formData=new FormData();
      formData.append('upload',addInput[0].files[0]);
      $('#completed').html('File Uploaded Successfully');

      $.ajax({
          type:'POST',
          url:'/userupload',
          data:formData,
          processData:false,
          contentType:false,
          success:function(){
          addInput.val('');
        }
      })
    }
    ShowImage(this);
  });
//save data in database
$('#profile').on('click',function(){
  var username=$('#username').val();
  var fullname=$('#fullname').val();
  var country=$('#country').val();
  var gender=$('#gender').val();
  var mantra=$('#mantra').val();
  var upload=$('#add-input').val();
  var image=$('#user-image').val();//existing image name

  var valid=true;

  if(upload===''){
    $('#add-input').val(image);
  }

  if(username== '' || fullname== '' || country=='' || gender== '' || mantra== ''){
    valid=false;
    $('#error').html('<div class="alert alert-danger">You cannot Submit an empty field</div>');
  }else {
    upload=$('#add-input').val();
    $('#error').html('');
  }

  if(valid===true){
    $.ajax({
      url:'/settings/profile',
      type:'POST',
      data:{
        username:username,
        fullname:fullname,
        country:country,
        gender:gender,
        mantra:mantra,
        upload:upload

      },
      success:function(){
        setTimeout(function(){
          window.location.reload();//reload data autometically from database
        },200);
      }
    })
  }else {
    return false;
  }


});
});

// part 188 tutorial
function ShowImage(input) {
  if(input.files && input.files[0]){
    var reader=new FileReader();//The FileReader object lets web api asynchronously read the contents of files stored on the user's computer
    reader.onload=function(e){
      $('#show_img').attr('src',e.target.result);
    }
   reader.readAsDataURL(input.files[0]);
  }
}
