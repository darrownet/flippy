/*
$(function () {
  "use strict";
  $('#top_car').carouFredSel({
    circular: true,
    infinite: true,
    responsive: true,
    direction   : "left",
    width: null,
    height: null,
    align: "center",
    items: {
      start: 0,
      width: '600px',
      height: '200px',
      visible: {
        min: 1,
        max: 1
      }
    },
    onCreate: function (data) {
      $(this).trigger("currentPosition", function (pos) {
        //console.log(pos);
      });
    },
    scroll: {
      duration: 500,
      onAfter : function (data) {
        $(this).trigger("currentPosition", function (pos) {
          //console.log(pos);
        });
      }
    },
    auto: {
      play: true,
      timeoutDuration: 15000
    },
    swipe: {
      onTouch: true
    }
  });
});
*/$(function(){"use strict";$("#row6").fitVids();$("#top_car").carouFredSel({circular:!0,infinite:!0,responsive:!0,auto:!0,width:"100%"})});