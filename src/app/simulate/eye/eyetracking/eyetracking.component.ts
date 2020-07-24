import { EyeSharingService } from './../../data-sharing/eye-sharing.service';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { EyeMemory } from './eye-memory';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-eyetracking',
  templateUrl: './eyetracking.component.html',
  styleUrls: ['./eyetracking.component.css']
})
/**
 * This class handles drawing the eye-tracking fixations. It is
 * situated on top of all other components, except for the controller,
 * and draws circles representing a fixation. If Linear Fixations is
 * selected true, from the settings menu, the fixation is drawn every
 * twentieth of a second. Relies on HTML Canvas.
 * 
 * @author Saad Jamal
 */
export class EyetrackingComponent implements AfterViewInit {

  /* Div element encapsulating this component. */
  @ViewChild('eyeDiv') eyeDiv: ElementRef<HTMLDivElement>;

  /* Height of the div excluding borders. */
  private height: number;

  /* Width of the div excluding borders. */
  private width: number;

  /* Canvas element drawing the fixations. */
  @ViewChild('eyeCanvas', { static: true })
  eyeCanvas: ElementRef<HTMLCanvasElement>;

  /* Ctx element used for eye tracking animations. */
  private eyeCtx: CanvasRenderingContext2D;

  /* A singular standardized unit of pixels that scales with the
   * width of screen. It is equal to 1/1000th of the component width. */
  private wUnit: number;

  /* A singular standardized unit of pixels that scales with the height of
   * the screen. It is equal to 1/1000th of the component height. */
  private hUnit: number;

  /* An object that stores all the sim data needed to render this
   * component. */
  public localMemory: EyeMemory;

  /* Stores OTW Information. */
  public otwLoc: ComponentLoc;

  /* Stores MCP Information. */
  public mcpLoc: ComponentLoc;

  /* Stores EFIS Information. */
  public efisLoc: ComponentLoc;

  /* Stores Upper EICAS Information. */
  public upperEicasLoc: ComponentLoc;

  /* Stores Lower EICAS Information. */
  public lowerEicasLoc: ComponentLoc;

  /* Stores FMS Information. */
  public fmsLoc: ComponentLoc;

  /* Stores ND Information. */
  public ndLoc: ComponentLoc;

  /* Stores PFD Information. */
  public pfdLoc: ComponentLoc;

  /* The queue that stores the most recent to least recent fixations. */
  public queue: Fixation[];

  constructor(private sharingService: EyeSharingService) {
    // Initialize with starting memory
    this.localMemory = {
      object_being_viewed: null,
      confidence: null,
      x: null,
      y: null,
      empty_queue: false
    };
    this.queue = [];
  }

  /* The ViewChild annotations apply during the ngAfterViewInit stage. */
  ngAfterViewInit(): void {
    this.calculateProportions();

    this.eyeCtx = this.eyeCanvas.nativeElement.getContext('2d');
    this.render();

    this.sharingService.currentMemory.subscribe(memory => {
      this.localMemory = memory;
      this.render();
    });
  }

  /* Animate the component. */
  render(): void {
    this.eyeCtx.clearRect(0, 0, this.width, this.height);
    if (this.localMemory.object_being_viewed === 0 || this.localMemory.confidence < 0.85) {
      this.eyeCtx.fillStyle = 'grey';
      this.eyeCtx.strokeStyle = 'grey';
    } else {
      this.eyeCtx.fillStyle = 'red';
      this.eyeCtx.strokeStyle = 'red';
    }

    if (this.localMemory.empty_queue) {
      this.queue = [];
      return;
    }

    let newFixation: Fixation;
    newFixation = {
      id: this.localMemory.object_being_viewed,
      x: this.localMemory.x,
      y: this.localMemory.y,
      wid: this.getWid(this.localMemory.object_being_viewed),
      hei: this.getHei(this.localMemory.object_being_viewed),
      compX: this.getCompX(this.localMemory.object_being_viewed),
      compY: this.getCompY(this.localMemory.object_being_viewed)
    };

    if (newFixation.id !== 0 && this.localMemory.confidence >= 0.85) {
      this.queue.push(newFixation);
    }

    if (this.queue.length > 5) {
      // Length of fixations history is 6
      this.queue = this.queue.slice(-5);
    }

    this.drawTrackers();
  }

  /* Function that draws the trackers from the queue. */
  drawTrackers(): void {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < (this.queue.length - 1); i++) {
      const firstX = this.queue[i].compX + (this.queue[i].x * this.queue[i].wid);
      const firstY = this.queue[i].compY + (this.queue[i].y * this.queue[i].hei);

      const secondX = this.queue[i + 1].compX + (this.queue[i + 1].x * this.queue[i + 1].wid);
      const secondY = this.queue[i + 1].compY + (this.queue[i + 1].y * this.queue[i + 1].hei);

      this.eyeCtx.lineWidth = 4;
      this.eyeCtx.beginPath();
      this.eyeCtx.moveTo(firstX, firstY);
      this.eyeCtx.lineTo(secondX, secondY);
      this.eyeCtx.stroke();
    }

