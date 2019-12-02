import { UriInformationService } from './../uri-information.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms'
import { Tripla } from '../objects/tripla'
import { BehaviorSubject, Observable } from 'rxjs';
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
  
  mesmoSujeito = false
  mesmoPredicado = false
  triplaAnterior = new Tripla()
  relacoesSemanticas$: Observable<Map<string, any[]>> = this.tiposInicializados$.pipe(map((num)=> {
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

  nodes$ = this.relacoesSemanticas$.pipe(map((relacoes) => {
    const nodes = []
    if (relacoes) {
      relacoes.forEach((value, key) => {
        if (!nodes.find((node) => node.id == key)) {
          nodes.push({id: key, label: key})
        }
        if (value) {
          value.forEach((element) => {
            if(!nodes.find((node) => node.id == element.class)) {
              nodes.push({id: element.class, label: element.class})
            }
          })
        }
      });
    }
    return nodes
  }))

  links$ = this.relacoesSemanticas$.pipe(map((relacoes) => {
    const links = []
    let id = 'a'
    if (relacoes) {
      relacoes.forEach((value, key) => {
        if(value) {
          value.forEach((element) => {
            links.push({id: id,
            source: key,
            target: element.class,
            label: element.predicado})
          id = id + 'a'
          })
        }
      })
    }
    return links
  }))
  
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
    this.mesmoSujeito = false
    this.mesmoPredicado = false
    this.triplas = []
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
      } else if (tripla.objeto.endsWith("^xsd:integer")) {
        this.tipos[tripla.objeto] = "integer"
      } else if (tripla.objeto.endsWith("^xsd:string")) {
        this.tipos[tripla.objeto] = "string"
      } else if (tripla.objeto.startsWith("\"")) {
        this.tipos[tripla.objeto] = "literal"
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
        }, 
        (error) => this.tiposInicializadosSubject.next(this.tiposInicializadosSubject.getValue() - 1))
      }
      if (!this.tipos[tripla.objeto]) {
        this.tiposInicializadosSubject.next(this.tiposInicializadosSubject.getValue() + 1)
        this.uriInfo.getType(this.prefixos, tripla.objeto).subscribe((resp)=> {
          this.tiposInicializadosSubject.next(this.tiposInicializadosSubject.getValue() - 1)
          if(resp && resp.results && resp.results.bindings && resp.results.bindings.length > 0) {
            this.tipos[tripla.objeto] = resp.results.bindings[0].tipo.value;
          }
        },
        (error) => this.tiposInicializadosSubject.next(this.tiposInicializadosSubject.getValue() - 1))
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
    let termos: string[] = row.split(' ').map((termo) => termo.trim()).filter((str) => str.length > 0)
    termos = this.trataLiteral(termos)
    let i = 0
    while (i < termos.length){
      const tripla = new Tripla()
      if(this.mesmoSujeito) {
        tripla.sujeito = this.triplaAnterior.sujeito
      } else {
        tripla.sujeito = termos[i]
        this.triplaAnterior.sujeito = tripla.sujeito
        i++
      }
      
      if(this.mesmoPredicado) {
        tripla.predicado = this.triplaAnterior.predicado
      } else {
        tripla.predicado = termos[i]
        this.triplaAnterior.predicado = tripla.predicado
        i++
      }
      
      if (termos[i].charAt(termos[i].length - 1) == ',') {
        this.mesmoPredicado = true
        this.mesmoSujeito = true
        tripla.objeto = termos[i].substr(0, termos[i].length - 1).trim()
      } else if (termos[i].charAt(termos[i].length - 1) == ';') {
        this.mesmoPredicado = false
        this.mesmoSujeito = true
        tripla.objeto = termos[i].substr(0, termos[i].length - 1).trim()
      } else if (termos[i].charAt(termos[i].length - 1) == '.') {
        this.mesmoPredicado = false
        this.mesmoSujeito = false
        tripla.objeto = termos[i].substr(0, termos[i].length - 1).trim()
      } else {
        tripla.objeto = termos[i]
      }
      this.triplas.push(tripla)
      i++
    }
  }
  private fimLiteral(str: string): boolean {
    if (!str || str.length === 0) return false;
    if(str.charAt(str.length - 1) === '.' || str.charAt(str.length - 1) === ',' || str.charAt(str.length - 1) === ';') {
      str = str.substring(0, str.length - 1)
    }
    return str.endsWith('\"') || str.endsWith('\"^xsd:string') || str.endsWith('\"^xsd:integer')
  }
  private trataLiteral(termos: string[]) {
    const termosTratados = []
    let i = 0
    for(i = 0; i < termos.length; i++) {
      let temp = termos[i]
      if (termos[i].startsWith('\"') && !this.fimLiteral(termos[i])) {
        i = i + 1
        while(i < termos.length && !this.fimLiteral(termos[i])) {
          temp += ' '+ termos[i]
          i = i + 1
        }
        temp += ' ' + termos[i]
      }
      termosTratados.push(temp)
    }
    return termosTratados
  }
}