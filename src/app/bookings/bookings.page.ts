import { Component, OnInit, OnDestroy } from "@angular/core";
import { BookingService } from "./booking.service";
import { Booking } from "./booking.model";
import { IonItemSliding, LoadingController } from "@ionic/angular";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
  selector: "app-bookings",
  templateUrl: "./bookings.page.html",
  styleUrls: ["./bookings.page.scss"],
})
export class BookingsPage implements OnInit, OnDestroy {
  loadedBookings: Booking[];
  isLoading: boolean = false;
  private bookingSub: Subscription;

  constructor(
    private bookingsService: BookingService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.bookingSub = this.bookingsService.bookings.subscribe((bookings) => {
      this.loadedBookings = bookings;
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.bookingsService.fetchBookings().subscribe(() => {
      this.isLoading = false;
    }); // everytime page comes into view, fetch the bookings for the logged in user
  }

  onCancelBooking(offerId: string, slidingEl: IonItemSliding) {
    // slidingEL is a local ref passed from the ion-item-sliding list element, letting us reset the sliding motion when we navigate away
    slidingEl.close();
    this.loadingCtrl
      .create({
        message: "Cancelling ...",
      })
      .then((loadingEl) => {
        loadingEl.present();
        this.bookingsService.cancelBooking(offerId).subscribe(() => {
          loadingEl.dismiss();
        }); // need to subscribe for the observable to execute!
        //cancel booking with if offerId
      });
  }

  ngOnDestroy() {
    if (this.bookingSub) {
      this.bookingSub.unsubscribe();
    }
  }
}
