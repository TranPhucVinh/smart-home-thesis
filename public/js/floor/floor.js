$(document).ready(function(){
$(".delete-room").click(function(){
        var id = $(this).attr("data-id");
        var url = "floor/delete/"+id;
        if(confirm("Delete room ? ")){
            $.ajax({
                url: url,
                type: "DELETE",
                success: function(result){
                    window.location.href="/floor";
                }
            });
        }
    });
    $(".edit-room").click(function(){
        $("#editid").val($(this).attr("data-id"));
        $("#editname").val($(this).attr("data-name"));
    });
   });