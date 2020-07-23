import { MiscSharingService } from './../../data-sharing/misc-sharing.service';
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MiscMemory} from './misc-memory';
@Component({
  selector: 'app-misc',
  templateUrl: './misc.component.html',
  styleUrls: ['./misc.component.css']
})
/**
 * This class represents miscellaneous components not necessarily
 * captured by eye-tracking data. As of now we animate the throttle
 * levers, selected flaps, and spoiler positions. It uses HTML canvas
 * for all animations.
 *
 * @author Saad Jamal
 */
export class MiscComponent implements AfterViewInit {
  /* Div element encapsulating this component. */
  @ViewChild('miscDiv') miscDiv: ElementRef<HTMLDivElement>;

  /* Height of the div excluding borders. */
  private height: number;

  /* Width of the div excluding borders. */
  private width: number;

  /* Canvas Element drawing the background. */
  @ViewChild('miscBackground', { static: true})
  backgroundCanvas: ElementRef<HTMLCanvasElement>;

  /* Canvas element drawing the foreground. */
  @ViewChild('miscForeground', { static: true })
  foregroundCanvas: ElementRef<HTMLCanvasElement>;

  /* Ctx element used for background animation. */
  private backCtx: CanvasRenderingContext2D;

  /* Ctx element used for foreground animation. */
  private foreCtx: CanvasRenderingContext2D;

  /* A singular standardized unit of pixels that scales with the
   * width of screen. It is equal to 1/1000th of the component width. */
  private wUnit: number;

  /* A singular standardized unit of pixels that scales with the height of
   * the screen. It is equal to 1/1000th of the component height. */
   private hUnit: number;

  /* An object that stores all the sim data needed to render this
   * component. */
  public localMemory: MiscMemory;

