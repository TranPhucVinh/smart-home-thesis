$(document).ready(function(){
  // $("form").submit((event) => {
  //       let name = $("#farmName").val();
  //      $.ajax({url: "farm/add",
  //               type:"POST",
  //               async: true,
  //               data: {name: name},
  //               success: function(result){
  //           $("#duplicateName").html(result);
  //           }
  //       }); 
  //   });
$(".delete-area").click(function(){
        var id = $(this).attr("data-id");
        var url = "farm/delete/"+id;
        if(confirm("Delete area ? ")){
            $.ajax({
                url: url,
                type: "DELETE",
                success: function(result){
                    window.location.href="/farm";
                }
            });
        }
    });
    $(".edit-area").click(function(){
        $("#editid").val($(this).attr("data-id"));
        $("#editname").val($(this).attr("data-name"));
    });
   });