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
    
  } 
}
