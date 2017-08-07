$( document ).ready(function() {

  $( ".cross" ).hide();
  $( ".hamburger" ).click(function() {
    $( ".menu-collapse" ).toggleClass("active-flex");
    $( ".hamburger" ).hide();
    $( ".cross" ).show();
  });

  $( ".cross" ).click(function() {
    $( ".menu-collapse" ).removeClass("active-flex");
    $( ".cross" ).hide();
    $( ".hamburger" ).show();
  });

});