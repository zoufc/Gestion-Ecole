import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import {
  clearLocalStorage,
  getLocalData,
} from '../../../utils/local-storage-service';
import {
  OrganisationCategory,
  CourseStatus,
  UserRoles,
} from '../../../utils/enums';
@Component({
  selector: 'app-filtered-courses-table',
  imports: [CommonModule, RouterModule, NgxSkeletonLoaderModule],
  templateUrl: './filtered-courses-table.component.html',
  styleUrl: './filtered-courses-table.component.css',
})
export class FilteredCoursesTableComponent {
  constructor() {}
  @Input() data: Array<any> = [];
  @Input() status!: string;
  @Input() isLoadingData: boolean = false;

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    console.log(`TABLE DATA ${this.status}`, this.data);
  }

  isOrganisationProvider(): boolean {
    const category = getLocalData('organisationCategory');
    return category == OrganisationCategory.provider;
  }

  getFormatedStatus(status: string) {
    let formatedStatus =
      status == CourseStatus.scheduled
        ? 'Planifié'
        : status == CourseStatus.in_progress
        ? 'En cours'
        : status == CourseStatus.completed
        ? 'Terminé'
        : status == CourseStatus.canceled
        ? 'Annulé'
        : status == CourseStatus.postponed
        ? 'Reporté'
        : '';
    return formatedStatus;
  }
}
