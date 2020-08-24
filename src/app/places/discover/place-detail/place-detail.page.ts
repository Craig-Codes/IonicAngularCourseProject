import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NavController,
  ModalController,
  ActionSheetController,
  LoadingController,
  AlertController,
} from "@ionic/angular";
import { PlacesService } from "../../places.service";
import { Place } from "../../place.model";
import { CreateBookingComponent } from "../../../bookings/create-booking/create-booking.component";
import { Subscription } from "rxjs";
import { BookingService } from "src/app/bookings/booking.service";
import { AuthService } from "src/app/auth/auth.service";
import { MapModalComponent } from "src/app/shared/map-modal/map-modal.component";

@Component({
  selector: "app-place-detail",
  templateUrl: "./place-detail.page.html",
  styleUrls: ["./place-detail.page.scss"],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isBookable = false;
  isLoading = false;

  private placeSub: Subscription;

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheetController: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private AuthService: AuthService,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has("placeId")) {
        this.navCtrl.navigateBack("/places/tabs/discover");
        return;
      }
      this.isLoading = true;
      this.placeSub = this.placesService
        .getPlace(paramMap.get("placeId"))
        .subscribe(
          (place) => {
            this.place = place;
            this.isBookable = place.userId !== this.AuthService.userId; // if we crreated the place we cannot book! This will be false
            this.isLoading = false;
          },
          (error) => {
            this.alertCtrl
              .create({
                header: "An error occured!",
                message: "Could not load place.",
                buttons: [
                  {
                    text: "Ok",
                    handler: () => {
                      this.router.navigate(["/places/tabs/discover"]);
                    },
                  },
                ],
              })
              .then((alertEl) => alertEl.present());
          }
        );
    });
  }

  // Open an action sheet, then depending on what is selected, open the modal. Nice UI!!! Use this method in my own apps!
  onBookPlace() {
    //this.router.navigateByUrl("/places/tabs/discover");
    //this.navCtrl.navigateBack("/places/tabs/discover"); // uses the Angular router but sets metadata so that the right aniamtion is played.
    this.actionSheetController
      .create({
        header: "choose an Action",
        buttons: [
          {
            text: "Select Date",
            handler: () => {
              this.openBookingModal("select");
            },
          },
          {
            text: "Random Date",
            handler: () => {
              this.openBookingModal("random");
            },
          },
          {
            text: "Cancel",
            role: "cancel", // cancel button is automatically always at the bottom of the action sheet so easiest to press for user
          },
        ],
      })
      .then((actionSheetEl) => actionSheetEl.present()); // need to call present to open actionsheet
  }

  openBookingModal(mode: "select" | "random") {
    console.log(mode);
    this.modalCtrl
      .create({
        component: CreateBookingComponent,
        componentProps: { selectedPlace: this.place, selectedMode: mode }, // pass in a varaible to the modal, so this gets passed itno the createBookingComponent
      })
      .then((modalEl) => {
        modalEl.present();
        // setup a listener for when modal is closed! How we read data from the modal
        return modalEl.onDidDismiss();
      }) // create method takes a componenet as argument to be used as a modal
      .then((resultData) => {
        // when promise comes back, do this
        if (resultData.role === "confirm") {
          this.loadingCtrl
            .create({
              message: "Booking Place... ",
            })
            .then((loadingEl) => {
              loadingEl.present();
              const data = resultData.data.bookingData;

              this.bookingService
                .addBooking(
                  this.place.id,
                  this.place.title,
                  this.place.imageUrl,
                  data.firstName,
                  data.lastName,
                  data.guestNumber,
                  data.startDate,
                  data.endDate
                )
                .subscribe(() => {
                  loadingEl.dismiss();
                });
            });
        }
      });
  }

  onShowFullMap() {
    this.modalCtrl
      .create({
        component: MapModalComponent,
        componentProps: {
          center: {
            lat: this.place.location.lat,
            lng: this.place.location.lng,
          },
          selectable: false,
          closeButtonText: "Close",
          title: this.place.location.address,
        },
      })
      .then((modelEL) => {
        modelEL.present();
      });
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
