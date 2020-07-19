import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
/**
 *  This class represents the component drawn on the home page '/'. It
 *  contains three buttons for navigation, and performs simple CSS
 *  animations upon loading the page.
 *
 *  @author Saad Jamal
 */
export class HomeComponent {
  /** Redirect user to NASA home page. */
  public nasaHomePage(): void {
    window.location.href = 'https://www.nasa.gov';
  }

  /** Redirect user to UC Berkeley home page. */
  public berkHomePage(): void {
    window.location.href = 'https://berkeley.edu';
  }
}
