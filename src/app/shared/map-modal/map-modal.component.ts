import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Renderer2,
  OnDestroy,
  Input,
} from "@angular/core";
import { ModalController } from "@ionic/angular";

import { environment } from "../../../environments/environment";

@Component({
  selector: "app-map-modal",
  templateUrl: "./map-modal.component.html",
  styleUrls: ["./map-modal.component.scss"],
})
export class MapModalComponent implements OnInit, OnDestroy {
  @ViewChild("map", { static: false }) mapElementRef: ElementRef; // access the the map element div via local references
  @Input() center = { lat: 52.65867484192232, lng: -2.5235012614899377 }; // with @input this means we can set this center variable from outside
  @Input() selectable = true; // can we select a new place on the map or not? If false we disable the click listener
  @Input() closeButtonText = "Cancel"; // want to change this depending on which page we are on
  @Input() title = "Pick Location"; // Again we want to be able to overide this is necessary
  clickListener: any;
  googleMaps: any;

  constructor(
    private modalCtrl: ModalController,
    private renderer: Renderer2
  ) {}

  ngOnInit() {}

  ionViewDidEnter() {
    this.getGoogleMaps()
      // build the map
      .then((googleMaps) => {
        this.googleMaps = googleMaps;
        const mapEl = this.mapElementRef.nativeElement;
        const map = new googleMaps.Map(mapEl, {
          center: this.center,
          zoom: 12,
        });
        // Add a class to aniamte map fade in on load
        this.googleMaps.event.addListenerOnce(map, "idle", () => {
          this.renderer.addClass(mapEl, "visible");
        });

        if (this.selectable) {
          // if selectable add click listener and no marker
          this.clickListener = map.addListener("click", (event) => {
            const selectedCoords = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
            };
            this.modalCtrl.dismiss(selectedCoords);
          });
        } // if not selectable dont add click listener but add marker on the center
        else {
          const marker = new googleMaps.Marker({
            position: this.center,
            map: map,
            title: "Picked Location",
          });
          marker.setMap(map);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  private getGoogleMaps(): Promise<any> {
    const win = window as any; // window is global and referes to our browser window
    const googleModule = win.google; // required so that varaible can be set as soon as we import the JS SDK
    if (googleModule && googleModule.maps) {
      // we know JS SDK has been loaded before so dont load again
      return Promise.resolve(googleModule.maps); // needs to resolve to a promise
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script"); // should avoid this direct interaction with the DOM, niche case!
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=" +
        environment.googleMapsAPIKey;
      script.async = true; // gets script to run non blocking
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject("Google maps SDK not available.");
        }
      };
    });
  }

  ngOnDestroy() {
    if (this.clickListener) {
      this.googleMaps.event.removeListener(this.clickListener);
    }
  }
}
