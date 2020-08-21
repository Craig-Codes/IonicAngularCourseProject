import { Injectable } from "@angular/core";
import { Place } from "./place.model";
import { AuthService } from "../auth/auth.service";
import { BehaviorSubject } from "rxjs";
import { take, map, tap, delay } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([
    new Place(
      "p1",
      "Manhatten Mansion",
      "In the Heart of Manhatten",
      "https://imgs.6sqft.com/wp-content/uploads/2014/06/21042534/Felix_Warburg_Mansion_007.jpg",
      149.99,
      new Date("2019-01-01"),
      new Date("2019-12-31"),
      "xyz"
    ),
    new Place(
      "p2",
      "Spanish Villa",
      "Romantic spot in the Spanish hillside",
      "https://a0.muscache.com/im/pictures/7348a0da-9bc1-4cce-a633-cc2b23d6a295.jpg?aki_policy=large",
      100,
      new Date("2019-01-01"),
      new Date("2019-12-31"),
      "abc"
    ),
    new Place(
      "p3",
      "Compton Shack",
      "Grim shack in Bloods territory",
      "https://media.gettyimages.com/videos/-video-id1027864144?s=640x640",
      0,
      new Date("2019-01-01"),
      new Date("2019-12-31"),
      "abc"
    ),
    new Place(
      "p4",
      "Monochrome Loft",
      "Monochromatic Minimalism in Sweden",
      "https://www.pufikhomes.com/wp-content/uploads/2018/12/monochrome-scandinavian-studio-apartment-in-stockholm-30sqm-pufikhomes-1.jpg",
      119.99,
      new Date("2019-01-01"),
      new Date("2019-12-31"),
      "abc"
    ),
  ]); // the behaviour subject is initialised with the default value passed in the parameters

  constructor(private authService: AuthService) {}

  get places() {
    return this._places.asObservable(); // gives us a subscribable object from other componenets
  }

  getPlace(id: string) {
    // get a list of the current places array then unsubscribe - take operator
    // use the map operator to filter down to just the one entry we want to return. Map takes in what take 1 gives us and works on it
    // map returns an obseravble so it can be subscribed to!
    return this.places.pipe(
      take(1),
      map((places) => {
        return { ...places.find((p) => p.id === id) };
      })
    );
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      "https://imgs.6sqft.com/wp-content/uploads/2014/06/21042534/Felix_Warburg_Mansion_007.jpg",
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );
    // get the current list, but only once we dont want to keep subscribing!
    // use take operator from rxjs - take from the places subject only once. Subscitption is cancelled after this.
    // tap lets you execute an action which wont change the data in the chain and wont complete the observable... just tapping into it
    // The timeout is actioned without finishing the observable
    // delay operator fakes a delay... observable version of setTimout!
    return this.places.pipe(
      take(1),
      delay(1000),
      tap((places) => {
        // places is an array of all our current places. Next this to the subject after adding the new place to it
        this._places.next(places.concat(newPlace));
        // by using next, we push the new data to observable which will inform everyone subscribed to it of the changes!
      })
    );
  }

  updatePlace(placeId: string, title: string, description: string) {
    // Rxjs operators:
    //take 1 - we only want the current snapshot as a one time thing
    // tap - tap into our observable string to do soemthign with our exsisting list of data
    return this.places.pipe(
      take(1),
      delay(1000),
      tap((places) => {
        const updatedPlaceIndex = places.findIndex(
          (place) => place.id === placeId
        ); // find the required place index based on the id
        const updatedPlaces = [...places]; // get an array of current places so we cannot mutate the original
        const oldPlace = updatedPlaces[updatedPlaceIndex]; // access to current place property - we can then use its properties to create a new place
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id, // keep orignal data
          title, // over ride this prop with argument
          description, // over ride this prop with argument
          oldPlace.imageUrl, // keep original data
          oldPlace.price,
          oldPlace.avaliableFrom,
          oldPlace.avaliableTo,
          oldPlace.userId
        );
        this._places.next(updatedPlaces); // emit this newly editted object
      })
    );
  }
}
