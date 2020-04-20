$(document).ready(function() {
    $('#subscription-form').submit(function(event) {
        event.preventDefault();

        $('#email-msg').hide();
        $("#captcha-unselected-msg").hide();

        $.ajax({
            url : $(this).attr("action"),
            type: $(this).attr("method"),
            data : $(this).serialize()
        }).done(function(response) {
            window.location.href = response.redirect;
        }).fail(function(error)  {
            responseMsg = error.responseJSON.responseMessage;
            if (responseMsg === "Invalid Email") {
                $('#email-msg').show();
            }
            if (responseMsg === "Please select captcha") {
                $("#captcha-unselected-msg").show();
            }
        }); ;
    })
});