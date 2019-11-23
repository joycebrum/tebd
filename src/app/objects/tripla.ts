
export class Tripla {
    sujeito: string;
    predicado: string;
    objeto: string;
    type: string;

    sujeitoUri: string;
    objetoUri: string

    constructor() {}

    updateUri(prefixos) {
        let prefixo = this.sujeito.split(':').length > 1 ? this.sujeito.split(':')[0] : ''
        let sufixo = this.sujeito.split(':').length > 1 ? this.sujeito.split(':')[1] : this.sujeito
        this.sujeitoUri = prefixos[prefixo] + sufixo
        prefixo = this.objeto.split(':').length > 1 ? this.objeto.split(':')[0] : ''
        sufixo = this.objeto.split(':').length > 1 ? this.objeto.split(':')[1] : this.sujeito
        this.objetoUri = prefixos[prefixo] + sufixo
    }
}