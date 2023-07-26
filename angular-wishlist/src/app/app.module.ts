import { APP_INITIALIZER, Injectable, InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes} from '@angular/router';
import { AppComponent } from './app.component';
import { DestinoViajeComponent } from './components/destino-viaje/destino-viaje.component';
import { ListaDestinosComponent } from './components/lista-destinos/lista-destinos.component';
import { DestinoDetalleComponent } from './components/destino-detalle/destino-detalle.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormDestinoViajeComponent } from './components/form-destino-viaje/form-destino-viaje.component';
import { DestinosViajesEffects, DestinosViajesState, initializeDestinosViajesState, InitMyDataAction, reducerDestinosViajes } from './models/destinos-viajes-state.model';
import { ActionReducerMap, Store, StoreModule as NgRxStoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { LoginComponent } from './components/login/login/login.component';
import { ProtectedComponent } from './components/protected/protected/protected.component';
import { UsuarioLogueadoGuard } from './guards/usuario-logueado/usuario-logueado.guard';
import { AuthService } from './services/auth.service';
import { VuelosComponentComponent } from './components/vuelos/vuelos-component/vuelos-component.component';
import { VuelosMainComponentComponent } from './components/vuelos/vuelos-main-component/vuelos-main-component.component';
import { VuelosMasInfoComponentComponent } from './components/vuelos/vuelos-mas-info-component/vuelos-mas-info-component.component';
import { VuelosDetalleComponentComponent } from './components/vuelos/vuelos-detalle-component/vuelos-detalle-component.component';
import { ReservasModule } from './reservas/reservas.module';
import { HttpClient, HttpClientModule, HttpHeaders, HttpRequest } from '@angular/common/http';
import Dexie from 'dexie';
import { TranslateModule } from '@ngx-translate/core';
import { DestinoViaje } from './models/destino-viaje.model';
import { TranslateLoader } from '@ngx-translate/core';
import { from, Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMapboxGLModule, MAPBOX_API_KEY } from 'ngx-mapbox-gl';
import { EspiameDirective } from './espiame.directive';
import { TrackearClickDirective } from './trackear-click.directive';

// app config

export interface AppConfig {
  apiEndpoint: string;
}

const APP_CONFIG_VALUE: AppConfig = {
  apiEndpoint: 'http://localhost:3000'
};

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');

//fin app config

//init routing
export const childrenRoutesVuelos: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: 'main', component: VuelosMainComponentComponent },
  { path: 'mas-info', component: VuelosMasInfoComponentComponent },
  { path: ':id', component: VuelosDetalleComponentComponent }
];

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: ListaDestinosComponent },
  { path: 'destino/:id', component: DestinoDetalleComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'protected',
    component: ProtectedComponent,
    canActivate: [ UsuarioLogueadoGuard ]
  },
  {
    path: 'vuelos',
    component: VuelosComponentComponent,
    canActivate: [ UsuarioLogueadoGuard ],
    children: childrenRoutesVuelos
  }
];

//fin routing

//redux init

export interface AppState {
  destinos: DestinosViajesState;
}

export const reducers: ActionReducerMap<AppState> = {
  destinos: reducerDestinosViajes as any    //ERROR: no compila con reducerDestinosViajes
}

const reducersInitialState = {
  destinos: initializeDestinosViajesState()
}

//redux fin init

//app init

export function init_app(appLoadService: AppLoadService): () => Promise<any> {
  return () => appLoadService.initializeDestinosViajesState();
}

@Injectable()
class AppLoadService {
  constructor(private store: Store<AppState>, private http: HttpClient){}
    async initializeDestinosViajesState(): Promise<any> {
      const headers: HttpHeaders = new HttpHeaders({ 'X-API-TOKEN': 'token-seguridad' });
      const req = new HttpRequest('GET', APP_CONFIG_VALUE.apiEndpoint + '/my', { headers: headers});
      const response: any = await this.http.request(req).toPromise();
      this.store.dispatch(new InitMyDataAction(response.body));
    }
}

//fin app init

// inicio dexie db
export class Translation {
  constructor(public id: number, public lang: string, public key: string, public value: string){}
}

@Injectable({
  providedIn: 'root'
})

export class MyDatabase extends Dexie {
  destinos!: Dexie.Table<DestinoViaje, number>;
  translations!: Dexie.Table<Translation, number>;
  constructor() {
    super('MyDatabase');
    this.version(1).stores({
      destinos: '++id, nombre, imagenUrl'
    });
    this.version(2).stores({
      destinos: '++id, nombre, imagenUrl',
      translations: '++id, lang, key, value'
    });
  }
}

export const db = new MyDatabase();

//fin dexie db

//inicio i18n

class TranslationLoader implements TranslateLoader{
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    const promise = db.translations
                      .where('lang')
                      .equals(lang)
                      .toArray()
                      .then((results: string | any[]) => {
                        if(results.length === 0){
                          return this.http
                            .get<Translation[]>(APP_CONFIG_VALUE.apiEndpoint + '/api/translation?lang=' + lang)
                            .toPromise()
                            .then(apiResults => {
                              //db.translations.bulkAdd(apiResults);
                              return apiResults;
                            });
                        }
                        return results;
                      }).then((traducciones: any) => {
                        console.log('traducciones cargadas: ');
                        console.log(traducciones);
                        return traducciones;
                      }).then((traducciones: any[]) => {
                        return traducciones.map((t) => ({ [t.key]: t.value}));
                      });
    return from(promise).pipe(flatMap((elems) => from(elems)));
  }
}

function HttpLoaderFactory(http: HttpClient) {
  return new TranslationLoader(http);
}


//fin i18n

export interface IMyLibMapModuleConfig {
  mapboxToken: string;
}

@NgModule({
  declarations: [
    AppComponent,
    DestinoViajeComponent,
    ListaDestinosComponent,
    DestinoDetalleComponent,
    FormDestinoViajeComponent,
    LoginComponent,
    ProtectedComponent,
    VuelosComponentComponent,
    VuelosMainComponentComponent,
    VuelosMasInfoComponentComponent,
    VuelosDetalleComponentComponent,
    EspiameDirective,
    TrackearClickDirective,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    NgRxStoreModule.forRoot((reducers) as any, { initialState: reducersInitialState }),
    EffectsModule.forRoot([DestinosViajesEffects]),
    ReservasModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    }),
    NgxMapboxGLModule,
    BrowserAnimationsModule
  ],
  providers: [
    AuthService,
    UsuarioLogueadoGuard,
    AppLoadService,
    MyDatabase,
    { provide: APP_CONFIG, useValue: APP_CONFIG_VALUE },
    { provide: APP_INITIALIZER, useFactory: init_app, deps: [AppLoadService], multi: true }
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
