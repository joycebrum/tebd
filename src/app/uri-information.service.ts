import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UriInformationService {

  constructor(private http: HttpClient) { }

  getInformation(prefix, end) {
    const uri = prefix + end
    return this.http.get<any>(uri);
  }

  getType(prefixos: Map<string, string>, uriReduzida) {
    let strPrefixos = ''
    prefixos.forEach((value, key) => {
      if (key !== 'dbo' && key !== 'dbr') {
        strPrefixos += 'PREFIX ' + key + ': <' + value + '>\n'
      }
    });
    const params = {
      'default-graph-uri':	'http://dbpedia.org',
      query:	`${strPrefixos} SELECT DISTINCT ?tipo WHERE { ${uriReduzida} a ?tipo. } LIMIT 100`,
      format:	'json',
      'CXML_redir_for_subjs':	'121',	
      timeout:	'30000',
      debug:	'on',
      run:	'Run Query' 
    }
    return this.http.get<any>('https://dbpedia.org/sparql', {params: params})
  }

  testConnection2() {
    const params = {
      'default-graph-uri':	'http://dbpedia.org',
      query:	'PREFIX foaf: <https://xmlns.com/foaf/0.1/> SELECT DISTINCT ?class WHERE { ?class a dbo:Person . } LIMIT 100',
      format:	'json',
      'CXML_redir_for_subjs':	'121',	
      timeout:	'30000',
      debug:	'on',
      run:	'Run Query' 
    }
    return this.http.get<any>('https://dbpedia.org/sparql', {params: params})
  }
}
