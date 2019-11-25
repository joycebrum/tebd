import { UriInformationService } from './../uri-information.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms'
import { Tripla } from '../objects/tripla'
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
@Component({
  selector: 'app-processa-turtle',
  templateUrl: './processa-turtle.component.html',
  styleUrls: ['./processa-turtle.component.scss'],
  providers: [ UriInformationService ]
})
export class ProcessaTurtleComponent implements OnInit {
  formGroup: FormGroup
  private get turtleText() {return this.formGroup.get('turtleText')}
  prefixos: Map<string, string> = new Map<string, string>()
  triplas: Tripla[] = []
  tipos;
  textoInicial = `PREFIX ex: <http://example.com/>
  PREFIX dbr: <https://dbpedia.org/resource/>
  PREFIX dbo: <https://dbpedia.org/ontology/>
  PREFIX foaf: <https://xmlns.com/foaf/0.1/>
  
    ex:Jhonatan rdf:type foaf:Person.
    ex:Camila a foaf:Person.
      ex:Joyce a foaf:Person; foaf:knows ex:Thiago, ex:Camila, ex:Jhonatan.
      ex:Thiago a foaf:Person; rdf:type foaf:Person foaf:knows ex:Thiago, ex:Joyce.
      ex:Thiago foaf:knows dbr:Angelina_Napolitano.`

  tiposInicializadosSubject = new BehaviorSubject<number>(1);
  tiposInicializados$ = this.tiposInicializadosSubject.asObservable();
  relacoesSemanticas$ = this.tiposInicializados$.pipe(map((num)=> {
    let relacoesSemanticas = new Map<string, any[]>()
    if (num === 0) {
      this.triplas.forEach((tripla) => {
        if(tripla.predicado === 'a' || tripla.predicado === 'rdf:type') {
          return;
        }
        if (!relacoesSemanticas.has(this.tipos[tripla.sujeito])) {
          relacoesSemanticas.set(this.tipos[tripla.sujeito], [])
        } 
        if (!this.tipos[tripla.objeto]) {
          this.tipos[tripla.objeto] = 'não foi possível deduzir o tipo'
        }
        if (!relacoesSemanticas.get(this.tipos[tripla.sujeito]).find((obj) => obj.predicado === tripla.predicado && obj.class === this.tipos[tripla.objeto]))
          relacoesSemanticas.get(this.tipos[tripla.sujeito]).push({predicado: tripla.predicado, class: this.tipos[tripla.objeto]})
      })
    }
    return relacoesSemanticas;
  }));
  
  constructor(private formBuilder: FormBuilder,
              private uriInfo: UriInformationService) { 
  }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      turtleText: this.textoInicial
    })
    this.uriInfo.testConnection2().subscribe((rsp)=> console.log(rsp))
    
  }

  processar() {
    //debugger
    this.prefixos.clear()
    const rows: string[] = this.turtleText.value.split('\n');
    for (let row of rows) {
      if (row.length == 0) {
        continue;
      }
      if (row.toLocaleLowerCase().trim().startsWith('prefix')) {
        this.adicionaPrefixo(row.trim())
      } else {
        this.updateTriplas(row)
      }
    }

    this.updateRelacoesSemanticas()
  }
  updateRelacoesSemanticas() {
    this.tipos = {}
    this.tiposInicializadosSubject.next(1)
    this.triplas.forEach((tripla) => {
      tripla.updateUri(this.prefixos)
      if (tripla.predicado === 'a' || tripla.predicado === 'rdf:type') {
        this.tipos[tripla.sujeito] = tripla.objeto
      }
    })
    this.triplas.forEach((tripla) => {
      if (!this.tipos[tripla.sujeito]) {
        this.tiposInicializadosSubject.next(this.tiposInicializadosSubject.getValue() + 1)
        this.uriInfo.getType(this.prefixos, tripla.sujeito).subscribe((resp) => {
          this.tiposInicializadosSubject.next(this.tiposInicializadosSubject.getValue() - 1)
          if(resp && resp.results && resp.results.bindings && resp.results.bindings.length > 0) {
              this.tipos[tripla.sujeito] = resp.results.bindings[0].tipo.value;
          }
        })
      }
      if (!this.tipos[tripla.objeto]) {
        this.tiposInicializadosSubject.next(this.tiposInicializadosSubject.getValue() + 1)
        this.uriInfo.getType(this.prefixos, tripla.objeto).subscribe((resp)=> {
          this.tiposInicializadosSubject.next(this.tiposInicializadosSubject.getValue() - 1)
          if(resp && resp.results && resp.results.bindings && resp.results.bindings.length > 0) {
            this.tipos[tripla.objeto] = resp.results.bindings[0].tipo.value;
          }
        })
      }
    })
    this.tiposInicializadosSubject.next(this.tiposInicializadosSubject.getValue() - 1)
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
    this.prefixos.set(assoc[0].trim(), assoc[1].trim());
  }
  private updateTriplas(row) {
    const termos: string[] = row.split(' ').map((termo) => termo.trim()).filter((str) => str.length > 0)
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
        tripla.objeto = termos[i].substr(0, termos[i].length - 1).trim()
      } else if (termos[i].charAt(termos[i].length - 1) == ';') {
        mesmoPredicado = false
        mesmoSujeito = true
        tripla.objeto = termos[i].substr(0, termos[i].length - 1).trim()
      } else if (termos[i].charAt(termos[i].length - 1) == '.') {
        mesmoPredicado = false
        mesmoSujeito = false
        tripla.objeto = termos[i].substr(0, termos[i].length - 1).trim()
      } else {
        tripla.objeto = termos[i]
      }
      this.triplas.push(tripla)
      i++
    }
  }


}