    this.queue.reverse();
    // tslint:disable-next-line: prefer-for-of
    let radius = 28 * this.wUnit;
    for (let i = 0; i < this.queue.length; i++) {
      if (radius < 0) {
        radius = 0;
      }
      const specX = this.queue[i].compX + (this.queue[i].x * this.queue[i].wid);
      const specY = this.queue[i].compY + (this.queue[i].y * this.queue[i].hei);

      this.eyeCtx.lineWidth = 5;
      this.eyeCtx.beginPath();
      this.eyeCtx.arc(specX, specY, radius, 0, 2 * Math.PI);
      this.eyeCtx.stroke();
      if (i === 0) {
        radius = radius * 0.6;
      } else {
        radius -= 3 * this.wUnit;
      }
    }
    this.queue.reverse();
  }

  /* Function that gets component width from id. */
  getWid(id: number): number {
    if (id === 1003) {
      return this.pfdLoc.wid;
    } else if (id === 1004) {
      return this.ndLoc.wid;
    } else if (id === 1005) {
      return this.otwLoc.wid;
    } else if (id === 1006) {
      return this.upperEicasLoc.wid;
    } else if (id === 1007) {
      return this.efisLoc.wid;
    } else if (id === 1008) {
      return this.fmsLoc.wid;
    } else if (id === 1009) {
      return this.mcpLoc.wid;
    } else if (id === 1010) {
      return this.lowerEicasLoc.wid;
    }
  }

  /* Function that gets component height from id. */
  getHei(id: number): number {
    if (id === 1003) {
      return this.pfdLoc.hei;
    } else if (id === 1004) {
      return this.ndLoc.hei;
    } else if (id === 1005) {
      return this.otwLoc.hei;
    } else if (id === 1006) {
      return this.upperEicasLoc.hei;
    } else if (id === 1007) {
      return this.efisLoc.hei;
    } else if (id === 1008) {
      return this.fmsLoc.hei;
    } else if (id === 1009) {
      return this.mcpLoc.hei;
    } else if (id === 1010) {
      return this.lowerEicasLoc.hei;
    }
  }

  /* Function that gets component starting X from id. */
  getCompX(id: number): number {
    if (id === 1003) {
      return this.pfdLoc.x;
    } else if (id === 1004) {
      return this.ndLoc.x;
    } else if (id === 1005) {
      return this.otwLoc.x;
    } else if (id === 1006) {
      return this.upperEicasLoc.x;
    } else if (id === 1007) {
      return this.efisLoc.x;
    } else if (id === 1008) {
      return this.fmsLoc.x;
    } else if (id === 1009) {
      return this.mcpLoc.x;
    } else if (id === 1010) {
      return this.lowerEicasLoc.x;
    }
  }

  /* Function that gets component starting Y from id. */
  getCompY(id: number): number {
    if (id === 1003) {
      return this.pfdLoc.y;
    } else if (id === 1004) {
      return this.ndLoc.y;
    } else if (id === 1005) {
      return this.otwLoc.y;
    } else if (id === 1006) {
      return this.upperEicasLoc.y;
    } else if (id === 1007) {
      return this.efisLoc.y;
    } else if (id === 1008) {
      return this.fmsLoc.y;
    } else if (id === 1009) {
      return this.mcpLoc.y;
    } else if (id === 1010) {
      return this.lowerEicasLoc.y;
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
    this.height = this.eyeDiv.nativeElement.clientHeight;
    this.width = this.eyeDiv.nativeElement.clientWidth;
    this.wUnit = (0.001 * this.width);
    this.hUnit = (0.001 * this.height);

    this.eyeCanvas.nativeElement.height = this.height;
    this.eyeCanvas.nativeElement.width = this.width;

    this.assignComponentLocations();
  }

  /* Assigns the various component locations. */
  assignComponentLocations(): void {
    this.otwLoc = {
      x: 6 * this.wUnit,
      y: 7.5 * this.hUnit,
      wid: 849 * this.wUnit,
      hei: 178 * this.hUnit
    };

    this.mcpLoc = {
      x: 6 * this.wUnit,
      y: 206 * this.hUnit,
      wid: 808 * this.wUnit,
      hei: 186 * this.hUnit
    };

    this.efisLoc = {
      x: 820 * this.wUnit,
      y: 206 * this.hUnit,
      wid: 174 * this.wUnit,
      hei: 185 * this.hUnit
    };

    this.upperEicasLoc = {
      x: 6 * this.wUnit,
      y: 411 * this.hUnit,
      wid: 183 * this.wUnit,
      hei: 286 * this.hUnit
    };

    this.lowerEicasLoc = {
      x: 6 * this.wUnit,
      y: 705 * this.hUnit,
      wid: 183 * this.wUnit,
      hei: 284 * this.hUnit
    };

    this.fmsLoc = {
      x: 206.5 * this.wUnit,
      y: 582 * this.hUnit,
      wid: 162 * this.wUnit,
      hei: 408 * this.hUnit
    };

    this.ndLoc = {
      x: 386 * this.wUnit,
      y: 414 * this.hUnit,
      wid: 301 * this.wUnit,
      hei: 463 * this.hUnit
    };

    this.pfdLoc = {
      x: 693 * this.wUnit,
      y: 414 * this.hUnit,
      wid: 301 * this.wUnit,
      hei: 463 * this.hUnit
    };
  }
}

/* This interface is used to store data about the locations of
 * various components. */
interface ComponentLoc {
  x: number;
  y: number;
  wid: number;
  hei: number;
}

/* This interface is used to track previous fixations. */
interface Fixation {
  id: number;
  x: number;
  y: number;
  wid: number;
  hei: number;
  compX: number;
  compY: number;
}