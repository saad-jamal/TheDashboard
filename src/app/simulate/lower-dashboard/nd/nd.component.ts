import { NdSharingService } from './../../data-sharing/nd-sharing.service';
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { NdMemory } from './nd-memory';
import { min } from 'rxjs/operators';

@Component({
  selector: 'app-nd',
  templateUrl: './nd.component.html',
  styleUrls: ['./nd.component.css']
})
/**
 * This class represents the Navigational Display. It uses HTML Canvas
 * to initially draw the underlying PNG, then overlays the background
 * using HTML Div's with variable data.
 *
 * @author Saad Jamal
 */
export class NdComponent implements AfterViewInit {
  /* Div element encapsulating this component. */
  @ViewChild('ndDiv') ndDiv: ElementRef<HTMLDivElement>;

  /* Height of the div excluding borders. */
  private height: number;

  /* Width of the div excluding borders. */
  private width: number;

  /* Canvas element drawing the background. */
  @ViewChild('ndBackground', { static: true })
  backgroundCanvas: ElementRef<HTMLCanvasElement>;

  /* Canvas element drawing the foreground. */
  @ViewChild('ndForeground', { static: true })
  foregroundCanvas: ElementRef<HTMLCanvasElement>;

  /* Ctx element used for background animation. */
  private backCtx: CanvasRenderingContext2D;

  /* Ctx element used for foreground animation. */
  private foreCtx: CanvasRenderingContext2D;

  /* A singular standardized unit of pixels that scales with the width of the
   * screen. It is equal to 1/1000th of the component width. */
  private wUnit: number;

  /* A singular standardized unit of pixels that scales with the height of
   * the screen. It is equal to 1/1000th of the component height. */
  private hUnit: number;

  /* An object that stores all the sim data needed to render this
   * component. */
  public localMemory: NdMemory;

  constructor(private sharingService: NdSharingService) {
    // Initialize with starting memory
    this.localMemory = {
      fo_ef_nd_mode: null,
      fo_ef_rnge: null,
      true_as: null,
      gnd_spd: null,
      hdg_angle: null,
      lat: null,
      long: null,
      mag_track_angle: null,
      mag_hdg_angle: null,
      wind_dir_at_ac: null,
      wind_spd_at_ac: null,
      rnp_vert: null,
      anp_vert: null,
      rnp_lat: null,
      anp_lat: null,

      fo_vsd_on: null,
      fo_bel_gs_lt: null,

      VSD_terrain: null,
      rate_of_clb: null,
      cal_as: null,
      pres_alt: null,
      mcp_alt_ds: null
    };
  }

  /* The ViewChild annotations apply during the ngAfterViewInit stage. */
  ngAfterViewInit(): void {
    this.calculateProportions();

    this.backCtx = this.backgroundCanvas.nativeElement.getContext('2d');
    this.foreCtx = this.foregroundCanvas.nativeElement.getContext('2d');
    this.render();

    this.sharingService.currentMemory.subscribe(memory => {
      this.localMemory = memory;
      this.render();
    });
  }

  /* Animate the component. */
  render(): void {
    this.backCtx.clearRect(0, 0, this.width, this.height);
    this.drawBackground();

    this.foreCtx.clearRect(0, 0, this.width, this.height);
    this.drawForeground();
  }

