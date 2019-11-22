import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms'
import { Tripla } from '../objects/tripla'
@Component({
  selector: 'app-processa-turtle',
  templateUrl: './processa-turtle.component.html',
  styleUrls: ['./processa-turtle.component.scss']
})
export class ProcessaTurtleComponent implements OnInit {
  formGroup: FormGroup
  private get turtleText() {return this.formGroup.get('turtleText')}
  prefixos = {}
  triplas: Tripla[] = []

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      turtleText: ""
    })
  }

  processar() {
    //debugger
    const rows = this.turtleText.value.split('\n');
    for (let row of rows) {
      if (row.length == 0) {
        continue;
      }
      if (row.toLocaleLowerCase().startsWith('@prefix')) {
        this.adicionaPrefixo(row)
      } else {
        this.updateTriplas(row)
      }
    }
    console.log(this.prefixos, this.triplas) 
  }

  private cleanStringUri(str: string) {
    if (str.charAt(0) === '<' && str.charAt(str.length - 1) === '>') {
      return str.substr(1, str.length - 2)
    }
  }
  private adicionaPrefixo(row: string) {
    const clean = row.substr(7, row.length);
    const assoc = [clean.substr(0, clean.indexOf(':')).trim(), this.cleanStringUri(clean.substr(clean.indexOf(':') + 1, clean.length).trim())] ;
    if (assoc.length != 2) {
      console.log(row, 'está retornando mais do que dois em assoc');
      return;
    }
    this.prefixos[assoc[0].trim()] = assoc[1].trim();
  }
  private updateTriplas(row) {
    const termos: string[] = row.split(' ').map((termo) => termo.trim())
    let mesmoSujeito = false
    let mesmoPredicado = false
    const triplaAnterior = new Tripla()
    let i = 0
    while (i < termos.length){
      const tripla = new Tripla()
      if(mesmoSujeito) {
        tripla.sujeito = triplaAnterior.sujeito
      } else {
        tripla.sujeito = termos[i]
        triplaAnterior.sujeito = tripla.sujeito
        i++
      }
      if(mesmoPredicado) {
        tripla.predicado = triplaAnterior.predicado
      } else {
        tripla.predicado = termos[i]
        triplaAnterior.predicado = tripla.predicado
        i++
      }
      if (termos[i].charAt(termos[i].length - 1) == ',') {
        mesmoPredicado = true
        mesmoSujeito = true
        tripla.objeto = termos[i].substr(0, termos[i].length - 2).trim()
      } else if (termos[i].charAt(termos[i].length - 1) == ';') {
        mesmoPredicado = false
        mesmoSujeito = true
        tripla.objeto = termos[i].substr(0, termos[i].length - 2).trim()
      } else if (termos[i].charAt(termos[i].length - 1) == '.') {
        mesmoPredicado = false
        mesmoSujeito = false
        tripla.objeto = termos[i].substr(0, termos[i].length - 2).trim()
      } else {
        tripla.objeto = termos[i]
      }
      i++
    }
  }
}