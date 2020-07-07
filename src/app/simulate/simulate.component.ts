import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-simulate',
  templateUrl: './simulate.component.html',
  styleUrls: ['./simulate.component.css'],
  encapsulation: ViewEncapsulation.None
})
/**
 *  This class represents the component drawn on the simulation page '/simulate.'
 *  It contains divs for each part of the simulation, with specific components
 *  inside them.
 *
 *  @author Saad Jamal
 */
export class SimulateComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
