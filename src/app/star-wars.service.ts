import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest, concat, of } from "rxjs";
import { finalize, map, switchMap, tap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class StarWarsService {
  vehiclesUrl = "https://swapi.py4e.com/api/vehicles";
  peopleUrl = "https://swapi.py4e.com/api/people/";
  planetsUrl = "https://swapi.py4e.com/api/planets/";
  allV: any = [];

  allVehicles = new BehaviorSubject<any>(null);
  allPlanets = new BehaviorSubject<any>(null);
  populationSum = new BehaviorSubject<any>(null);
  startPopulationProcess = new BehaviorSubject<any>(null);
  readyForDisplay = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {
    this.startProcess();
    this.startPopulationProcess.subscribe((x) => this.processPopulation(x));
  }

  getPlanetsForVehicle(v: any) {
    return this.http
      .get<any>(v)
      .pipe(
        map((pilot) => ({ homeworld: pilot.homeworld, pilotName: pilot.name }))
      );
  }

  getPopulation(v: any) {
    return this.http
      .get<any>(v)
      .pipe(map((planet) => ({ population: planet.population })));
  }

  startProcess = () => {
    const vehicelObs = [];
    ["1", "2", "3", "4"].map((page: string) => {
      vehicelObs.push(this.getVehicles(page));
    });

    const vehicleResults = combineLatest(...vehicelObs);

    vehicleResults
      .pipe(
        switchMap((a) => {
          this.getPlanets();
          return a;
        })
      )
      .subscribe();
  };

  private getVehicles(page: string) {
    return this.http.get<any>(this.vehiclesUrl + "/?page=" + page).pipe(
      map((vehicles) => {
        const t = vehicles.results
          .filter((x) => x.pilots.length)
          .map((x) => {
            return { name: x.name, pilots: x.pilots };
          });

        const oldV = this.allVehicles.value ? [...this.allVehicles.value] : [];

        this.allVehicles.next([...oldV, ...t]);

        return t;
      })
    );
  }

  private getPlanets() {
    this.allVehicles.value.map((obj, i) => {
      const planetsDataObs = [];

      obj.pilots.map(async (p: string) => {
        planetsDataObs.push(this.getPlanetsForVehicle(p));
      });

      const planetsResults = combineLatest(...planetsDataObs);

      planetsResults
        .pipe(
          switchMap((p) => {
            const oldP = this.allPlanets.value
              ? [...this.allPlanets.value]
              : [];
            this.allPlanets.next([...oldP, { name: obj.name, planetsData: p }]);
            this.startPopulationProcess.next({
              url: p,
              name: obj.name,
              pilotName: p.map((x) => x.pilotName),
              planets: p.length,
            });
            return p;
          })
        )
        .subscribe();
    });
  }

  processPopulation(p: any) {
    const populationObs = [];

    if (!this.allPlanets.value) return;

    p.url.map(async (z: any) => {
      populationObs.push(this.getPopulation(z.homeworld));
    });

    const populationResults = combineLatest(...populationObs);
    populationResults
      .pipe(
        switchMap((x) => {
          const oldP = this.populationSum.value
            ? [...this.populationSum.value]
            : [];

          const total = x
            .filter((a) => {
              return !isNaN(a.population);
            })
            .reduce((acc, v) => {
              return +v.population + +acc;
            }, 0);
          this.populationSum.next([
            ...oldP,
            {
              name: p.name,
              planetsData: total,
              pilotName: p.pilotName,
              planets: p.planets,
            },
          ]);
          return x;
        }),
        finalize(() => this.readyForDisplay.next(this.populationSum.value))
      )
      .subscribe();
  }
}
