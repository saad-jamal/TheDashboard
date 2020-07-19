import { Component, OnInit } from '@angular/core';

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
export class NoDataComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
