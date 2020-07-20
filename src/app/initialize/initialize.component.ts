import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-initialize',
  templateUrl: './initialize.component.html',
  styleUrls: ['./initialize.component.css']
})
/** This class represents the component drawn on the initialize page. The
 *  component makes quite a few POST requests in order to load sim, video,
 *  and even markers into the tool.
 *
 * @author Saad Jamal
 */
export class InitializeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
