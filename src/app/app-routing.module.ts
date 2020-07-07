import { InfoComponent } from './info/info.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SimulateComponent } from './simulate/simulate.component';
import { InitializeComponent } from './initialize/initialize.component';
import { HomeComponent } from './home/home.component';


const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'initialize', component: InitializeComponent},
  { path: 'simulate', component: SimulateComponent},
  { path: 'info', component: InfoComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [InitializeComponent, SimulateComponent, HomeComponent, InfoComponent];
