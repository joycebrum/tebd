import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Graph } from '../graph';
import * as d3 from 'd3'
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  data = {
    "nodes":[{"id":"Person","group":1},{"id":"dbo:Person","group":1}],
    "links": [{"source":"Person","target":"Person","value":'foaf:knows'},{"source":"Person","target":"dbo:Person","value":'foaf:knows'}]
  }
  width = 300;
  height = 300
  color = () => {
    const scale = d3.scaleOrdinal(d3.schemeCategory10);
    return d => scale(d.group);
  }
  constructor() {
    
  }
  
  ngOnInit() {
    const links = this.data.links.map(d => Object.create(d));
    const nodes = this.data.nodes.map(d => Object.create(d));
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d['id']))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(this.width / 2, this.height / 2));
  
    const svg = d3.select("svg")
        .attr("viewBox", `0 0 ${this.width} ${this.height}`);
  
    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));
  
    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
        .attr("r", 5)
        .attr("fill", this.color())
        //.call(drag(simulation));
  
    node.append("title")
        .text(d => d.id);
  
    simulation.on("tick", () => {
      link
          // .attr("x1", d => d.source.x)
          // .attr("y1", d => d.source.y)
          // .attr("x2", d => d.target.x)
          // .attr("y2", d => d.target.y)
          .attr("d", function(d) {
            var x1 = d.source.x,
                y1 = d.source.y,
                x2 = d.target.x,
                y2 = d.target.y,
                dx = x2 - x1,
                dy = y2 - y1,
                dr = Math.sqrt(dx * dx + dy * dy),
          
                // Defaults for normal edge.
                drx = dr,
                dry = dr,
                xRotation = 0, // degrees
                largeArc = 0, // 1 or 0
                sweep = 1; // 1 or 0
          
                // Self edge.
                if ( x1 === x2 && y1 === y2 ) {
                  // Fiddle with this angle to get loop oriented.
                  xRotation = -45;
          
                  // Needs to be 1.
                  largeArc = 1;
          
                  // Change sweep to change orientation of loop. 
                  //sweep = 0;
          
                  // Make drx and dry different to get an ellipse
                  // instead of a circle.
                  drx = 30;
                  dry = 20;
          
                  // For whatever reason the arc collapses to a point if the beginning
                  // and ending points of the arc are the same, so kludge it.
                  x2 = x2 + 1;
                  y2 = y2 + 1;
                } 
          
           return "M" + x1 + "," + y1 + "A" + drx + "," + dry + " " + xRotation + "," + largeArc + "," + sweep + " " + x2 + "," + y2;
          });
  
      node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
    });
  
    svg.node();

    //d3.select('.graph').append(svg.node())

    // this.exemploCurvo()
  }

  // exemploCurvo() {
  //   var width = 960,
  //   height = 500;

  //   var color = d3.scale.category20();

  //   var radius = d3.scale.sqrt()
  //       .range([0, 6]);

  //   var svg = d3.select("body").append("svg")
  //       .attr("width", width)
  //       .attr("height", height);

  //   var force = d3.layout.force()
  //       .size([width, height])
  //       .charge(-400)
  //       .linkDistance(function(d) { return radius(d.source.size) + radius(d.target.size) + 20; });

  //   var graph = {
  //   "nodes": [
  //       {"size": 12},
  //       {"size": 12},
  //       {"size": 12}
  //     ],
  //     "links": [
  //       {"source": 0, "target": 1},
  //       {"source": 1, "target": 2},
  //       {"source": 2, "target": 2}
  //     ]
  //   };

  //   var drawGraph = function(graph) {
  //     force
  //         .nodes(graph.nodes)
  //         .links(graph.links)
  //         .on("tick", tick)
  //         .start();
  //     var link = svg.selectAll(".link")
  //         .data(graph.links)
  //       .enter().append("path")
  //         .attr("class","link");

  //     var node = svg.selectAll(".node")
  //         .data(graph.nodes)
  //       .enter().append("g")
  //         .attr("class", "node")
  //         .call(force.drag);

  //     node.append("circle")
  //         .attr("r", function(d) { return radius(d.size); })
  //         .style("fill", function(d) { return color(d.atom); });

  //     function tick() {
  //       link.attr("d", function(d) {
  //         var x1 = d.source.x,
  //             y1 = d.source.y,
  //             x2 = d.target.x,
  //             y2 = d.target.y,
  //             dx = x2 - x1,
  //             dy = y2 - y1,
  //             dr = Math.sqrt(dx * dx + dy * dy),

  //             // Defaults for normal edge.
  //             drx = dr,
  //             dry = dr,
  //             xRotation = 0, // degrees
  //             largeArc = 0, // 1 or 0
  //             sweep = 1; // 1 or 0

  //             // Self edge.
  //             if ( x1 === x2 && y1 === y2 ) {
  //               // Fiddle with this angle to get loop oriented.
  //               xRotation = -45;

  //               // Needs to be 1.
  //               largeArc = 1;

  //               // Change sweep to change orientation of loop. 
  //               //sweep = 0;

  //               // Make drx and dry different to get an ellipse
  //               // instead of a circle.
  //               drx = 30;
  //               dry = 20;
                
  //               // For whatever reason the arc collapses to a point if the beginning
  //               // and ending points of the arc are the same, so kludge it.
  //               x2 = x2 + 1;
  //               y2 = y2 + 1;
  //             } 

  //       return "M" + x1 + "," + y1 + "A" + drx + "," + dry + " " + xRotation + "," + largeArc + "," + sweep + " " + x2 + "," + y2;
  //       });

  //       node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  //     }
  //   };

  // drawGraph(graph);
  // }
  
}
