$(function () {
  // Open on article click on Kindle
  $("div[data-href]").on("click", function () {
    window.open($(this).attr("data-href"), "_self");
  });
});
