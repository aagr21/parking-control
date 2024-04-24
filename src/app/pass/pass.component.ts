import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { ParkingsService } from "../services/parkings.service";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-pass',
  standalone: true,
  imports: [
    MatProgressSpinner
  ],
  templateUrl: './pass.component.html',
  styleUrl: './pass.component.css'
})
export class PassComponent implements OnInit {
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  parkingsService = inject(ParkingsService);

  async ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if (!params['pass']) return;

      this.parkingsService.getParking(params['pass']).subscribe({
        next: (parking) => {
          if (!parking) {
            this.router.navigate([ '/404' ]);
            localStorage.removeItem('parking');
            return;
          }
          localStorage.setItem('parking', JSON.stringify(parking));
          this.router.navigate([ '/' ]);
        }
      });
    });
  }

}
