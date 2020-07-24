import { NoDataSharingService } from './../../data-sharing/no-data-sharing.service';
import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-no-data',
  templateUrl: './no-data.component.html',
  styleUrls: ['./no-data.component.css']
})
/**
 * This class represents the No Data div. Eye tracking will fall here
 * if the confidence interval is below 85%.
 *
 * @author Saad Jamal
 */
export class NoDataComponent implements OnInit, AfterViewInit {

  /* If we do not have data about a fixation this should be true. */
  public highlighted: boolean;

  constructor(private sharingService: NoDataSharingService) {
    this.highlighted = false;
  }

  ngOnInit(): void {
  }

  /* The ViewChild annotations apply during the ngAfterViewInit stage. */
  ngAfterViewInit(): void {
    this.sharingService.currentMemory.subscribe(memory => {
      this.highlighted = memory;
    });
  }

}
