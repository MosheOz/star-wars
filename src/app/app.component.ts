import { Component, OnInit } from "@angular/core";
import { map, skip } from "rxjs/operators";
import { StarWarsService } from "./star-wars.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  title = "star-wars";
  sumVehicle$: any;
  constructor(private starWarsService: StarWarsService) {}
  ngOnInit(): void {
    this.sumVehicle$ = this.starWarsService.readyForDisplay.pipe(
      skip(1),
      map((a) => a.sort((a, b) => b.planetsData - a.planetsData))
    );
  }

}
