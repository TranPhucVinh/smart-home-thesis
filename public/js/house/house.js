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
$(".delete-floor").click(function(){
        var id = $(this).attr("data-id");
        var url = "house/delete/"+id;
        if(confirm("Delete floor ? ")){
            $.ajax({
                url: url,
                type: "DELETE",
                success: function(result){
                    window.location.href="/house";
                }
            });
        }
    });
    $(".edit-floor").click(function(){
        $("#editid").val($(this).attr("data-id"));
        $("#editname").val($(this).attr("data-name"));
    });
   });