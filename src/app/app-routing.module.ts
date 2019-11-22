import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProcessaTurtleComponent } from './processa-turtle/processa-turtle.component';
import { HomeComponent } from './home/home.component';


const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'home', component: HomeComponent},
  { path: 'processa-turtle', component: ProcessaTurtleComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 
  routes: [
    {}
  ]
}
