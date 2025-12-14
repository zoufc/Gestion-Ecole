import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  constructor(private spinnerService: NgxSpinnerService) {}

  show(name: string = 'primary') {
    this.spinnerService.show(name);
  }

  hide(name: string = 'primary') {
    this.spinnerService.hide(name);
  }
}
