import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-otw',
  templateUrl: './otw.component.html',
  styleUrls: ['./otw.component.css']
})
/**
 *  This class represents the out the window component. Using HTML Canvas
 *  the bridge and beams of the cockpit window are drawn.
 *
 *  @author Saad Jamal
 */
export class OtwComponent implements AfterViewInit {
  /* Div element encapsulating this component. */
  @ViewChild('otwDiv') otwDiv: ElementRef<HTMLDivElement>;

  /* Height of the div excluding borders. */
  private height: number;

  /* Width of the div exluding borders. */
  private width: number;

  /* Canvas element drawing bridge. */
  @ViewChild('windowFrame', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;

  /* Ctx element used for animations. */
  private ctx: CanvasRenderingContext2D;

  /* A singular standardized unit of pixels that scales with the screen. It
   * is equal to 1/1000th of the component width. */
  private unit: number;

  constructor() { }

  /* The ViewChild annotations apply during the ngAfterViewInit stage. */
  ngAfterViewInit(): void {
    this.calculateProportions();

    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.ctx.fillStyle = '#505050';
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 1;

    this.render();
  }

  /* Animate the component. */
  render(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawBackground();
  }

  /* Background of the component. This won't change during play-back. */
  drawBackground(): void {
    // Left Window Frame
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(70 * this.unit, this.height);
    this.ctx.lineTo(0, this.height);
    this.ctx.closePath();
    this.ctx.fill();

    // Trace Left Beam Outline
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(70 * this.unit, this.height);
    this.ctx.stroke();
    this.ctx.lineWidth = 1;

    // Right Window Frame
    this.ctx.beginPath();
    this.ctx.moveTo(this.width, 0);
    this.ctx.lineTo( this.width - (70 * this.unit), this.height);
    this.ctx.lineTo(this.width, this.height);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.width, 0);
    this.ctx.lineTo( this.width - (70 * this.unit), this.height);
    this.ctx.stroke();
    this.ctx.lineWidth = 1;

    // Nose Framing
    const middlePixel: number = this.width / 2;
    const noseWidth: number = this.unit * 15;

    this.ctx.beginPath();
    this.ctx.moveTo(middlePixel - noseWidth, this.height);
    this.ctx.lineTo(middlePixel + noseWidth, this.height);
    this.ctx.lineTo(middlePixel + (2.5 * noseWidth), 0);
    this.ctx.lineTo(middlePixel - (2.5 * noseWidth), 0);
    this.ctx.closePath();
    this.ctx.fill();

    // Trase Nose Beams
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(middlePixel - noseWidth, this.height);
    this.ctx.lineTo(middlePixel - (2.5 * noseWidth), 0);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(middlePixel + noseWidth, this.height);
    this.ctx.lineTo(middlePixel + (2.5 * noseWidth), 0);
    this.ctx.stroke();
    this.ctx.lineWidth = 1;
  }

  /* Function that is called everytime window is resized. */
  onResize(event) {
    this.calculateProportions();
    this.render();
  }

  /* In order to determine the new height and widths, this function is
   * called each time the page resizes. */
  calculateProportions(): void {
    this.height = this.otwDiv.nativeElement.clientHeight;
    this.width = this.otwDiv.nativeElement.clientWidth;

    this.canvas.nativeElement.height = this.height;
    this.canvas.nativeElement.width = this.width;
    this.unit = (0.001 * this.width);
  }
}
