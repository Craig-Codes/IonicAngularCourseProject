import { Injectable } from "@angular/core";
import { Place } from "./place.model";
import { AuthService } from "../auth/auth.service";
import { BehaviorSubject, of } from "rxjs";
import { take, map, tap, delay, switchMap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { PlaceLocation } from "./location.model";

// new Place(
//   "p1",
//   "Manhatten Mansion",
//   "In the Heart of Manhatten",
//   "https://imgs.6sqft.com/wp-content/uploads/2014/06/21042534/Felix_Warburg_Mansion_007.jpg",
//   149.99,
//   new Date("2019-01-01"),
//   new Date("2019-12-31"),
//   "xyz"
// ),
// new Place(
//   "p2",
//   "Spanish Villa",
//   "Romantic spot in the Spanish hillside",
//   "https://a0.muscache.com/im/pictures/7348a0da-9bc1-4cce-a633-cc2b23d6a295.jpg?aki_policy=large",
//   100,
//   new Date("2019-01-01"),
//   new Date("2019-12-31"),
//   "abc"
// ),
// new Place(
//   "p3",
//   "Compton Shack",
//   "Grim shack in Bloods territory",
//   "https://media.gettyimages.com/videos/-video-id1027864144?s=640x640",
//   0,
//   new Date("2019-01-01"),
//   new Date("2019-12-31"),
//   "abc"
// ),
// new Place(
//   "p4",
//   "Monochrome Loft",
//   "Monochromatic Minimalism in Sweden",
//   "https://www.pufikhomes.com/wp-content/uploads/2018/12/monochrome-scandinavian-studio-apartment-in-stockholm-30sqm-pufikhomes-1.jpg",
//   119.99,
//   new Date("2019-01-01"),
//   new Date("2019-12-31"),
//   "abc"
// ),

// setup an itnerface to get better auto-completion on the returned object from server / database. Not required but good practice
interface PlaceData {
  avaliableFrom: string;
  avaliableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation;
}

@Injectable({
  providedIn: "root",
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]); // the behaviour subject is initialised with the default value passed in the parameters

  constructor(private authService: AuthService, private http: HttpClient) {}

  get places() {
    return this._places.asObservable(); // gives us a subscribable object from other componenets
  }

  fetchPlaces() {
    return this.http
      .get<{ [key: string]: PlaceData }>(
        "https://ionic-angular-course-6b213.firebaseio.com/offered-places.json"
      )
      .pipe(
        map((resData) => {
          // map is used to re-shape the data to fit with how we want it to look
          // use this response data to update the exsisting list of data in the app
          const places = [];
          for (const key in resData) {
            if (resData.hasOwnProperty(key)) {
              // key is the id assigned by firebase!
              // Loop through each object and add it, correctly formatted, into the places array
              places.push(
                new Place(
                  key,
                  resData[key].title,
                  resData[key].description,
                  resData[key].imageUrl,
                  resData[key].price,
                  new Date(resData[key].avaliableFrom),
                  new Date(resData[key].avaliableTo),
                  resData[key].userId,
                  resData[key].location
                )
              );
            }
          }
          return places;
        }),
        tap((places) => {
          this._places.next(places); // emit a new places array with all of the retrieved places
        })
      );
  }

  getPlace(id: string) {
    // get a list of the current places array then unsubscribe - take operator
    // use the map operator to filter down to just the one entry we want to return. Map takes in what take 1 gives us and works on it
    // map returns an obseravble so it can be subscribed to!
    return this.http
      .get<PlaceData>(
        `https://ionic-angular-course-6b213.firebaseio.com/offered-places/${id}.json`
      )
      .pipe(
        map((placeData) => {
          return new Place(
            id,
            placeData.title,
            placeData.description,
            placeData.imageUrl,
            placeData.price,
            new Date(placeData.avaliableFrom),
            new Date(placeData.avaliableTo),
            placeData.userId,
            placeData.location
          );
        })
      );
  }

  // add the new place to firebase, and return the firebase id as the place id
  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date,
    location: PlaceLocation
  ) {
    let generatedId: string;
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      "https://imgs.6sqft.com/wp-content/uploads/2014/06/21042534/Felix_Warburg_Mansion_007.jpg",
      price,
      dateFrom,
      dateTo,
      this.authService.userId,
      location
    );
    return this.http
      .post<{ name: string }>(
        "https://ionic-angular-course-6b213.firebaseio.com/offered-places.json",
        { ...newPlace, id: null }
      )
      .pipe(
        // switchMap takes an observable chain, taking the result, but returns a new observable which replaces the old one
        switchMap((resData) => {
          generatedId = resData.name; // put firebase generated id into this varaiable. Can then be added to the single entry and sent to the list of places
          return this.places;
        }),
        take(1),
        tap((places) => {
          // places is an array of all our current places. Next this to the subject after adding the new place to it
          newPlace.id = generatedId;
          this._places.next(places.concat(newPlace));
          // by using next, we push the new data to observable which will inform everyone subscribed to it of the changes!
        })
      );
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap((places) => {
        if (!places || places.length <= 0) {
          // this check ensures we always have an array of places
          return this.fetchPlaces();
        } else {
          return of(places); // must return an observable, rxjs of creates one.
        }
      }),
      switchMap((places) => {
        const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.avaliableFrom,
          oldPlace.avaliableTo,
          oldPlace.userId,
          oldPlace.location
        );
        return this.http.put(
          `https://ionic-angular-course-6b213.firebaseio.com/offered-places/${placeId}.json`,
          {
            ...updatedPlaces[updatedPlaceIndex],
            id: null,
          }
        );
      }),
      tap(() => {
        this._places.next(updatedPlaces); // emit this newly editted object
      })
    );
  }
}
