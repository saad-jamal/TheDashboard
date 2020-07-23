import { Disk } from './interfaces/disk';
import { SimulateService } from './simulate.service';
import { Component, OnInit, OnDestroy, ViewEncapsulation, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

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
export class SimulateComponent implements OnInit, OnDestroy {

  constructor(@Inject(DOCUMENT) private document: Document,
              private renderer: Renderer2,
              private simService: SimulateService) { }

  ngOnInit(): void {
    this.renderer.addClass(this.document.body, 'bodyBackground');
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(this.document.body, 'bodyBackground');
  }

}
