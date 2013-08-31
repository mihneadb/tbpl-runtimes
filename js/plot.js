var BAR_WIDTH = 50;
var MIN_HEIGHT = 5;
var TEXT_SIZE = 15;
var TEXT_PAD = 5;

var data = null;
var plotted = false;

function getPlatformData(platform) {
    for (var i = 0; i < data.length; i++) {
        if (data[i].platform == platform) {
            return data[i].data;
        }
    }
    return [];
}

function getterFunc(elem) {
    return elem.duration;
}

function plotGraph(data) {
    var f = $("#file");
    // remove old chart and make new one
    $("#chart").remove();
    $("#chart-div").append('<svg id="chart"></svg>');
    var chart = d3.select("#chart");
    var chartWidth = $("#chart-div").width();
    var chartHeight = $(window).height() - $("#chart").position().top - 50;

    var platform = $("#platform")[0].value;
    var sort = $("#sort")[0].checked;

    graphData = getPlatformData(platform);

    tip = d3.tip().html(function(d) {
        return "<div class='d3-tip'>" +
            "<pre>" + JSON.stringify(d, null, '\t') + "</pre>" +
            "</div>";
    });
    chart.call(tip);

    if (sort) {
        graphData.sort(function(a, b) {
            var x = getterFunc(a);
            var y = getterFunc(b);
            return d3.descending(x, y);
        });
    } else {
        graphData.sort(function(a, b) {
            var x = a.name;
            var y = b.name;
            return d3.ascending(x, y);
        });
    }

    var yMax = d3.max(graphData, getterFunc);
    var computeHeight = d3.scale.linear()
    .domain([0, yMax])
    .range([MIN_HEIGHT, chartHeight - TEXT_SIZE - TEXT_PAD]);

    chart.attr("width", graphData.length * BAR_WIDTH)
        .attr("height", chartHeight);
    chart.selectAll("rect")
        .data(graphData)
        .enter().append("rect")
        .attr("x", function(d, i) { return i * BAR_WIDTH; })
        .attr("y", function(d, i) { return chartHeight - computeHeight(getterFunc(d)) - TEXT_SIZE - TEXT_PAD; })
        .attr("height", function(d, i) { return computeHeight(getterFunc(d)); })
        .attr("width", BAR_WIDTH)
        .on('mouseover', function(d) {
            tip.show(d);
            $('.d3-tip').css('top', $("#chart").position().top + 'px');
            // center it horizontally
            var tipWidth = $('.d3-tip').width();
            $('.d3-tip').css('left', $(window).width() / 2 - tipWidth / 2 + 'px');
        })
        .on('mouseout', tip.hide);

    chart.selectAll("text.name")
        .data(graphData)
        .enter().append("text")
        .text(function(d) {
            return d.name;
        })
        .attr("x", function(d, i) { return i * BAR_WIDTH + (BAR_WIDTH / 2); })
        .attr("y", chartHeight - TEXT_PAD)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .attr("font-size", TEXT_SIZE);

    chart.selectAll("text.duration")
        .data(graphData)
        .enter().append("text")
        .text(getterFunc)
        .attr("x", function(d, i) { return i * BAR_WIDTH + (BAR_WIDTH / 2); })
        .attr("y", function(d, i) { return chartHeight - computeHeight(getterFunc(d)); })
        .attr("text-anchor", "middle")
        .attr("fill", "white");


    plotted = true;
}

function handleFile(ev) {
    var files = ev.target.files;
    var file = files[0];
    var reader = new FileReader();
    reader.onloadend = function() {
        data = JSON.parse(reader.result);
        plotGraph(data);
    };
    reader.readAsText(file);
}

var replot = function() {
    if (plotted) {
        plotGraph(data);
    }
};
window.onresize = replot;

$('#file').on('change', handleFile);
$('#platform').on('change', replot);
$('#sort').on('change', replot);


// plot a default graph
d3.json("sampledata.json", function(d) {
    data = d;
    $.each(data, function(key, value) {
        $('#platform').append($('<option>', {value : value.platform})
                      .text(value.platform));
    });
    plotGraph(data);
});
