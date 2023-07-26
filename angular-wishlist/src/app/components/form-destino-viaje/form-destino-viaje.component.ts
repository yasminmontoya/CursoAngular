import { Component, OnInit, Output, EventEmitter, Inject, forwardRef } from '@angular/core';
import { DestinoViaje } from '../../models/destino-viaje.model';
import { FormGroup, FormBuilder, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { fromEvent } from 'rxjs';
import { map, filter, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { AppConfig, APP_CONFIG } from 'src/app/app.module';

@Component({
  selector: 'app-form-destino-viaje',
  templateUrl: './form-destino-viaje.component.html',
  styleUrls: ['./form-destino-viaje.component.css']
})
export class FormDestinoViajeComponent implements OnInit {
  @Output() onItemAdded: EventEmitter<DestinoViaje>;
  fg: FormGroup;
  minLongitud = 3;
  searchResults: string[] = [];
  searchResults2:any;

  constructor(
    fb: FormBuilder,
    @Inject(forwardRef(() => APP_CONFIG)) private config: AppConfig
  ) {
    this.onItemAdded = new EventEmitter();
    this.fg = fb.group({
      nombre: [
        '',
        Validators.compose([
          Validators.required,
          //this.nombreValidator,
          //this.nombreValidatorParametrizable(this.minLongitud),
        ]),
      ],
      url: [''],
    });

    this.fg.valueChanges.subscribe((form: any) => {
      console.log('cambio en el formulario', form);
    });
  }

  ngOnInit(): void {
    let elemNombre = <HTMLInputElement>document.getElementById('nombre');
    const keys = fromEvent<KeyboardEvent>(elemNombre, 'input');

    keys
      .pipe(
        map((e: KeyboardEvent) => (e.target as HTMLInputElement).value),
        filter((text) => text.length > 2),
        debounceTime(120),
        distinctUntilChanged(),
        switchMap((text: string) =>
          ajax(this.config.apiEndpoint + '/ciudades?q=' + text)
        )
      )
      .subscribe(
        (ajaxResponse) => (this.searchResults2 = ajaxResponse.response)
      );
  }

  guardar(nombre: string, url: string): boolean {
    const d = new DestinoViaje(nombre, url);
    this.onItemAdded.emit(d);
    return false;
  }

  nombreValidator(control: FormControl): { [s: string]: boolean } {
    const longitud = control.value.toString().trim().length;
    if (longitud > 0 && longitud < 5) {
      return { invalidNombre: true };
    }
    return { null: false };
  }

  nombreValidatorParametrizable(minLong: number): ValidatorFn {
    return (control: AbstractControl): { [s: string]: boolean } | null => {
      const longitud = control.value.toString().trim().length;
      if (longitud > 0 && longitud < minLong) {
        return { minLongNombre: true };
      }
      return { null: false };
    };
  }
}

