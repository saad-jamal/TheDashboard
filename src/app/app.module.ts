import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
