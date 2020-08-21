import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./auth/auth.guard";

const routes: Routes = [
  {
    path: "",
    redirectTo: "places",
    pathMatch: "full",
  },
  {
    path: "auth",
    loadChildren: () =>
      import("./auth/auth.module").then((m) => m.AuthPageModule),
  },
  {
    path: "places",
    canLoad: [AuthGuard], // route is protected by a guard, which must return a positive boolean to proceed to load route
    loadChildren: () =>
      import("./places/places.module").then((m) => m.PlacesPageModule),
  },
  {
    path: "bookings",
    canLoad: [AuthGuard],
    loadChildren: () =>
      import("./bookings/bookings.module").then((m) => m.BookingsPageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }), // if you remove the preloading strategy you can see lazy loading working as expected. Preloading is used by default in Ionic now... loads all other modules once the first is loaded properly, so no delay when user clicks on other modules
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
