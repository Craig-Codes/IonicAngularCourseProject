import { Component, OnInit, OnDestroy } from "@angular/core";
import { PlacesService } from "../places.service";
import { Place } from "../place.model";
import { IonItemSliding } from "@ionic/angular";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
  selector: "app-offers",
  templateUrl: "./offers.page.html",
  styleUrls: ["./offers.page.scss"],
})
export class OffersPage implements OnInit, OnDestroy {
  offers: Place[];
  // store places subscription so it can be destroyed to avoid memory leak
  private placesSub: Subscription;

  constructor(private placesService: PlacesService, private router: Router) {}

  ngOnInit() {
    // whenever our list of places changes we are informed
    this.placesSub = this.placesService.places.subscribe((places) => {
      this.offers = places;
    });
  }

  onEdit(offerId: string, slidingItem: IonItemSliding) {
    slidingItem.close(); // close the slider
    this.router.navigate(["/", "places", "tabs", "offers", "edit", offerId]);
  }

  ngOnDestroy() {
    if (this.placesSub) {
      // if this was set - if subscription exsists
      this.placesSub.unsubscribe();
    }
  }
}
