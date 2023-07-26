import { Component, Output, EventEmitter } from '@angular/core';
import { DestinoViaje } from '../../models/destino-viaje.model';
import { DestinosApiClient } from '../../models/destinos-api-client.model';
import { ElegidoFavoritoAction, NuevoDestinoAction } from '../../models/destinos-viajes-state.model';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.module';

@Component({
  selector: 'app-lista-destinos',
  templateUrl: './lista-destinos.component.html',
  styleUrls: ['./lista-destinos.component.css'],
  providers: [DestinosApiClient]
})
export class ListaDestinosComponent {
  @Output() onItemAdded: EventEmitter<DestinoViaje>;
  updates: string[];
  all: any;

  constructor(public destinosApiClient: DestinosApiClient, private store: Store<AppState>){
    this.onItemAdded = new EventEmitter();
    this.updates= [];
    this.store.select(state => state.destinos.favorito)
      .subscribe(data => {
        const fav = data;
        if( data != null){
          this.updates.push('Se ha elegido a ' + data.nombre)
        }
      });
      store.select(state => state.destinos.items).subscribe(items => this.all = items);
  }

  agregado(d: DestinoViaje) {
    this.destinosApiClient.add(d);
    this.onItemAdded.emit(d);
  }

  elegido(e: DestinoViaje){
    this.destinosApiClient.elegir(e);
  }

  getAll(){
    return this.all;
  }

}
