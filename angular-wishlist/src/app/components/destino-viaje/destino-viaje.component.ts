import { Component, Input, HostBinding, EventEmitter, Output} from '@angular/core';
import { DestinoViaje } from '../../models/destino-viaje.model';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.module';
import { VoteUpAction,  VoteDownAction} from '../../models/destinos-viajes-state.model';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-destino-viaje',
  templateUrl: './destino-viaje.component.html',
  styleUrls: ['./destino-viaje.component.css'],
  animations: [
    trigger('esFavorito', [
      state('estadoFavorito', style({
        backgroundColor: 'PaleTurquoise'
      })),
      state('estadoNoFavorito', style({
        backgroundColor: 'WhiteSmoke'
      })),
      transition('estadoNoFavorito => estadoFavorito', [
        animate('3s')
      ]),
      transition('estadoFavorito => estadoNoFavorito', [
        animate('1s')
      ]),
    ])
  ]
})
export class DestinoViajeComponent {
  @Input() destino: DestinoViaje;
  @Input('idx') position: number;
  @HostBinding('attr.class') cssClass='col-md-4';
  @Output() clicked: EventEmitter<DestinoViaje>;

  constructor(private store: Store<AppState>){
    this.destino = new DestinoViaje("","")
    this.position = 0;
    this.clicked = new EventEmitter();
  }

  ir(){
    this.clicked.emit(this.destino)
    return false;
  }

  voteUp(){
    this.store.dispatch(new VoteUpAction(this.destino));
    return false;
  }

  voteDown(){
    this.store.dispatch(new VoteDownAction(this.destino));
    return false;
  }

}
