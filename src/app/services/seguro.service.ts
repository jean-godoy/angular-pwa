import { OnlineOfflineService } from './online-offline.service';
import { Seguro } from './../models/Seguro';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import Dexie from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class SeguroService {

  private API_SEGUROS = 'http://localhost:9000/seguros';
  private db: Dexie;
  private table: Dexie.Table<Seguro, any> = null;

  constructor(
    private http: HttpClient,
    private onlineOfflineService: OnlineOfflineService
  ) {
    this.ouvirStatusConexao();
    this.iniciarIndexedDb();
  }

  /**
   * Inicializa a conexao com a DB local
   */
  private iniciarIndexedDb(): void {
    this.db = new Dexie('db_seguros');
    this.db.version(1).stores({
      seguro: 'id'
    });
    this.table = this.db.table('seguro');
  }
  private salvarAPI(seguro: Seguro): void {
    this.http.post(this.API_SEGUROS, seguro)
      .subscribe(
        () => alert('Seguro cadastrado com susseco'),
        (err) => console.log('Erro ao cadastrar seguro..')
      );
  }

  private async salvarIndexedDb(seguro: Seguro) {
    try {
      await this.table.add(seguro);
      const todosSeguros: Seguro[] = await this.table.toArray();
      console.log('Seguro salvo no IndexedDb', todosSeguros);
    } catch (error) {
      console.log('Erro ao incluir seguro no Indexeddb..', error);
    }
  }

  private async enviarIndexedDbParaApi() {
    const todosSeguros: Seguro[] = await this.table.toArray();

    for(const seguro of todosSeguros) {
      this.salvarAPI(seguro);
      this.table.delete(seguro.id);
      console.log(`Seguro com o id ${seguro.id} foi excuido com sucesso!`);
    }
  }

  cadastrar(seguro: Seguro): void {
    if (this.onlineOfflineService.isOnline) {
      this.salvarAPI(seguro);
    } else {
      this.salvarIndexedDb(seguro);
    }
  }

  listar(): Observable<Seguro[]> {
    return this.http.get<Seguro[]>(this.API_SEGUROS);
  }

  private ouvirStatusConexao() {
    this.onlineOfflineService.statusConnect.subscribe(
      online => {
        if (online) {
          this.enviarIndexedDbParaApi();
        } else {
          console.log('estou offline')
        }
      }
    )
  }
}
