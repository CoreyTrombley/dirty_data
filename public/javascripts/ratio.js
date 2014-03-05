$(document).ready(function() {


  $(".selfData").on("click", function () {
    var user = $.get('/self', function(data) {
      return data;
    });
  });



  var w = 200,                            //width
      h = 200,                            //height
      r = 100,                            //radius
      color = d3.scale.category20c();     //builtin range of colors

      d3.json('/ff', function(data){


        var data1=[{"crimeType":"mip","totalCrimes":24},{"crimeType":"theft","totalCrimes":558},{"crimeType":"drugs","totalCrimes":81},{"crimeType":"arson","totalCrimes":3},{"crimeType":"assault","totalCrimes":80},{"crimeType":"burglary","totalCrimes":49},{"crimeType":"disorderlyConduct","totalCrimes":63},{"crimeType":"mischief","totalCrimes":189},{"crimeType":"dui","totalCrimes":107},{"crimeType":"resistingArrest","totalCrimes":11},{"crimeType":"sexCrimes","totalCrimes":24},{"crimeType":"other","totalCrimes":58}];
        var data2=[{"crimeType":"mip","totalCrimes":10},{"crimeType":"theft","totalCrimes":30},{"crimeType":"drugs","totalCrimes":10},{"crimeType":"arson","totalCrimes":3},{"crimeType":"assault","totalCrimes":80},{"crimeType":"burglary","totalCrimes":49},{"crimeType":"disorderlyConduct","totalCrimes":10},{"crimeType":"mischief","totalCrimes":389},{"crimeType":"dui","totalCrimes":507},{"crimeType":"resistingArrest","totalCrimes":11},{"crimeType":"sexCrimes","totalCrimes":24},{"crimeType":"other","totalCrimes":258}];



        var total_friends = 0
          , total_followers = 0;

        for (var i = data.length - 1; i >= 0; i--) {
          if (data[i].provider === "twitter") {
            total_friends += data[i].friendCount;
            total_followers += data[i].followCount;
          }
        };

        ff = [{"label": "Followers: " + total_friends, "value":total_friends},
              {"label": "Following: " + total_followers, "value":total_followers}];

        var vis = d3.select(".ff-ratio")
            .append("svg:svg")              //create the SVG element inside the <body>
            .data([ff])                   //associate our data with the document
                .attr("width", w)           //set the width and height of our visualization (these will be attributes of the <svg> tag
                .attr("height", h)
            .append("svg:g")                //make a group to hold our pie chart
                .attr("transform", "translate(" + r + "," + r + ")")    //move the center of the pie chart from 0, 0 to radius, radius

        var arc = d3.svg.arc()              //this will create <path> elements for us using arc data
            .outerRadius(r);

        var pie = d3.layout.pie()           //this will create arc data for us given a list of values
            .value(function(d) { return d.value; });    //we must tell it out to access the value of each element in our data array

        var arcs = vis.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
            .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties)
            .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
                .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
                    .attr("class", "slice");    //allow us to style things in the slices (like text)

            arcs.append("svg:path")
                    .attr("fill", function(d, i) { return color(i); } ) //set the color for each slice to be chosen from the color function defined above
                    .attr("d", arc);                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function

            arcs.append("svg:text")                                     //add a label to each slice
                    .attr("transform", function(d) {                    //set the label's origin to the center of the arc
                    //we have to make sure to set these before calling arc.centroid
                    d.innerRadius = 0;
                    d.outerRadius = r;
                    return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
                })
                .attr("text-anchor", "middle")                          //center the text on it's origin
                .text(function(d, i) { return ff[i].label; });        //get the label from our original data array


        var men = 0
          , women = 0
          , unknown = 0;
        var colors = ["lightblue", "pink", "lightgray"]

        for (var i = data.length - 1; i >= 0; i--) {
          if (data[i].provider === "facebook") {
            switch(data[i].gender){
            case "male":
              men += 1;
              break;
            case "female":
              women += 1;
              break;
            default:
              unknown += 1;
            }
          }
        };
        gender = [{"label": "Men: " + men, "value":men},
                  {"label": "Women: " + women, "value":women}]

        var vis = d3.select(".gender")
            .append("svg:svg")
            .data([gender])
                .attr("width", w)
                .attr("height", h)
            .append("svg:g")
                .attr("transform", "translate(" + r + "," + r + ")")

        var arc = d3.svg.arc()
            .outerRadius(r);

        var pie = d3.layout.pie()
            .value(function(d) { return d.value; });

        var arcs = vis.selectAll("g.slice")
            .data(pie)
            .enter()
                .append("svg:g")
                    .attr("class", "slice");

            arcs.append("svg:path")
                    .attr("fill", function(d, i) { return colors[i]; } )
                    .attr("d", arc);

            arcs.append("svg:text")
                    .attr("transform", function(d) {
                      d.innerRadius = 0;
                      d.outerRadius = r;
                      return "translate(" + arc.centroid(d) + ")";
                    })
                    .attr("text-anchor", "middle")
                    .text(function(d, i) { return gender[i].label; });





        var margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var x = d3.scale.linear()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var clr = d3.scale.linear()
            .domain([0,60])
            .range(["red", "blue"]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .ticks(10)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(10)
            .orient("left");

        var svg = d3.select(".scatter-plot").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        data.forEach(function(d) {
          if (d.provider === "twitter"){
            d.followCount = +d.followCount;
            d.statusCount = +d.statusCount;
          }
        });
        x.domain(d3.extent(data, function(d) { if (d.provider === "twitter") { return d.followCount; }})).nice();
        y.domain(d3.extent(data, function(d) { if (d.provider === "twitter") { return d.statusCount; }})).nice();
        console.log()
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
          .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("Followers");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Tweets")
        svg.selectAll(".dot")
            .data(data)
          .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 3.5)
            .attr("cx", function(d) { if (d.provider === "twitter"){ return x(d.followCount); }})
            .attr("cy", function(d) { if(d.provider === "twitter"){ return y(d.statusCount); }})
            .style("fill", function(d,i) { return color(i); })

        var legend = svg.selectAll(".legend")
            .data(data)
          .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function(d,i) {return color(i); });

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d,i) { if (d.provider === "twitter"){return d.username; }});

      });
});