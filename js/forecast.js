var DEFAULT_RECT_HEIGHT = 50;
var MIN_RECT_WIDTH = 2;
var TIME_SCALE = 120; // initial value, 2 hrs

function makeRect(index, x, y, width, height) {
    if (!height) {
        height = DEFAULT_RECT_HEIGHT;
    }
    var svgns = "http://www.w3.org/2000/svg";
    var rect = document.createElementNS(svgns, "rect");
    rect.setAttributeNS(null, "x", x);
    rect.setAttributeNS(null, "y", y);
    rect.setAttributeNS(null, "height", height);
    rect.setAttributeNS(null, "width", width);
    rect.setAttributeNS(null, "index", index);
    rect.onclick = function(evt) {
        var r = $(evt.target);
        var idx = r.attr("index") | 0;
        rects.splice(idx, 1);
        redraw();
        verifyCanAdd($("#chunkSize-range").attr("valueAsNumber"));
    };

    // tooltip
    var id = x;
    var tooltip = $("<div class='d3-tip time'>" +
                    Math.round(computeRectWidth.invert(width)) +
                    "</div>");
    $("#timebar-div").append(tooltip);
    tooltip.css("position", "fixed");

    var left = $("#timebar").offset().left + x + (width / 2) - 25;
    tooltip.css("left", left + "px");

    tooltip.css("top", timebarY - DEFAULT_RECT_HEIGHT + "px");
    tooltip.css("opacity", "0");
    tooltip.css("height", DEFAULT_RECT_HEIGHT + "px");

    rect.onmouseover = function() { tooltip.css("opacity", "1"); };
    rect.onmouseout = function() { tooltip.css("opacity", "0"); };

    return rect;
}

var timebarWidth = $("#timebar-div").width() - 20;
var timebarHeight = DEFAULT_RECT_HEIGHT;
var timebar = $("#timebar");
timebar.attr("width", timebarWidth)
       .attr("height", timebarHeight);

var computeRectWidth = d3.scale.linear()
    .domain([1, TIME_SCALE])
    .rangeRound([MIN_RECT_WIDTH, timebarWidth]);

var lastX = 0;
var rects = []; // objects with a width property

function redraw() {
    $("#timebar rect").remove();
    $(".time").remove();
    lastX = 0;
    for (var i = 0; i < rects.length; i++) {
        var value = rects[i].value;
        var w = computeRectWidth(value)
        var rect = makeRect(i, lastX, 0, w);
        timebar.append(rect);
        lastX += w;
    }
}

function addRect(evt, value) {
    if (!canAdd) {
        return;
    }
    if (!value) {
        value = $("#chunkSize-range").attr("valueAsNumber");
    }
    if (lastX + computeRectWidth(value) > timebarWidth) {
        return;
    }
    var w = computeRectWidth(value);
    timebar.append(makeRect(rects.length, lastX, 0, w));
    rects.push({value: value});
    lastX += w;
    verifyCanAdd($("#chunkSize-range").attr("valueAsNumber"));
}

var canAdd = true;
function disableAdd() {
    $("#add-rect").addClass("disabled");
    canAdd = false;
}

function enableAdd() {
    $("#add-rect").removeClass("disabled");
    canAdd = true;
}

function verifyCanAdd(value) {
    if (lastX + computeRectWidth(value) > timebarWidth) {
        disableAdd();
    } else if (!canAdd) {
        enableAdd();
    }
}

function genericRangeInputHandler(name) {
    return function() {
        var value = $("#" + name + "-range").attr("valueAsNumber");
        $("#" + name + "-number").val(value);
        verifyCanAdd(value);
    };
}

function genericNumberInputHandler(name) {
    return function() {
        var value = $("#" + name + "-number").attr("value") | 0;
        $("#" + name + "-range").val(value);
        verifyCanAdd(value);
    };
}

function setTimeScale() {
    var hours = $("#timeScale-range").attr("valueAsNumber");
    TIME_SCALE = 60 * hours;
    computeRectWidth = d3.scale.linear()
        .domain([1, TIME_SCALE])
        .range([MIN_RECT_WIDTH, timebarWidth]);
    $("#chunkSize-range").attr("max", TIME_SCALE);
    $("#chunkSize-number").attr("max", TIME_SCALE);
    redraw();
    verifyCanAdd($("#chunkSize-range").attr("valueAsNumber"));
}

function resizeHandler() {
    replot();
    $("#timebar").remove();
    $("#timebar-div").append('<svg id="timebar"></svg>');
    timebar = $("#timebar");
    timebarWidth = $("#timebar-div").width() - 20;
    timebarHeight = DEFAULT_RECT_HEIGHT;
    timebar = $("#timebar");
    timebar.attr("width", timebarWidth)
           .attr("height", timebarHeight);

    computeRectWidth = d3.scale.linear()
        .domain([1, TIME_SCALE])
        .rangeRound([MIN_RECT_WIDTH, timebarWidth]);
    redraw();
}


$("#add-rect").on("click", addRect);
$("#set-timeScale").on("click", setTimeScale);

$("#chunkSize-number").on('keyup', genericNumberInputHandler("chunkSize"));
$("#chunkSize-number").on('change', genericNumberInputHandler("chunkSize"));
$("#chunkSize-range").on('input', genericRangeInputHandler("chunkSize"));

$("#timeScale-number").on('keyup', genericNumberInputHandler("timeScale"));
$("#timeScale-number").on('change', genericNumberInputHandler("timeScale"));
$("#timeScale-range").on('input', genericRangeInputHandler("timeScale"));

window.onresize = resizeHandler;
