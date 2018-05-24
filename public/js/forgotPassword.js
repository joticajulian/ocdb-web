$('#email-sent').hide();
$('#email-problems').hide();

function sendEmail(){
  var auth = firebase.auth();
  var emailAddress = $('#email').val();

  auth.sendPasswordResetEmail(emailAddress).then(function() {
    $('#email-sent').show();
    $('#email-problems').hide();
  }).catch(function(error) {
    $('#email-sent').hide();
    $('#email-problems').text(error.message).show();
  });
}