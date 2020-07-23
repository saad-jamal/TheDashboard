import { OptionsSharingService } from './../../data-sharing/options-sharing.service';
import { SimulateService } from './../../simulate.service';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnChanges, Input } from '@angular/core';
import { Disk } from '../../interfaces/disk';
import { HtmlAstPath } from '@angular/compiler';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css']
})
/**
 * This class represents the small box to the bottom left, it houses
 * various options and settings features for running play-back.
 *
 * @author Saad Jamal
 */
export class OptionsComponent implements OnInit, AfterViewInit {

  /* Div element encapsulating the video component. */
  @ViewChild('vidDiv') vidDiv: ElementRef<HTMLDivElement>;

  /* The HTML Ref video component. */
  @ViewChild('vid') vid: ElementRef<HTMLVideoElement>;

  /* The text input of vid offset. */
  @ViewChild('vidOffset') vidOffset: ElementRef<HTMLInputElement>;

  /* Vid Offset Value */
  private vidOffsetVal: number;

  /* The text input of sim offset. */
  @ViewChild('simOffset') simOffset: ElementRef<HTMLInputElement>;

  /* Sim Offset Value */
  private simOffsetVal: number;

  /* Source of Video. */
  public vidSource: string;

  /* Disk info containing expirement and video file names. */
  public diskInfo: Disk;

  /* Error Message. */
  public errorMsg: any;

  /* True if the vid div should be displayed. False otherwise. */
  public displayVideo: boolean;

  /* True if the settings div should be displayed. False otherwise. */
  public displaySettings: boolean;

  /* True if the audio is not mute. */
  public audioActive: boolean;

  /* True if vid should be currently playing. */
  private videoPlaying: boolean;

  constructor(private simService: SimulateService,
              private optionsService: OptionsSharingService) {
    this.displayVideo = false;
    this.displaySettings = false;
    this.vidSource = '';
    this.videoPlaying = false;
    this.audioActive = true;

    this.simOffsetVal = 0;
    this.vidOffsetVal = 0;
  }

  ngOnInit(): void {
    this.simService.getDiskInfo()
      .subscribe(data => (this.diskInfo = data),
        error => this.errorMsg = error,
        () => {
          this.vidSource = 'assets/video/' + this.diskInfo.videoName + '.mp4';
          console.log('Video Loaded: ' + this.vidSource);
        });
  }

  ngAfterViewInit(): void {
    this.vid.nativeElement.insertAdjacentHTML('beforeend', '<source src=\''
    + this.vidSource + '\' type=\'video/mp4\'>');

    this.optionsService.currentStatus.subscribe(memory => {
      if (memory) {
        this.vid.nativeElement.play();
      } else {
        this.vid.nativeElement.pause();
      }
    });

    this.optionsService.currentTime.subscribe(memory => {
      this.vid.nativeElement.currentTime = memory;
    });

    this.optionsService.currentSimOffset.subscribe(memory => {
      this.simOffsetVal = memory;
      this.simOffset.nativeElement.value = this.simOffsetVal.toFixed(2);
    })

    this.simOffset.nativeElement.value = this.simOffsetVal.toFixed(2);
    this.vidOffset.nativeElement.value = this.vidOffsetVal.toFixed(2);
  }

  displayVidDiv(): void {
    this.displayVideo = !this.displayVideo;

    this.simOffset.nativeElement.value = this.simOffsetVal.toFixed(2);
    this.vidOffset.nativeElement.value = this.vidOffsetVal.toFixed(2);
  }

  displaySettingsDiv(): void {
    this.displaySettings = !this.displaySettings;
  }

  submitSettings(): void {
    this.simOffsetVal = parseFloat(this.simOffset.nativeElement.value);
    this.vidOffsetVal = parseFloat(this.vidOffset.nativeElement.value);

    if (this.simOffsetVal < 0) {
      this.simOffsetVal = 0;
    }
    if (this.vidOffsetVal < 0) {
      this.vidOffsetVal = 0;
    }

    this.simOffset.nativeElement.value = this.simOffsetVal.toFixed(2);
    this.vidOffset.nativeElement.value = this.vidOffsetVal.toFixed(2);

    this.optionsService.changeSimOffset(this.simOffsetVal);
  }

  toggleAudio(): void {
    this.audioActive = !this.audioActive;
    this.vid.nativeElement.muted = !this.audioActive;
  }
}
