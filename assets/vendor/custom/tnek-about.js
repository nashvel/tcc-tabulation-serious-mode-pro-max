
function del_about(){
    var result = confirm("Want to delete?");
    if (result) {
        var val = window.location.hash;
        var str = val;
        var loc = str.replace('#', '');

        var key = loc;

        $.ajax({
            type: "POST",
            url: "functions/adm_command.php",
            data: {"del_about": key},
           success: function(html){
                $('html,body').scrollTop(0);
                $('#idsp').html(html);
            },
        });
    }
}

function update_about(){
    var iFrameDOM = $("iframe#iView").contents();
    document.getElementById("displayx").value = richTextField.document.getElementsByTagName('body')[0].innerHTML;

    var title = document.getElementById("sub-list").value;

    if(title == ""){
        var etitle = "Base Info";                                       
        var title_1 = "Base Info";
        var details = document.getElementById("displayx").value;

        $.ajax({
            type: "POST",
            url: "functions/adm_command.php",
            data: {"edited_about": etitle, "keywords": title_1, "details_about": details},
           success: function(html){
                $('#idsp').html(html);
            },
        });
    }else{
        var etitle = document.getElementById("sub-list").value;                                        
        var title_1 = document.getElementById("sub-list1").value;
        var details = document.getElementById("displayx").value;

        $.ajax({
            type: "POST",
            url: "functions/adm_command.php",
            data: {"edited_about": etitle, "keywords": title_1, "details_about": details},
           success: function(html){
                $('#idsp').html(html);
            },
        });
    }

}

function new_about(){
    var iFrameDOM = $("iframe#iView").contents();
    document.getElementById("displayx").value = richTextField.document.getElementsByTagName('body')[0].innerHTML;
    var etitle = document.getElementById("sub-list").value;
    var details = document.getElementById("displayx").value;
    $.ajax({
            type: "POST",
            url: "functions/adm_command.php",
            data: {"keywords_new_about": etitle, "details_new_about": details},
           success: function(html){
                $('#idsp').html(html);
            },
        });
    
}

function qwe(){
    var val = window.location.hash;
    var str = val;
    var loc = "iframe/about.php?edit=" + str.replace('#', '');
    $('html,body').scrollTop(0);
    document.getElementById('iView').src = loc;
    richTextField.document.getElementsByTagName('body')[0].textContent = richTextField.document.getElementsByTagName('body')[0].innerHTML;
    var hashtt = str.replace('#', '');
    var hasht = hashtt;
    document.getElementById("sub-list").value = hasht.replace('%20', ' ');
    document.getElementById("sub-list1").value = hasht.replace('%20', ' ');
    document.getElementById("sub-list").style.display = "block";
    
}

