import { Component, OnInit } from '@angular/core';

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
export class OffAoiComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