  constructor(private sharingService: MiscSharingService) {
    // Initialize with starting memory.
    this.localMemory = {
      throttle_1_pos: null,
      throttle_2_pos: null,
      flap_angle: null,
      spoiler_pos: null,
      mstr_caution: null,
      capt_ap_discon: null,
      fo_ap_discon: null,
      ap_caut_lt: null,
      ap_warn_lt: null,
      ap_discon_horn: null,
      alt_warn_horn: null,
      at_1_discon: null,
      at_2_discon: null,
      at_caut_lt: null,
      at_warn_lt: null,
      FMC_alert_lt: null,
      spd_brk_arm: null,
      spdbrk_ext_lt: null
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
    // Draw Border Of Alert Box
    this.backCtx.lineWidth = 2;
    this.backCtx.strokeStyle = 'black';
    this.backCtx.fillStyle = 'black';
    this.backCtx.strokeRect(135 * this.wUnit, 710 * this.hUnit, 700 * this.wUnit, 280 * this.hUnit);
    this.backCtx.lineWidth = 1;
    this.backCtx.font = Math.round(80 * this.wUnit) + 'px Arial';
    this.backCtx.fillText('Alerts & Warnings:', 132 * this.wUnit, 705 * this.hUnit);
  }

  /* Draw background for selected flap position tape. */
  drawFlapTape(): void {
    const X = 150 * this.wUnit;
    const Y = 200 * this.hUnit;
    const WID = 180 * this.wUnit;
    const HEI = 470 * this.hUnit;

    this.foreCtx.strokeStyle = 'black';
    this.foreCtx.fillStyle = 'black';
    this.foreCtx.font = Math.round(60 * this.wUnit) + 'px Arial';
    this.foreCtx.lineWidth = 1;

    this.foreCtx.strokeRect(X, Y, WID, HEI);

    this.foreCtx.save();
    this.foreCtx.translate(X, Y);
    this.foreCtx.rotate(-Math.PI / 2);
    this.foreCtx.fillText('SELECTED FLAP POSITION', -800 * this.wUnit, -1);
    this.foreCtx.restore();

    this.foreCtx.font = Math.round(70 * this.wUnit) + 'px Arial';
    const addFactor = HEI / 7;
    const labels = ['UP', '1', '5', '15', '25', '30', '45'];
    for (let i = 0; i < 7; i++) {
      this.foreCtx.fillText(labels[i], X + (40 * this.wUnit), Y + (40 * this.hUnit) + (i * addFactor));
    }
  }

  /* Foreground of component. This won't change during playback. */
  drawForeground(): void {
    // Render Throttle Levers
    this.drawThrottleLever(252 * this.wUnit, 140 * this.hUnit, 68 * this.wUnit, 23 * this.hUnit, this.localMemory.throttle_1_pos);
    this.drawThrottleLever(754 * this.wUnit, 140 * this.hUnit, 68 * this.wUnit, 23 * this.hUnit, this.localMemory.throttle_2_pos);

    // Render Selected Flap Indicator
    this.drawFlapIndicator();
    this.drawFlapTape();

    // Render Spoiler Position Tape
    this.drawSpoilerTape();
    this.drawSpoilerTicker();

    // Render Speed Brake Warning Lights
    this.drawBrakeWarningLights();

    // Render Warning Lights and Alerts
    this.drawAlerts();
  }

  /* Writes All Other Alerts. */
  drawAlerts(): void {
    this.foreCtx.font = Math.round(60 * this.wUnit) + 'px Arial';
    this.foreCtx.fillStyle = 'red';

    const X = 155 * this.wUnit;
    let ledger = 735 * this.hUnit;
    let spacing = 25 * this.hUnit;

    if (this.localMemory.mstr_caution) {
      this.foreCtx.fillText('▻ MASTER CAUTION', X, ledger);
      ledger += spacing;
    }
    if (this.localMemory.capt_ap_discon) {
        this.foreCtx.fillText('▻ CAPT A/P DISCON', X, ledger);
        ledger += spacing;
    }
    if (this.localMemory.fo_ap_discon) {
        this.foreCtx.fillText('▻ FO A/P DISCON', X, ledger);
        ledger += spacing;
    }
    if (this.localMemory.ap_caut_lt) {
        this.foreCtx.fillText('▻ A/P CAUTION Lt', X, ledger);
        ledger += spacing;
    }
    if (this.localMemory.ap_warn_lt) {
        this.foreCtx.fillText('▻ A/P WARNING Lt', X, ledger);
        ledger += spacing;
    }
    if (this.localMemory.ap_discon_horn) {
        this.foreCtx.fillText('▻ A/P DISCON HORN', X, ledger);
        ledger += spacing;
    }
    if (this.localMemory.alt_warn_horn) {
        this.foreCtx.fillText('▻ ALT WARN HORN', X, ledger);
        ledger += spacing;
    }
    if (this.localMemory.at_1_discon) {
        this.foreCtx.fillText('▻ #1 A/T DISCON', X, ledger);
        ledger += spacing;
    }
    if (this.localMemory.at_2_discon) {
        this.foreCtx.fillText('▻ #2 A/T DISCON', X, ledger);
        ledger += spacing;
    }
    if (this.localMemory.at_caut_lt) {
        this.foreCtx.fillText('▻ A/T CAUTION Lt', X, ledger);
        ledger += spacing;
    }
    if (this.localMemory.at_warn_lt) {
        this.foreCtx.fillText('▻ A/T WARNING Lt', X, ledger);
        ledger += spacing;
    }
    if (this.localMemory.FMC_alert_lt) {
        this.foreCtx.fillText('▻ FMC ALERT Lt', X, ledger);
        ledger += spacing;
    }
  }

  /* Draws the Speed Brake and Speed Brk Extended Lights. */
  drawBrakeWarningLights(): void  {
    this.foreCtx.lineWidth = 3;
    this.foreCtx.font = Math.round(50 * this.wUnit) + 'px Arial';
    if (!this.localMemory.spd_brk_arm) {
      this.foreCtx.fillStyle = 'rgba(219, 219, 219, 0.6)';
      this.foreCtx.strokeStyle = 'rgba(219, 219, 219, 0.6)';
     } else {
      this.foreCtx.fillStyle = 'rgba(0, 77, 4, 1)';
      this.foreCtx.strokeStyle = 'rgba(0, 77, 4, 1)';
    }
    this.foreCtx.strokeRect(380 * this.wUnit, 540 * this.hUnit, 300 * this.wUnit, 60 * this.hUnit);
    this.foreCtx.fillText('SPD BRAKE', 390 * this.wUnit, 565 * this.hUnit);
    this.foreCtx.fillText('ARMED', 440 * this.wUnit, 585 * this.hUnit);

    if (!this.localMemory.spdbrk_ext_lt) {
      this.foreCtx.fillStyle = 'rgba(219, 219, 219, 0.6)';
      this.foreCtx.strokeStyle = 'rgba(219, 219, 219, 0.6)';
     } else {
      this.foreCtx.fillStyle = 'rgba(0, 77, 4, 1)';
      this.foreCtx.strokeStyle = 'rgba(0, 77, 4, 1)';
    }
    this.foreCtx.strokeRect(380 * this.wUnit, 610 * this.hUnit, 300 * this.wUnit, 60 * this.hUnit);
    this.foreCtx.fillText('SPD BRAKE', 390 * this.wUnit, 635 * this.hUnit);
    this.foreCtx.fillText('EXTENDED', 395 * this.wUnit, 655 * this.hUnit);
    this.foreCtx.lineWidth = 1;
  }

  /* Draw Spoiler Ticker. */
  drawSpoilerTicker(): void {
    const X = 700 * this.wUnit;
    const Y = 355 * this.hUnit;

    this.foreCtx.strokeStyle = 'black';
    this.foreCtx.fillStyle = 'white';
    this.foreCtx.lineWidth = 2;

    this.foreCtx.beginPath();
    this.foreCtx.moveTo(X, Y);
    this.foreCtx.lineTo(X + (40 * this.wUnit), Y - (20 * this.hUnit));
    this.foreCtx.lineTo(X + (200 * this.wUnit), Y - (20 * this.hUnit));
    this.foreCtx.lineTo(X + (200 * this.wUnit), Y + (20 * this.hUnit));
    this.foreCtx.lineTo(X + (40 * this.wUnit), Y + (20 * this.hUnit));
    this.foreCtx.closePath();
    this.foreCtx.stroke();
    this.foreCtx.fill();
  }

  /* Draw Spoiler Position Tape. */
  drawSpoilerTape(): void {
    const X = 500 * this.wUnit;
    const Y = 200 * this.hUnit;
    const WID = 180 * this.wUnit;
    const HEI = 320 * this.hUnit;

    this.foreCtx.font = Math.round(60 * this.wUnit) + 'px Arial';
    this.foreCtx.save();
    this.foreCtx.translate(X, Y);
    this.foreCtx.rotate(-Math.PI / 2);
    this.foreCtx.fillText('SPOILER POSITION', -580 * this.wUnit, -3);
    this.foreCtx.restore();

    this.foreCtx.lineWidth = 2;
    this.foreCtx.strokeRect(X, Y, WID, HEI);
    this.foreCtx.lineWidth = 1;

    const value = this.localMemory.spoiler_pos;
    const bigTicks = 100;
    const smallTicks = 1;
    const scale = 90 * this.hUnit;
    const fontSize = 60 * this.wUnit;

    this.foreCtx.save();
    this.foreCtx.fillStyle = 'white';
    this.foreCtx.strokeStyle = 'black';
    this.foreCtx.rect(X, Y, WID, HEI);
    this.foreCtx.fillRect(X, Y, WID, HEI);
    this.foreCtx.clip();


    const numberToDraw = Math.floor(HEI / scale);

    this.foreCtx.font = fontSize + 'px Arial';
    this.foreCtx.fillStyle = 'white';

    this.foreCtx.textAlign = 'center';
    this.foreCtx.textBaseline = 'middle';

    for (let i = (-1 * numberToDraw); i < numberToDraw; i++) {
      const relValue = Math.floor((value - smallTicks * i) / smallTicks) * smallTicks;
      const diff = (value - relValue) / smallTicks;
      const newY = ((Y + HEI) / 2) + (scale * diff) + (95 * this.hUnit);

      if (((newY) > Y) && ((newY - fontSize) < (Y + HEI))) {
        if (relValue % bigTicks === 0) {
          const shiftX = 5 * this.wUnit;
          const shiftY = 3 * this.hUnit;

          this.foreCtx.font = (fontSize * 1.5) + 'px Arial';

          this.foreCtx.lineWidth = 1;
          this.foreCtx.strokeStyle = 'black';
          this.foreCtx.beginPath();
          this.foreCtx.moveTo(X + shiftX, newY - (fontSize * 0.75) - shiftY);
          this.foreCtx.lineTo(X + shiftX + WID, newY - (fontSize * 0.75) - shiftY);
          this.foreCtx.stroke();

          this.foreCtx.beginPath();
          this.foreCtx.moveTo(X + shiftX, newY + (fontSize * 0.75) - shiftY);
          this.foreCtx.lineTo(X + shiftX + WID, newY + (fontSize * 0.75) - shiftY);
          this.foreCtx.stroke();

          this.foreCtx.lineWidth = 1;
          this.foreCtx.fillStyle = 'black';
          this.foreCtx.fillText(String(relValue), X + (WID / 2) + shiftX, newY);
          this.foreCtx.font = fontSize + 'px Arial';
        } else if (relValue % smallTicks === 0) {
          const textWidth = this.foreCtx.measureText(String(relValue)).width;

          this.foreCtx.lineWidth = 1;

          this.foreCtx.strokeStyle = 'black';
          this.foreCtx.beginPath();
          this.foreCtx.moveTo(X + (WID / 2) + (20 * this.wUnit), newY);
          this.foreCtx.lineTo(X + WID - (5 * this.wUnit), newY);
          this.foreCtx.stroke();

          this.foreCtx.fillStyle = 'black';
          this.foreCtx.fillText(String(relValue), X + (textWidth / 2) + (15 * this.wUnit), newY);
        }
      }
    }
    this.foreCtx.restore();
  }

  /* Draw little green circle that indicates the selected flap position. */
  drawFlapIndicator(): void {
    this.foreCtx.fillStyle = 'green';
    this.foreCtx.lineWidth = 1;

    let flap = this.localMemory.flap_angle;
    let adjustedY: number;
    if (flap >= 0 && flap <= 1) {
      adjustedY = (230 * this.hUnit) + (flap * (68 * this.hUnit));
    } else if (flap <= 5) {
      adjustedY = (298 * this.hUnit) + (flap * (68 * this.hUnit) / 5);
    } else if (flap <= 15) {
      adjustedY = (364 * this.hUnit) + (flap * (68 * this.hUnit) / 15);
    } else if (flap <= 25)  {
      adjustedY = (434 * this.hUnit) + (flap * (68 * this.hUnit) / 25);
    } else if (flap <= 30) {
      adjustedY = (502 * this.hUnit) + (flap * (68 * this.hUnit) / 30);
    } else if (flap <= 45) {
      adjustedY = (570 * this.hUnit) + (flap * (68 * this.hUnit) / 45);
    } else {
      adjustedY = (638 * this.hUnit);
    }
    this.foreCtx.beginPath();
    this.foreCtx.ellipse(236 * this.wUnit, adjustedY, 50 * this.wUnit, 18 * this.hUnit, 0, 0, 2 * Math.PI);
    this.foreCtx.fill();
  }

  /* Draw both throttle levers. */
  drawThrottleLever(X, Y, WID, HEI, THROTTLE): void {
    let angle = (THROTTLE * Math.PI) / 180;
    if (angle < 0 || angle === null) {
      angle = 0;
    }
    angle -= Math.PI / 2;
    this.foreCtx.save();
    this.foreCtx.translate(X, Y);
    this.foreCtx.rotate(angle);
    X = 0;
    Y = 0;

    this.foreCtx.fillStyle = 'black';
    this.foreCtx.strokeStyle = 'black';
    this.foreCtx.lineWidth = 1;


    this.foreCtx.fillRect(X - (WID / 4), Y, (2 * WID / 4), -3.5 * HEI);
    this.foreCtx.fillRect(X  - (WID / 4), Y - (3.5 * HEI), (3.5 * WID / 4), -9 * this.hUnit);

    this.foreCtx.lineWidth = 2;
    this.foreCtx.fillStyle = 'white';

    this.foreCtx.beginPath();
    this.foreCtx.ellipse(X, Y, WID, HEI, 0, 0, 2 * Math.PI);
    this.foreCtx.stroke();
    this.foreCtx.fill();

    this.foreCtx.fillStyle = 'black';

    this.foreCtx.beginPath();
    this.foreCtx.ellipse(X, Y, WID / 2, HEI / 2, 0, 0, 2 * Math.PI);
    this.foreCtx.stroke();
    this.foreCtx.fill();

    this.foreCtx.lineWidth = 1;

    this.foreCtx.beginPath();
    this.foreCtx.moveTo(X, Y - (WID / 2));
    this.foreCtx.lineTo(X, Y - WID);
    this.foreCtx.stroke();

    this.foreCtx.restore();
  }

  /* Function that  is called everytime window is resized. */
  onResize(event) {
    this.calculateProportions();
    this.render();
  }

  /* In order to determine the new height and widths, this function is
   * called each time the page resizes. */
  calculateProportions(): void {
    this.height = this.miscDiv.nativeElement.clientHeight;
    this.width = this.miscDiv.nativeElement.clientWidth;
    this.wUnit = (0.001 * this.width);
    this.hUnit = (0.001 * this.height);

    this.backgroundCanvas.nativeElement.height = this.height;
    this.backgroundCanvas.nativeElement.width = this.width;

    this.foregroundCanvas.nativeElement.height = this.height;
    this.foregroundCanvas.nativeElement.width = this.width;
  }
}