  /* Background of component. This won't change during playback. */
  drawBackground(): void {
    // Ground Speed (GS) Label
    this.backCtx.font = Math.round(32 * this.wUnit) + 'px Arial';
    this.backCtx.fillStyle = 'white';
    this.backCtx.fillText('GS', 14 * this.wUnit, 54 * this.hUnit);

    // True Air Speed (TAS) Label
    this.backCtx.font = Math.round(32 * this.wUnit) + 'px Arial';
    this.backCtx.fillText('TAS', 171 * this.wUnit, 54 * this.hUnit);

    this.backCtx.strokeStyle = 'white';
    this.backCtx.lineWidth = 5 * this.hUnit;
    this.backCtx.beginPath();
    this.backCtx.moveTo(160 * this.wUnit, 64 * this.hUnit);
    this.backCtx.lineTo(160 * this.wUnit, 5 * this.hUnit);
    this.backCtx.stroke();

    // Magnetic Track Angle Label
    this.backCtx.font = Math.round(40 * this.wUnit) + 'px Arial';
    this.backCtx.fillStyle = '#5afc03';
    this.backCtx.fillText('TRK', 290 * this.wUnit, 96 * this.hUnit);
    this.backCtx.fillText('MAG', 630 * this.wUnit, 96 * this.hUnit);

    this.backCtx.strokeStyle = 'white';
    this.backCtx.strokeRect((this.width / 2)  - (120 * this.wUnit), -1, 241 * this.wUnit, 96 * this.hUnit);

    // Heading Angle Label
    this.backCtx.strokeStyle = 'white';
    this.backCtx.strokeRect(630 * this.wUnit, 107 * this.hUnit, 120 * this.wUnit, 59 * this.hUnit);

    // Vertical Deviation Indicator
    this.backCtx.strokeStyle = 'white';
    this.backCtx.beginPath();
    this.backCtx.moveTo(860 * this.wUnit, 880 * this.hUnit);
    this.backCtx.lineTo(905 * this.wUnit, 880 * this.hUnit);
    this.backCtx.lineTo(905 * this.wUnit, 740 * this.hUnit);
    this.backCtx.lineTo(860 * this.wUnit, 740 * this.hUnit);
    this.backCtx.lineTo(905 * this.wUnit, 740 * this.hUnit);
    this.backCtx.lineTo(905 * this.wUnit, 600 * this.hUnit);
    this.backCtx.lineTo(860 * this.wUnit, 600 * this.hUnit);
    this.backCtx.stroke();

    this.backCtx.strokeStyle = '#f4b8ff';
    this.backCtx.beginPath();
    this.backCtx.moveTo(915 * this.wUnit, 880 * this.hUnit);
    this.backCtx.lineTo(940 * this.wUnit, 880 * this.hUnit);
    this.backCtx.lineTo(940 * this.wUnit, 750 * this.hUnit);
    this.backCtx.stroke();

    this.backCtx.beginPath();
    this.backCtx.moveTo(940 * this.wUnit, 730 * this.hUnit);
    this.backCtx.lineTo(940 * this.wUnit, 600 * this.hUnit);
    this.backCtx.lineTo(915 * this.wUnit, 600 * this.hUnit);
    this.backCtx.stroke();

    this.strokeWideRhombus(this.backCtx, 940 * this.wUnit, 740 * this.hUnit, 21 * this.wUnit, '#f4b8ff');

    // Dashed Bar In Bottom Left
    this.backCtx.font = Math.round(48 * this.wUnit) + 'px Arial';
    this.backCtx.fillStyle = '#5afc03';
    this.backCtx.fillText('-------', 14 * this.wUnit, 980 * this.hUnit);
  }

  /* Animates a dynamic Vertical Situation Display. */
  drawDynamicVsd(): void {
    const X = (175 * this.wUnit);
    const Y = (590 * this.hUnit) + (400 * this.hUnit);
    const WID = 650 * this.wUnit;
    const HEI = 400 * this.hUnit;

    this.foreCtx.fillStyle = 'black';
    this.foreCtx.strokeStyle = 'white';
    this.foreCtx.lineWidth = 1;
    this.foreCtx.font = Math.round(25 * this.wUnit) + 'px Arial';

    // Draw background of VSD.
    this.foreCtx.fillRect(X, Y, WID, -HEI);

    // Draw Y Axis.
    this.foreCtx.fillStyle = '#848484';
    this.foreCtx.fillRect(X, Y, 108 * this.wUnit, -335 * this.hUnit);

    this.foreCtx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const shiftFactor = (65 * this.hUnit) + ((50 * this.hUnit) * i);
      this.foreCtx.beginPath();
      this.foreCtx.moveTo(X + 108 * this.wUnit, Y - shiftFactor);
      if (i % 2 === 0) {
        this.foreCtx.lineTo(X + 80 * this.wUnit, Y - shiftFactor);
      } else {
        this.foreCtx.lineTo(X + 94 * this.wUnit, Y - shiftFactor);
      }
      this.foreCtx.stroke();
    }
    this.foreCtx.lineWidth = 1;
    this.foreCtx.fillStyle = 'white';

