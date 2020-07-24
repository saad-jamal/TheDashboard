import { OffAoiSharingService } from './../../data-sharing/off-aoi-sharing.service';
import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-off-aoi',
  templateUrl: './off-aoi.component.html',
  styleUrls: ['./off-aoi.component.css']
})
/**
 * This class represents the Off AoI div. Eye tracking falls over this
 * div if the pilot looks away from any specified AoI.
 *
 * @author Saad Jamal
 */
export class OffAoiComponent implements OnInit, AfterViewInit {

  /* If the pilot views AoI this should be true. */
  public highlighted: boolean;

  constructor(private sharingService: OffAoiSharingService) {
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
