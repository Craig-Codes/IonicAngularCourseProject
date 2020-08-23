import { Injectable } from "@angular/core";
import { Booking } from "./booking.model";
import { BehaviorSubject } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { take, tap, delay, switchMap, map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

interface BookingData {
  bookedFrom: string;
  bookedTo: string;
  firstName: string;
  guestNumber: number;
  lastName: string;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;
}

@Injectable({
  providedIn: "root",
})
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([]);
  // behaviour subject ensures the last value is passed straight away, so there is always data

  constructor(private authService: AuthService, private http: HttpClient) {}

  get bookings() {
    return this._bookings.asObservable(); // return a copy! Can't directly edit
  }

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
    const newBooking = new Booking(
      Math.random().toString(),
      placeId,
      this.authService.userId,
      placeTitle,
      placeImage,
      firstName,
      lastName,
      guestNumber,
      dateFrom,
      dateTo
    );
    return this.http
      .post<{ name: string }>(
        "https://ionic-angular-course-6b213.firebaseio.com/bookings.json",
        { ...newBooking, id: null }
      )
      .pipe(
        switchMap((resData) => {
          generatedId = resData.name;
          return this.bookings;
        }),
        take(1),
        tap((bookings) => {
          newBooking.id = generatedId;
          this._bookings.next(bookings.concat(newBooking));
        })
      );
  }

  cancelBooking(bookingId: string) {
    return this.http
      .delete(
        `https://ionic-angular-course-6b213.firebaseio.com/bookings/${bookingId}.json`
      )
      .pipe(
        switchMap(() => {
          return this.bookings;
        }),
        take(1), // prevents infinite loop! We only want 1!
        tap((bookings) => {
          bookings.filter((booking) => booking.id !== bookingId); // updates the bookings so deleted on is gone
        })
      );
  }

  fetchBookings() {
    // fetch the bookings only for the logged in user. This is acheived by adding query paramaeters to URL in firebase
    return this.http
      .get<{ [key: string]: BookingData }>(
        `https://ionic-angular-course-6b213.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${this.authService.userId}"`
      )
      .pipe(
        map((bookingData) => {
          const bookings = [];
          for (const key in bookingData) {
            if (bookingData.hasOwnProperty(key)) {
              bookings.push(
                new Booking(
                  key,
                  bookingData[key].placeId,
                  bookingData[key].userId,
                  bookingData[key].placeTitle,
                  bookingData[key].placeImage,
                  bookingData[key].firstName,
                  bookingData[key].lastName,
                  bookingData[key].guestNumber,
                  new Date(bookingData[key].bookedFrom),
                  new Date(bookingData[key].bookedTo)
                )
              );
            }
            return bookings;
          }
        }),
        tap((bookings) => {
          this._bookings.next(bookings);
        })
      );
  }
}
