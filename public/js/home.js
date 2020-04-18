$(document).ready(function() {
    $('#subscription-form').submit(function(event) {
        event.preventDefault();

        $.ajax({
            url : $(this).attr("action"),
            type: $(this).attr("method"),
            data : $(this).serialize()
        }).done(function(response) {
            window.location.href = response.redirect;
        }).fail(function(error)  {
            console.log(error);
        }); ;
    })
});