    // const maxY = (Math.max(this.localMemory.pres_alt, Math.max(...this.localMemory.VSD_terrain)) + 1000)
    //   - (this.localMemory.pres_alt % 1000);
    // const minY = 1000 * Math.floor(Math.min(...this.localMemory.VSD_terrain) / 1000);

    let maxY: number;
    let minY: number;
    if (this.localMemory.pres_alt <= 1000) {
      maxY = 1000;
      minY = 0;
    } else if (this.localMemory.pres_alt <= 2000) {
      maxY = 2000;
      minY = 1000;
    } else {
      minY = Math.floor(Math.min(...this.localMemory.VSD_terrain) / 2000) * 2000;
      maxY = Math.ceil(Math.max(this.localMemory.pres_alt, Math.max(...this.localMemory.VSD_terrain)) / 2000) * 2000;
    }

    const midY = (maxY + minY) / 2;
    const yAxis = [minY, midY, maxY];

    for (let i = 0; i < 3; i++) {
      this.foreCtx.fillText(String(Math.floor(yAxis[i]).toFixed(0)), X + (8 * this.wUnit), Y - (55 * this.hUnit) - (i * 100 * this.hUnit));
    }
    // Draw X Axis.
    this.foreCtx.fillStyle = '#848484';
    this.foreCtx.fillRect(X + (115 * this.wUnit), Y, 535 * this.wUnit, -65 * this.hUnit);

