import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-controller',
  templateUrl: './controller.component.html',
  styleUrls: ['./controller.component.css']
})
/**
 * This class does most of the heavy lifting of controlling the overall
 * display. It represents the controls on the bottom right of the screen
 * and calls other functions.
 */
export class ControllerComponent implements OnInit {

  /** Variable that represents whether the simulation is playing. */
  public playing: boolean;

  constructor() {
    this.playing = false;
  }

  ngOnInit(): void {
  }

  /* Function that is called when play/pause button is clicked. It should
   * pause/resume play-back. */
  public play(): void {
    this.playing = !this.playing;
  }

  /* Function that is called when forward button is clicked. It should
   * forward the play-back by exactly one second. */
  public forward(): void {
    alert('Forward Clicked!');
  }

  /* Function that is called when backward button is clicked. It should
   * decrement the play-back by exactly one second. */
  public backward(): void {
    alert('Backward Clicked!');
  }
}
