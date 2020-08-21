import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { PlacesService } from "../../places.service";
import { Router } from "@angular/router";
import { LoadingController } from "@ionic/angular";

@Component({
  selector: "app-new-offer",
  templateUrl: "./new-offer.page.html",
  styleUrls: ["./new-offer.page.scss"],
})
export class NewOfferPage implements OnInit {
  // Create the reactive form in angular
  form: FormGroup;

  constructor(
    private placeService: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    // we want to create the form when the component is created. Form is created and its controls are configured here
    this.form = new FormGroup({
      title: new FormControl(null, {
        // null is the default value, so put in what you want the field to start with
        updateOn: "blur", // blur is when the form input loses focus
        validators: [Validators.required], // validators groups all of Angulars pre installed validator tools. Can enter things like minLength here
      }),
      description: new FormControl(null, {
        updateOn: "blur",
        validators: [Validators.required, Validators.maxLength(180)],
      }),
      price: new FormControl(null, {
        updateOn: "blur",
        validators: [Validators.required, Validators.min(1)], // min number of at least 1, so zero and minus numbers cant be used
      }),
      dateFrom: new FormControl(null, {
        updateOn: "blur",
        validators: [Validators.required],
      }),
      dateTo: new FormControl(null, {
        updateOn: "blur",
        validators: [Validators.required],
      }),
    }); // Form createdm but needs synchronised to HTML code - usinf directives
  }

  onCreateOffer() {
    console.log(this.form);
    if (!this.form.valid) {
      return;
    }
    // create the loader to be used whilst waiting for server to add the new place
    this.loadingCtrl
      .create({
        message: "Creating place ...",
      })
      .then((loadingEl) => {
        loadingEl.present();
        this.placeService
          .addPlace(
            this.form.value.title,
            this.form.value.description,
            +this.form.value.price,
            new Date(this.form.value.dateFrom),
            new Date(this.form.value.dateTo)
          )
          .subscribe(() => {
            loadingEl.dismiss(); // dismisses the spinner
            this.form.reset();
            this.router.navigate(["/places/tabs/offers"]);
          });
      });
  }
}