    this.foreCtx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const shiftFactor = (185 * this.wUnit) + (i * 110 * this.wUnit);
      this.foreCtx.beginPath();
      this.foreCtx.moveTo(X + shiftFactor, Y - (65 * this.hUnit));
      if (i % 2 === 0) {
        this.foreCtx.lineTo(X + shiftFactor, Y - (35 * this.hUnit));
      } else {
        this.foreCtx.lineTo(X + shiftFactor, Y - (50 * this.hUnit));
      }
      this.foreCtx.stroke();
    }
    this.foreCtx.lineWidth = 1;

    const maxX = Math.floor(this.localMemory.fo_ef_rnge / 2);
    this.foreCtx.fillStyle = 'white';
    for (let i = 0; i < 3; i++) {
      if (maxX != null) {
        const axVal = String(Math.ceil(i * (maxX / 2)).toFixed(0));
        this.foreCtx.fillText(axVal, X + (178 * this.wUnit) + (i * 220 * this.wUnit), Y - (10 * this.hUnit));
      }
    }

    // Draw Green Terrain
    this.foreCtx.lineWidth = 1;
    this.foreCtx.strokeStyle = '#5afc03';
    for (let i = 0; i < 20; i ++) {
      const shiftXFactor = (185 * this.wUnit) + (i * 460 * this.wUnit / 20);
      const terrainHeight = Y - (70 * this.hUnit) - (200 * this.hUnit * (this.localMemory.VSD_terrain[i] - minY) / (maxY - minY));

      this.foreCtx.beginPath();
      this.foreCtx.moveTo(X + shiftXFactor, Y - (65 * this.hUnit));
      this.foreCtx.lineTo(X + shiftXFactor, terrainHeight);
      this.foreCtx.stroke();
    }

    this.foreCtx.lineWidth = 2;
    const firstHeight = Y - (70 * this.hUnit) - (200 * this.hUnit * (this.localMemory.VSD_terrain[0] - minY) / (maxY - minY));
    this.foreCtx.beginPath();
    this.foreCtx.moveTo(X + (185 * this.wUnit), firstHeight);
    for (let i = 1; i < 20; i ++) {
      const shiftXFactor = (185 * this.wUnit) + (i * 460 * this.wUnit / 20);
      const terrainHeight = Y - (70 * this.hUnit) - (200 * this.hUnit * (this.localMemory.VSD_terrain[i] - minY) / (maxY - minY));

      this.foreCtx.lineTo(X + shiftXFactor, terrainHeight);
    }
    this.foreCtx.stroke();


    this.foreCtx.strokeStyle = 'white';

    // Draw MCP Alt Select
    this.foreCtx.fillStyle = '#f4b8ff';
    this.foreCtx.strokeStyle = '#f4b8ff';
    this.foreCtx.font = Math.round(32 * this.wUnit) + 'px Arial';
    this.foreCtx.fillText(String(this.localMemory.mcp_alt_ds), X + (17 * this.wUnit), Y - (340 * this.hUnit));
    this.foreCtx.lineWidth = 1;
    if (this.localMemory.mcp_alt_ds < (maxY + ((maxY - midY) / 2)) && this.localMemory.mcp_alt_ds > minY) {
      const mcpHeight = Y - (65 * this.hUnit) - (200 * this.hUnit * (this.localMemory.mcp_alt_ds - minY) / (maxY - minY));
      for (let i = 0; i < 28; i += 2) {
        this.foreCtx.beginPath();
        this.foreCtx.moveTo(X + (110 * this.wUnit) + (20 * this.wUnit * i), mcpHeight);
        this.foreCtx.lineTo(X + (110 * this.wUnit) + (20 * this.wUnit * i) + (this.wUnit * 20), mcpHeight);
        this.foreCtx.stroke();
      }
    }

    // Draw Airplane Triangle
    this.foreCtx.strokeStyle = 'white';
    this.foreCtx.fillStyle = 'white';
    const airplaneX = X + 175 * this.wUnit;
    const airplaneY = Y - (70 * this.hUnit) - (200 * this.hUnit * (this.localMemory.pres_alt - minY) / (maxY - minY));

    this.foreCtx.lineWidth = 2;
    this.foreCtx.beginPath();
    this.foreCtx.moveTo(airplaneX, airplaneY);
    this.foreCtx.lineTo(airplaneX - (55 * this.wUnit), airplaneY - (25 * this.hUnit));
    this.foreCtx.lineTo(airplaneX - (55 * this.wUnit), airplaneY);
    this.foreCtx.closePath();
    this.foreCtx.stroke();

    this.foreCtx.beginPath();
    this.foreCtx.moveTo(airplaneX + (this.wUnit * 10), airplaneY);
    const angle = Math.atan(this.localMemory.rate_of_clb / (this.localMemory.cal_as * 101.269));
    const xShift = (180 * this.wUnit) * Math.cos(angle);
    const yShift = (180 * this.wUnit) * Math.sin(angle);
    this.foreCtx.lineTo(airplaneX + (this.wUnit * 10) + xShift, airplaneY - yShift);
    this.foreCtx.stroke();

    this.foreCtx.lineWidth = 1;

    // Draw VSD Border.
    this.foreCtx.lineWidth = 2;
    this.foreCtx.strokeRect(X, Y, WID, -HEI);
  }

  /* Foreground of component. This will change during playback as
   * data in memory changes. */
  drawForeground(): void {
    this.foreCtx.lineWidth = 5 * this.hUnit;
    if (this.localMemory.fo_vsd_on === true) {
      this.drawVsdCompass();
      this.drawDynamicVsd();
    } else {
      this.drawRegularCompass();
    }
  }

  /* Function that is called everytime window is resized. */
  onResize(event) {
    this.calculateProportions();
    this.render();
  }

  /* In order to determine the new height and widths, this function is
   * called each time the page resizes. */
  calculateProportions(): void {
    this.height = this.ndDiv.nativeElement.clientHeight;
    this.width = this.ndDiv.nativeElement.clientWidth;
    this.wUnit = (0.001 * this.width);
    this.hUnit = (0.001 * this.height);

    this.backgroundCanvas.nativeElement.height = this.height;
    this.backgroundCanvas.nativeElement.width = this.width;

    this.foregroundCanvas.nativeElement.height = this.height;
    this.foregroundCanvas.nativeElement.width = this.width;
  }

  /* Strokes a wide rhombus on the given canvas context. */
  strokeWideRhombus(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, color: string): void {
    const halfWidth = width / 2;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + halfWidth); // Top
    ctx.lineTo(x - halfWidth - (10 * this.wUnit), y); // Left
    ctx.lineTo(x, y - halfWidth); // Bottom
    ctx.lineTo(x + halfWidth + (10 * this.wUnit), y); // Right
    ctx.closePath();
    ctx.stroke();
  }

  /* The compass to be drawn if the VSD is turned off. Also draws lat/long labels
   * which would otherwise be hidden if VSD was turned on. */
  drawRegularCompass(): void {
    // Latitude and Longitude Label
    this.backCtx.font = Math.round(32 * this.wUnit) + 'px Arial';
    this.backCtx.fillStyle = 'white';
    this.backCtx.fillText('LAT', 560 * this.wUnit, 835 * this.hUnit);
    this.backCtx.fillText('LONG', 560 * this.wUnit, 890 * this.hUnit);

    // Vertical RNP and ANP Labels With Data
    this.backCtx.font = Math.round(32 * this.wUnit) + 'px Arial';
    this.backCtx.fillStyle = '#5afc03';
    if (this.localMemory.rnp_vert != null) {
      this.backCtx.fillText('RNP', 830 * this.wUnit, 695 * this.hUnit);
      this.backCtx.fillText(this.localMemory.rnp_vert.toFixed(2), 830 * this.wUnit, 725 * this.hUnit);
    }
    if (this.localMemory.anp_vert != null) {
      this.backCtx.fillText('ANP', 830 * this.wUnit, 775 * this.hUnit);
      this.backCtx.fillText(this.localMemory.anp_vert.toFixed(2), 830 * this.wUnit, 805 * this.hUnit);
    }

    // Lateral RNP and ANP Labels With Data
    this.backCtx.font = Math.round(32 * this.wUnit) + 'px Arial';
    this.backCtx.fillStyle = '#5afc03';
    if (this.localMemory.rnp_lat != null) {
      this.backCtx.fillText('RNP', 410 * this.wUnit, 950 * this.hUnit);
      this.backCtx.fillText(this.localMemory.rnp_lat.toFixed(2), 410 * this.wUnit, 980 * this.hUnit);
    }
    if (this.localMemory.anp_lat != null) {
      this.backCtx.fillText('ANP', 520 * this.wUnit, 950 * this.hUnit);
      this.backCtx.fillText(this.localMemory.anp_lat.toFixed(2), 520 * this.wUnit, 980 * this.hUnit);
    }

    // Compass arc
    this.foreCtx.strokeStyle = 'white';
    this.foreCtx.beginPath();
    this.foreCtx.ellipse(500 * this.wUnit, 680 * this.hUnit, 500 * this.wUnit, 500 * this.hUnit, 0, (7 * Math.PI) / 6, (11 * Math.PI) / 6);
    this.foreCtx.stroke();

    // Airplane Triangle and Path Line
    this.backCtx.strokeStyle = 'white';
    this.backCtx.beginPath();
    this.backCtx.moveTo(500 * this.wUnit, 780 * this.hUnit);
    this.backCtx.lineTo(460 * this.wUnit, 890 * this.hUnit);
    this.backCtx.lineTo(540 * this.wUnit, 890 * this.hUnit);
    this.backCtx.lineTo(500 * this.wUnit, 780 * this.hUnit);
    this.backCtx.stroke();

    this.backCtx.beginPath();
    this.backCtx.moveTo(500 * this.wUnit, 780 * this.hUnit);
    this.backCtx.lineTo(500 * this.wUnit, 182 * this.hUnit);
    this.backCtx.stroke();

    this.backCtx.beginPath();
    this.backCtx.moveTo(500 * this.wUnit, 920 * this.hUnit);
    this.backCtx.lineTo(500 * this.wUnit, 990 * this.hUnit);
    this.backCtx.stroke();

    // Compass Ticks
    const xRadius = 500 * this.wUnit;
    const yRadius = 500 * this.hUnit;

    const minEndingX = (500 * this.wUnit) + (xRadius * Math.cos((5 * Math.PI) / 6));
    const maxEndingX = (500 * this.wUnit) + (xRadius * Math.cos(((5 * Math.PI) / 6) - ((15 * 8 * Math.PI) / 180)));
    for (let i = 0; i < 9; i++) {
      let angle = ((5 * Math.PI) / 6) - ((15 * i * Math.PI) / 180);
      angle += ((Math.PI * ((this.localMemory.hdg_angle - 90) % 15) / 180));
      let startingX: number;
      let startingY: number;
      if (i % 2 === 0) {
        startingX = (500 * this.wUnit) + (0.8 * (xRadius * Math.cos(angle)));
        startingY = (680 * this.hUnit) - (0.8 * (yRadius * Math.sin(angle)));
      } else {
        startingX = (500 * this.wUnit) + (0.9 * (xRadius * Math.cos(angle)));
        startingY = (680 * this.hUnit) - (0.9 * (yRadius * Math.sin(angle)));
      }
      let endingX = (500 * this.wUnit) + (xRadius * Math.cos(angle));
      let endingY = (680 * this.hUnit) - (yRadius * Math.sin(angle));
      if (endingX >= minEndingX && endingX <= maxEndingX) {
        this.foreCtx.beginPath();
        this.foreCtx.moveTo(startingX, startingY);
        this.foreCtx.lineTo(endingX, endingY);
        this.foreCtx.stroke();
      }
    }
  }

  /* The compass to be drawn if the VSD is turned on. */
  drawVsdCompass(): void {
    // Draw airplane triangle in the center of the ND
    this.foreCtx.lineWidth = 8 * this.hUnit;
    this.foreCtx.strokeStyle = 'white';
    this.foreCtx.beginPath();
    this.foreCtx.moveTo(500 * this.wUnit, 430 * this.hUnit);
    this.foreCtx.lineTo(550 * this.wUnit, 570 * this.hUnit);
    this.foreCtx.lineTo(450 * this.wUnit, 570 * this.hUnit);
    this.foreCtx.closePath();
    this.foreCtx.stroke();

    this.foreCtx.lineWidth = 5 * this.hUnit;

    // Draw full compass
    const xRadius = 350 * this.wUnit;
    const yRadius = 350 * this.hUnit;

    for (let i = 0; i < 36; i++) {
      let angle = (Math.PI * 10 * i) / 180;
      const shiftFactor = (this.localMemory.hdg_angle * Math.PI) / 180;
      angle += shiftFactor;
      const xFactor = xRadius * Math.cos(angle);
      const yFactor = yRadius * Math.sin(angle);

      let startingX: number;
      let startingY: number;
      if (i % 2 === 0) {
        startingX = (500 * this.wUnit) + (0.9 * xFactor);
        startingY = (500 * this.hUnit) + (0.9 * yFactor);
      } else {
        startingX = (500 * this.wUnit) + (0.8 * xFactor);
        startingY = (500 * this.hUnit) + (0.8 * yFactor);
      }
      let endingX = (500 * this.wUnit) + (xFactor);
      let endingY = (500 * this.hUnit) + (yFactor);

      this.foreCtx.beginPath();
      this.foreCtx.moveTo(startingX, startingY);
      this.foreCtx.lineTo(endingX, endingY);
      this.foreCtx.stroke();
    }
  }


  /* Converts the digit representation of the ND Mode into a string. */
  public stringifyNDMode(modeNumber: number): string {
    if (modeNumber === 1) {
      return 'APP';
    } else if (modeNumber === 2) {
      return 'VOR';
    } else if (modeNumber === 3) {
      return 'MAP';
    } else if (modeNumber === 4) {
      return 'PLAN';
    } else {
      return '';
    }
  }
}
