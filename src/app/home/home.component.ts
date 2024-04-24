import { Component, inject, OnInit } from '@angular/core';
import { MatButton } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { PassDialogComponent } from "./pass-dialog/pass-dialog.component";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { Parking } from "../models/interfaces/parking.interface";
import { NgOptimizedImage } from "@angular/common";
import { ParkingsService } from "../services/parkings.service";
import { BreakpointObserver } from "@angular/cdk/layout";
import { LeafletModule } from "@asymmetrik/ngx-leaflet";
import { LatLng, latLng, tileLayer, Map, marker, icon, MapOptions } from "leaflet";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatButton,
    MatProgressSpinner,
    NgOptimizedImage,
    LeafletModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  credential: string | null = null;
  parking?: Parking | null;
  passNotEntered = false;
  loading = false;
  passValid = true;
  dialog = inject(MatDialog);
  parkingsService = inject(ParkingsService);
  loadingUpdate = false;
  breakpointObserver = inject(BreakpointObserver);
  isSmallScreen = false;
  options: MapOptions = {
    layers: [
      tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        subdomains: [ 'mt0', 'mt1', 'mt2', 'mt3' ],
      }),
    ],
    zoom: 5,
    maxZoom: 18,
    center: latLng(46.879966, -121.726909),
    attributionControl: false,
  };
  center!: LatLng;

  async ngOnInit() {
    this.breakpointObserver.observe([ '(max-width: 600px)' ]).subscribe({
      next: (result) => {
        this.isSmallScreen = result.matches;
      },
      error: (error) => {
        console.error(error);
      }
    });
    let parkingString = localStorage.getItem('parking');
    if (!parkingString) {
      this.openDialog();
      return;
    }
    this.passValid = true;
    this.parking = JSON.parse(parkingString);
    this.center = latLng(this.parking!.geom.coordinates[1], this.parking!.geom.coordinates[0]);
  }

  openDialog() {
    const dialogRef = this.dialog.open(PassDialogComponent, {
      data: { credential: this.credential }
    });
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (!result) {
          this.passNotEntered = true;
          return;
        }
        this.passNotEntered = false;
        this.loading = true;
        this.parkingsService.getParking(result).subscribe({
          next: (parking) => {
            if (!parking) {
              this.loading = false;
              this.passValid = false;
              return;
            }
            localStorage.setItem('parking', JSON.stringify(parking));
            this.parking = parking;
            this.loading = false;
            this.passValid = true;
            this.center = latLng(this.parking!.geom.coordinates[1], this.parking!.geom.coordinates[0]);
          }
        });
      },
      error: (error) => {
      },
    });
  }

  updateStateParking(parking: Parking) {
    this.loadingUpdate = true;
    this.parkingsService.updateParking({
      ...parking,
      isFull: !parking.isFull,
    }).subscribe({
      next: (result) => {
        localStorage.setItem('parking', JSON.stringify(result));
        this.parking = result;
        this.loadingUpdate = false;
      },
      error: (error) => {
        this.loadingUpdate = false;
        console.error(error);
      }
    });
  }

  onMapReady(map: Map) {
    map.setView(this.center, 18);
  }

  createMarker(parking: Parking) {
    return marker([ parking.geom.coordinates[1], parking.geom.coordinates[0] ], {
      icon: icon({
        iconSize: [ 25, 41 ],
        iconAnchor: [ 13, 41 ],
        iconUrl: 'assets/images/marker-icon.png',
      }),
    });
  }
}
