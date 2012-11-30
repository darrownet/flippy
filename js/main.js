$(function () {
  "use strict";
  $("#row6").fitVids();
  $("#top_car").carouFredSel({
    circular: true,
    infinite: true,
    responsive: true,
    width: '100%',
    auto: {
      play: true,
      timeoutDuration: 4500
    },
    pagination: "#pag"
  });
});
