function new_article(){
    var iFrameDOM = $("iframe#iView").contents();
    document.getElementById("displayx").value = richTextField.document.getElementsByTagName('body')[0].innerHTML;
    var titlez = document.getElementById("titlez").value;
    var authorz = document.getElementById("authorz").value;
    var categoryz = document.getElementById("categoryz").value;
    var bodyz = document.getElementById("displayx").value;
    $.ajax({
            type: "POST",
            url: "functions/adm_command.php",
            data: {"art_header": titlez, "art_category": categoryz, "art_body": bodyz , "art_author": authorz},
            success: function(html){
                $('#idsp').html(html);
            },
        });
    
}

/*$(document).ready(function (e) {
$("#uploadimage").on('submit',(function(e) {
e.preventDefault();
$("#message").empty();
$('#loading').show();
$.ajax({
url: "ajax_php_file.php", // Url to which the request is send
type: "POST",             // Type of request to be send, called as method
data: new FormData(this), // Data sent to server, a set of key/value pairs (i.e. form fields and values)
contentType: false,       // The content type used when sending data to the server.
cache: false,             // To unable request pages to be cached
processData:false,        // To send DOMDocument or non processed data file it is set to false
success: function(data)   // A function to be called if request succeeds
{
$('#loading').hide();
$("#message").html(data);
}
});
}));*/