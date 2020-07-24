import { McpSharingService } from './simulate/data-sharing/mcp-sharing.service';
import { PfdSharingService } from './simulate/data-sharing/pfd-sharing.service';
import { NdSharingService } from './simulate/data-sharing/nd-sharing.service';
import { MiscSharingService } from './simulate/data-sharing/misc-sharing.service';
import { SimulateService } from './simulate/simulate.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { OtwComponent } from './simulate/over-dashboard/otw/otw.component';
import { NoDataComponent } from './simulate/over-dashboard/no-data/no-data.component';
import { OffAoiComponent } from './simulate/over-dashboard/off-aoi/off-aoi.component';
import { McpComponent } from './simulate/upper-dashboard/mcp/mcp.component';
import { EfisComponent } from './simulate/upper-dashboard/efis/efis.component';
import { PfdComponent } from './simulate/lower-dashboard/pfd/pfd.component';
import { NdComponent } from './simulate/lower-dashboard/nd/nd.component';
import { MiscComponent } from './simulate/side-dashboard/misc/misc.component';
import { FmsComponent } from './simulate/lower-dashboard/fms/fms.component';
import { UpperEicasComponent } from './simulate/lower-dashboard/upper-eicas/upper-eicas.component';
import { LowerEicasComponent } from './simulate/lower-dashboard/lower-eicas/lower-eicas.component';
import { NoCommaPipe } from './simulate/lower-dashboard/pfd/no-comma.pipe';
import { ComputerComponent } from './simulate/controls/computer/computer.component';
import { EyetrackingComponent } from './simulate/eye/eyetracking/eyetracking.component';


@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    OtwComponent,
    NoDataComponent,
    OffAoiComponent,
    McpComponent,
    EfisComponent,
    PfdComponent,
    NdComponent,
    MiscComponent,
    FmsComponent,
    UpperEicasComponent,
    LowerEicasComponent,
    NoCommaPipe,
    ComputerComponent,
    EyetrackingComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [SimulateService, MiscSharingService, NdSharingService,
    PfdSharingService, McpSharingService],
  bootstrap: [AppComponent]
})
export class AppModule { }
