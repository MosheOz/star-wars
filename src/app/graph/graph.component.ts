import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-graph",
  templateUrl: "./graph.component.html",
  styleUrls: ["./graph.component.scss"],
})
export class GraphComponent {
  @Input() graphData: any;

  //gets the percentage of the marks with respect to the highest mark
  getBarPercentage = (mark: any, highest: any) => {
    return (mark / highest) * 100 + "%";
  };
}
