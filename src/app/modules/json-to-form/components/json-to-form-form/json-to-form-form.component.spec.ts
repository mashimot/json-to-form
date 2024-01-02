import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonToFormFormComponent } from './json-to-form-form.component';

describe('JsonToFormFormComponent', () => {
  let component: JsonToFormFormComponent;
  let fixture: ComponentFixture<JsonToFormFormComponent>;
  let jsonMock = {
    "adult": "nullable|boolean",
    "backdrop_path": "nullable|string",
    "belongs_to_collection": "nullable",
    "budget": "nullable|html:number|integer",
    "genres.*": {
      "id": "nullable|html:number|integer",
      "name": "nullable|html:text|min:2|max:255"
    },
    "homepage": "nullable|html:text|string",
    "id": "nullable|html:number|integer|min:2|max:25",
    "imdb_id": "nullable|string|min:9|max:9",
    "original_language": "nullable|string|min:2|max:2",
    "original_title": "nullable|string|min:2|max:255",
    "overview": "nullable|html:textarea|string|min:2|max:4000",
    "popularity": "nullable|html:number|numeric",
    "poster_path": "nullable|html:text|string",
    "production_companies.*": {
      "id": "html:number|nullable",
      "logo_path": "nullable|string",
      "name": "nullable|min:2|max:255",
      "origin_country": "nullable|min:2|max:2"
    },
    "production_countries.*": {
      "iso_3166_1": "nullable|min:2|max:2",
      "name": "nullable|min:2|max:255"
    },
    "release_date": "html:date|nullable|date_format:Y-m-d",
    "revenue": "html:number|nullable",
    "runtime": "html:number|nullable",
    "spoken_languages.*": {
      "iso_639_1": "nullable|min:2|max:2",
      "name": "nullable|min:2|max:255"
    },
    "status": [
      "nullable",
      "html:radio",
      [
        "Rumored",
        "Planned",
        "In Production",
        "Post Production",
        "Released",
        "Canceled"
      ]
    ],
    "tagline": "nullable|min:2|max:255",
    "users": {
      "first_name": "required|min:3|max:255",
      "last_name": "required|min:3|max:255",
      "email.*": "email|unique:users",
      "nickname": "nullable|min:3|max:255",
      "cars.*": {
        "model": "required|min:2",
        "year": "required|html:number|min:4|max:4",
        "value": "required|min:2|max:10"
      },
      "medications.*": {
        "medication_name": "required|min:3|max:255",
        "medication_details": "html:textarea|nullable|min:3|max:4000"
      },
      "description": "html:textarea|required|min:3|max:4000",
      "birthdate": "html:date|required"
    },
    "title": "nullable|min:2|max:255",
    "video": "nullable|boolean",
    "vote_average": "nullable|html:number|number|min:2|max:255",
    "vote_count": "nullable|html:number|integer|min:2|max:255"
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JsonToFormFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JsonToFormFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render html given a json', () => {
    const HTML = `<div class="container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <pre>{{ form.value | json }}</pre>
          <div class="form-group col-md-12">
              <label for="adult">adult</label>
              <input type="text" formControlName="adult" id="adult" class="form-control" [class.is-invalid]="isFieldValid('adult')">
              <div *ngIf="isFieldValid('adult')" class="invalid-feedback">

              </div>
          </div>
          <div class="form-group col-md-12">
              <label for="backdrop_path">backdrop_path</label>
              <input type="text" formControlName="backdrop_path" id="backdrop_path" class="form-control" [class.is-invalid]="isFieldValid('backdrop_path')">
              <div *ngIf="isFieldValid('backdrop_path')" class="invalid-feedback">

              </div>
          </div>
          <div class="form-group col-md-12">
              <label for="belongs_to_collection">belongs_to_collection</label>
              <input type="text" formControlName="belongs_to_collection" id="belongs_to_collection" class="form-control" [class.is-invalid]="isFieldValid('belongs_to_collection')">
              <div *ngIf="isFieldValid('belongs_to_collection')" class="invalid-feedback">

              </div>
          </div>
          <div class="form-group col-md-12">
              <label for="budget">budget</label>
              <input type="number" formControlName="budget" id="budget" class="form-control" [class.is-invalid]="isFieldValid('budget')">
              <div *ngIf="isFieldValid('budget')" class="invalid-feedback">

              </div>
          </div>
          <fieldset formArrayName="genres" class="border border-dark p-1">
              <pre>{{ getGenres().errors | json }}</pre>
              <div class="btn-group">
                  <button type="button" class="btn btn-primary btn-block btn-sm" (click)="getGenres().push(createGenres())">ADD Genres</button>
              </div>
              <div *ngFor="let Genres1Data of getGenres().controls; let indexGenres = index;" class="border border-dark p-1" [formGroupName]="indexGenres">
                  <div class="btn-group">
                      <button type="button" class="btn btn-danger btn-sm" (click)="deleteGenres(indexGenres)">DELETE Genres</button>
                  </div>
                  <div class="form-group col-md-12">
                      <label for="id">genres.*.id</label>
                      <input type="number" formControlName="id" id="genres.*.id" class="form-control" [class.is-invalid]="!getGenres().at(indexGenres).get('id')?.valid">
                      <div *ngIf="!getGenres().at(indexGenres).get('id')?.valid" class="invalid-feedback">

                      </div>
                  </div>
                  <div class="form-group col-md-12">
                      <label for="name">genres.*.name</label>
                      <input type="text" formControlName="name" id="genres.*.name" class="form-control" [class.is-invalid]="!getGenres().at(indexGenres).get('name')?.valid">
                      <div *ngIf="!getGenres().at(indexGenres).get('name')?.valid" class="invalid-feedback">
                          <div *ngIf="getGenres().at(indexGenres).get('name')!.hasError('minlength')">GENRES.*.NAME min must be 2</div>
                          <div *ngIf="getGenres().at(indexGenres).get('name')!.hasError('maxlength')">GENRES.*.NAME max must be 255</div>
                      </div>
                  </div>
              </div>
          </fieldset>
          <div class="form-group col-md-12">
              <label for="homepage">homepage</label>
              <input type="text" formControlName="homepage" id="homepage" class="form-control" [class.is-invalid]="isFieldValid('homepage')">
              <div *ngIf="isFieldValid('homepage')" class="invalid-feedback">

              </div>
          </div>
          <div class="form-group col-md-12">
              <label for="id">id</label>
              <input type="number" formControlName="id" id="id" class="form-control" [class.is-invalid]="isFieldValid('id')">
              <div *ngIf="isFieldValid('id')" class="invalid-feedback">
                  <div *ngIf="getField('id')!.hasError('minlength')">ID min must be 2</div>
                  <div *ngIf="getField('id')!.hasError('maxlength')">ID max must be 25</div>
              </div>
          </div>
          <div class="form-group col-md-12">
              <label for="imdb_id">imdb_id</label>
              <input type="text" formControlName="imdb_id" id="imdb_id" class="form-control" [class.is-invalid]="isFieldValid('imdb_id')">
              <div *ngIf="isFieldValid('imdb_id')" class="invalid-feedback">
                  <div *ngIf="getField('imdb_id')!.hasError('minlength')">IMDB_ID min must be 9</div>
                  <div *ngIf="getField('imdb_id')!.hasError('maxlength')">IMDB_ID max must be 9</div>
              </div>
          </div>
          <div class="form-group col-md-12">
              <label for="original_language">original_language</label>
              <input type="text" formControlName="original_language" id="original_language" class="form-control" [class.is-invalid]="isFieldValid('original_language')">
              <div *ngIf="isFieldValid('original_language')" class="invalid-feedback">
                  <div *ngIf="getField('original_language')!.hasError('minlength')">ORIGINAL_LANGUAGE min must be 2</div>
                  <div *ngIf="getField('original_language')!.hasError('maxlength')">ORIGINAL_LANGUAGE max must be 2</div>
              </div>
          </div>
          <div class="form-group col-md-12">
              <label for="original_title">original_title</label>
              <input type="text" formControlName="original_title" id="original_title" class="form-control" [class.is-invalid]="isFieldValid('original_title')">
              <div *ngIf="isFieldValid('original_title')" class="invalid-feedback">
                  <div *ngIf="getField('original_title')!.hasError('minlength')">ORIGINAL_TITLE min must be 2</div>
                  <div *ngIf="getField('original_title')!.hasError('maxlength')">ORIGINAL_TITLE max must be 255</div>
              </div>
          </div>
          <div class="form-group col-md-12">
              <label for="overview">overview</label>
              <textarea formControlName="overview" id="overview" class="form-control" cols="30" rows="10" [class.is-invalid]="isFieldValid('overview')"></textarea>
              <div *ngIf="isFieldValid('overview')" class="invalid-feedback">
                  <div *ngIf="getField('overview')!.hasError('minlength')">OVERVIEW min must be 2</div>
                  <div *ngIf="getField('overview')!.hasError('maxlength')">OVERVIEW max must be 4000</div>
              </div>
          </div>
          <div class="form-group col-md-12">
              <label for="popularity">popularity</label>
              <input type="number" formControlName="popularity" id="popularity" class="form-control" [class.is-invalid]="isFieldValid('popularity')">
              <div *ngIf="isFieldValid('popularity')" class="invalid-feedback">

              </div>
          </div>
          <div class="form-group col-md-12">
              <label for="poster_path">poster_path</label>
              <input type="text" formControlName="poster_path" id="poster_path" class="form-control" [class.is-invalid]="isFieldValid('poster_path')">
              <div *ngIf="isFieldValid('poster_path')" class="invalid-feedback">

              </div>
          </div>
          <fieldset formArrayName="production_companies" class="border border-dark p-1">
              <pre>{{ getProductionCompanies().errors | json }}</pre>
              <div class="btn-group">
                  <button type="button" class="btn btn-primary btn-block btn-sm" (click)="getProductionCompanies().push(createProductionCompanies())">ADD ProductionCompanies</button>
              </div>
              <div *ngFor="let ProductionCompanies1Data of getProductionCompanies().controls; let indexProductionCompanies = index;" class="border border-dark p-1" [formGroupName]="indexProductionCompanies">
                  <div class="btn-group">
                      <button type="button" class="btn btn-danger btn-sm" (click)="deleteProductionCompanies(indexProductionCompanies)">DELETE ProductionCompanies</button>
                  </div>
                  <div class="form-group col-md-12">
                      <label for="id">production_companies.*.id</label>
                      <input type="number" formControlName="id" id="production_companies.*.id" class="form-control" [class.is-invalid]="!getProductionCompanies().at(indexProductionCompanies).get('id')?.valid">
                      <div *ngIf="!getProductionCompanies().at(indexProductionCompanies).get('id')?.valid" class="invalid-feedback">

                      </div>
                  </div>
                  <div class="form-group col-md-12">
                      <label for="logo_path">production_companies.*.logo_path</label>
                      <input type="text" formControlName="logo_path" id="production_companies.*.logo_path" class="form-control" [class.is-invalid]="!getProductionCompanies().at(indexProductionCompanies).get('logo_path')?.valid">
                      <div *ngIf="!getProductionCompanies().at(indexProductionCompanies).get('logo_path')?.valid" class="invalid-feedback">

                      </div>
                  </div>
                  <div class="form-group col-md-12">
                      <label for="name">production_companies.*.name</label>
                      <input type="text" formControlName="name" id="production_companies.*.name" class="form-control" [class.is-invalid]="!getProductionCompanies().at(indexProductionCompanies).get('name')?.valid">
                      <div *ngIf="!getProductionCompanies().at(indexProductionCompanies).get('name')?.valid" class="invalid-feedback">
                          <div *ngIf="getProductionCompanies().at(indexProductionCompanies).get('name')!.hasError('minlength')">PRODUCTION_COMPANIES.*.NAME min must be 2</div>
                          <div *ngIf="getProductionCompanies().at(indexProductionCompanies).get('name')!.hasError('maxlength')">PRODUCTION_COMPANIES.*.NAME max must be 255</div>
                      </div>
                  </div>
                  <div class="form-group col-md-12">
                      <label for="origin_country">production_companies.*.origin_country</label>
                      <input type="text" formControlName="origin_country" id="production_companies.*.origin_country" class="form-control" [class.is-invalid]="!getProductionCompanies().at(indexProductionCompanies).get('origin_country')?.valid">
                      <div *ngIf="!getProductionCompanies().at(indexProductionCompanies).get('origin_country')?.valid" class="invalid-feedback">
                          <div *ngIf="getProductionCompanies().at(indexProductionCompanies).get('origin_country')!.hasError('minlength')">PRODUCTION_COMPANIES.*.ORIGIN_COUNTRY min must be 2</div>
                          <div *ngIf="getProductionCompanies().at(indexProductionCompanies).get('origin_country')!.hasError('maxlength')">PRODUCTION_COMPANIES.*.ORIGIN_COUNTRY max must be 2</div>
                      </div>
                  </div>
              </div>
          </fieldset>
          <fieldset formArrayName="production_countries" class="border border-dark p-1">
              <pre>{{ getProductionCountries().errors | json }}</pre>
              <div class="btn-group">
                  <button type="button" class="btn btn-primary btn-block btn-sm" (click)="getProductionCountries().push(createProductionCountries())">ADD ProductionCountries</button>
              </div>
              <div *ngFor="let ProductionCountries1Data of getProductionCountries().controls; let indexProductionCountries = index;" class="border border-dark p-1" [formGroupName]="indexProductionCountries">
                  <div class="btn-group">
                      <button type="button" class="btn btn-danger btn-sm" (click)="deleteProductionCountries(indexProductionCountries)">DELETE ProductionCountries</button>
                  </div>
                  <div class="form-group col-md-12">
                      <label for="iso_3166_1">production_countries.*.iso_3166_1</label>
                      <input type="text" formControlName="iso_3166_1" id="production_countries.*.iso_3166_1" class="form-control" [class.is-invalid]="!getProductionCountries().at(indexProductionCountries).get('iso_3166_1')?.valid">
                      <div *ngIf="!getProductionCountries().at(indexProductionCountries).get('iso_3166_1')?.valid" class="invalid-feedback">
                          <div *ngIf="getProductionCountries().at(indexProductionCountries).get('iso_3166_1')!.hasError('minlength')">PRODUCTION_COUNTRIES.*.ISO_3166_1 min must be 2</div>
                          <div *ngIf="getProductionCountries().at(indexProductionCountries).get('iso_3166_1')!.hasError('maxlength')">PRODUCTION_COUNTRIES.*.ISO_3166_1 max must be 2</div>
                      </div>
                  </div>
                  <div class="form-group col-md-12">
                      <label for="name">production_countries.*.name</label>
                      <input type="text" formControlName="name" id="production_countries.*.name" class="form-control" [class.is-invalid]="!getProductionCountries().at(indexProductionCountries).get('name')?.valid">
                      <div *ngIf="!getProductionCountries().at(indexProductionCountries).get('name')?.valid" class="invalid-feedback">
                          <div *ngIf="getProductionCountries().at(indexProductionCountries).get('name')!.hasError('minlength')">PRODUCTION_COUNTRIES.*.NAME min must be 2</div>
                          <div *ngIf="getProductionCountries().at(indexProductionCountries).get('name')!.hasError('maxlength')">PRODUCTION_COUNTRIES.*.NAME max must be 255</div>
                      </div>
                  </div>
              </div>
          </fieldset>
          <div class="form-group col-md-12">
              <label for="release_date">release_date</label>
              <input type="date" formControlName="release_date" id="release_date" class="form-control" [class.is-invalid]="isFieldValid('release_date')">
              <div *ngIf="isFieldValid('release_date')" class="invalid-feedback">

              </div>
          </div>
          <div class="form-group col-md-12">
              <label for="revenue">revenue</label>
              <input type="number" formControlName="revenue" id="revenue" class="form-control" [class.is-invalid]="isFieldValid('revenue')">
              <div *ngIf="isFieldValid('revenue')" class="invalid-feedback">

              </div>
          </div>
          <div class="form-group col-md-12">
              <label for="runtime">runtime</label>
              <input type="number" formControlName="runtime" id="runtime" class="form-control" [class.is-invalid]="isFieldValid('runtime')">
              <div *ngIf="isFieldValid('runtime')" class="invalid-feedback">

              </div>
          </div>
          <fieldset formArrayName="spoken_languages" class="border border-dark p-1">
              <pre>{{ getSpokenLanguages().errors | json }}</pre>
              <div class="btn-group">
                  <button type="button" class="btn btn-primary btn-block btn-sm" (click)="getSpokenLanguages().push(createSpokenLanguages())">ADD SpokenLanguages</button>
              </div>
              <div *ngFor="let SpokenLanguages1Data of getSpokenLanguages().controls; let indexSpokenLanguages = index;" class="border border-dark p-1" [formGroupName]="indexSpokenLanguages">
                  <div class="btn-group">
                      <button type="button" class="btn btn-danger btn-sm" (click)="deleteSpokenLanguages(indexSpokenLanguages)">DELETE SpokenLanguages</button>
                  </div>
                  <div class="form-group col-md-12">
                      <label for="iso_639_1">spoken_languages.*.iso_639_1</label>
                      <input type="text" formControlName="iso_639_1" id="spoken_languages.*.iso_639_1" class="form-control" [class.is-invalid]="!getSpokenLanguages().at(indexSpokenLanguages).get('iso_639_1')?.valid">
                      <div *ngIf="!getSpokenLanguages().at(indexSpokenLanguages).get('iso_639_1')?.valid" class="invalid-feedback">
                          <div *ngIf="getSpokenLanguages().at(indexSpokenLanguages).get('iso_639_1')!.hasError('minlength')">SPOKEN_LANGUAGES.*.ISO_639_1 min must be 2</div>
                          <div *ngIf="getSpokenLanguages().at(indexSpokenLanguages).get('iso_639_1')!.hasError('maxlength')">SPOKEN_LANGUAGES.*.ISO_639_1 max must be 2</div>
                      </div>
                  </div>
                  <div class="form-group col-md-12">
                      <label for="name">spoken_languages.*.name</label>
                      <input type="text" formControlName="name" id="spoken_languages.*.name" class="form-control" [class.is-invalid]="!getSpokenLanguages().at(indexSpokenLanguages).get('name')?.valid">
                      <div *ngIf="!getSpokenLanguages().at(indexSpokenLanguages).get('name')?.valid" class="invalid-feedback">
                          <div *ngIf="getSpokenLanguages().at(indexSpokenLanguages).get('name')!.hasError('minlength')">SPOKEN_LANGUAGES.*.NAME min must be 2</div>
                          <div *ngIf="getSpokenLanguages().at(indexSpokenLanguages).get('name')!.hasError('maxlength')">SPOKEN_LANGUAGES.*.NAME max must be 255</div>
                      </div>
                  </div>
              </div>
          </fieldset>
          <div class="form-group col-md-12">
              <label for="status">status</label>
              <div *ngIf="(status$ | async) as asyncData">
                  <div *ngFor="let data of asyncData; let indexstatus = index;">
                      <div class="form-check">
                          <input type="radio" formControlName="status" [value]="data" [class.is-invalid]="isFieldValid('status')">{{ data | json }}
                      </div>
                  </div>
              </div>
              <div *ngIf="isFieldValid('status')" class="invalid-feedback">

              </div>
          </div>
          <div class="form-group col-md-12">
              <label for="tagline">tagline</label>
              <input type="text" formControlName="tagline" id="tagline" class="form-control" [class.is-invalid]="isFieldValid('tagline')">
              <div *ngIf="isFieldValid('tagline')" class="invalid-feedback">
                  <div *ngIf="getField('tagline')!.hasError('minlength')">TAGLINE min must be 2</div>
                  <div *ngIf="getField('tagline')!.hasError('maxlength')">TAGLINE max must be 255</div>
              </div>
          </div>
          <div formGroupName="users">
              <div class="form-group col-md-12">
                  <label for="users.first_name">users.first_name</label>
                  <input type="text" formControlName="first_name" id="users.first_name" class="form-control" [class.is-invalid]="isFieldValid('users.first_name')">
                  <div *ngIf="isFieldValid('users.first_name')" class="invalid-feedback">
                      <div *ngIf="getField('users.first_name')!.hasError('required')">USERS.FIRST_NAME is required</div>
                      <div *ngIf="getField('users.first_name')!.hasError('minlength')">USERS.FIRST_NAME min must be 3</div>
                      <div *ngIf="getField('users.first_name')!.hasError('maxlength')">USERS.FIRST_NAME max must be 255</div>
                  </div>
              </div>
              <div class="form-group col-md-12">
                  <label for="users.last_name">users.last_name</label>
                  <input type="text" formControlName="last_name" id="users.last_name" class="form-control" [class.is-invalid]="isFieldValid('users.last_name')">
                  <div *ngIf="isFieldValid('users.last_name')" class="invalid-feedback">
                      <div *ngIf="getField('users.last_name')!.hasError('required')">USERS.LAST_NAME is required</div>
                      <div *ngIf="getField('users.last_name')!.hasError('minlength')">USERS.LAST_NAME min must be 3</div>
                      <div *ngIf="getField('users.last_name')!.hasError('maxlength')">USERS.LAST_NAME max must be 255</div>
                  </div>
              </div>
              <div class="btn-group">
                  <button type="button" (click)="getUsersEmail().push(createUsersEmail())" class="btn btn-primary btn-sm">add UsersEmail</button>
              </div>
              <div formArrayName="email" *ngFor="let h of getUsersEmail()!.controls; let indexEmail = index;">
                  <div class="form-group col-md-12">
                      <label for="*">users.email.*</label>
                      <div class="input-group">
                          <input type="text" [formControlName]="indexEmail" id="users.email.*" class="form-control" [class.is-invalid]="!getUsersEmail().at(indexEmail)?.valid">
                          <button type="button" (click)="deleteUsersEmail(indexEmail)" class="btn btn-danger btn-sm">
                              <span class="glyphicon glyphicon-remove" aria-hidden="true"></span> Delete
                          </button>
                          <div *ngIf="!getUsersEmail().at(indexEmail)?.valid" class="invalid-feedback">
                              <div *ngIf="getUsersEmail().at(indexEmail)!.hasError('email')">USERS.EMAIL.* an valid Email</div>
                          </div>
                      </div>
                  </div>
              </div>
              <div class="form-group col-md-12">
                  <label for="users.nickname">users.nickname</label>
                  <input type="text" formControlName="nickname" id="users.nickname" class="form-control" [class.is-invalid]="isFieldValid('users.nickname')">
                  <div *ngIf="isFieldValid('users.nickname')" class="invalid-feedback">
                      <div *ngIf="getField('users.nickname')!.hasError('minlength')">USERS.NICKNAME min must be 3</div>
                      <div *ngIf="getField('users.nickname')!.hasError('maxlength')">USERS.NICKNAME max must be 255</div>
                  </div>
              </div>
              <fieldset formArrayName="cars" class="border border-dark p-1">
                  <pre>{{ getUsersCars().errors | json }}</pre>
                  <div class="btn-group">
                      <button type="button" class="btn btn-primary btn-block btn-sm" (click)="getUsersCars().push(createUsersCars())">ADD UsersCars</button>
                  </div>
                  <div *ngFor="let UsersCars1Data of getUsersCars().controls; let indexCars = index;" class="border border-dark p-1" [formGroupName]="indexCars">
                      <div class="btn-group">
                          <button type="button" class="btn btn-danger btn-sm" (click)="deleteUsersCars(indexCars)">DELETE UsersCars</button>
                      </div>
                      <div class="form-group col-md-12">
                          <label for="model">users.cars.*.model</label>
                          <input type="text" formControlName="model" id="users.cars.*.model" class="form-control" [class.is-invalid]="!getUsersCars().at(indexCars).get('model')?.valid">
                          <div *ngIf="!getUsersCars().at(indexCars).get('model')?.valid" class="invalid-feedback">
                              <div *ngIf="getUsersCars().at(indexCars).get('model')!.hasError('required')">USERS.CARS.*.MODEL is required</div>
                              <div *ngIf="getUsersCars().at(indexCars).get('model')!.hasError('minlength')">USERS.CARS.*.MODEL min must be 2</div>
                          </div>
                      </div>
                      <div class="form-group col-md-12">
                          <label for="year">users.cars.*.year</label>
                          <input type="number" formControlName="year" id="users.cars.*.year" class="form-control" [class.is-invalid]="!getUsersCars().at(indexCars).get('year')?.valid">
                          <div *ngIf="!getUsersCars().at(indexCars).get('year')?.valid" class="invalid-feedback">
                              <div *ngIf="getUsersCars().at(indexCars).get('year')!.hasError('required')">USERS.CARS.*.YEAR is required</div>
                              <div *ngIf="getUsersCars().at(indexCars).get('year')!.hasError('minlength')">USERS.CARS.*.YEAR min must be 4</div>
                              <div *ngIf="getUsersCars().at(indexCars).get('year')!.hasError('maxlength')">USERS.CARS.*.YEAR max must be 4</div>
                          </div>
                      </div>
                      <div class="form-group col-md-12">
                          <label for="value">users.cars.*.value</label>
                          <input type="text" formControlName="value" id="users.cars.*.value" class="form-control" [class.is-invalid]="!getUsersCars().at(indexCars).get('value')?.valid">
                          <div *ngIf="!getUsersCars().at(indexCars).get('value')?.valid" class="invalid-feedback">
                              <div *ngIf="getUsersCars().at(indexCars).get('value')!.hasError('required')">USERS.CARS.*.VALUE is required</div>
                              <div *ngIf="getUsersCars().at(indexCars).get('value')!.hasError('minlength')">USERS.CARS.*.VALUE min must be 2</div>
                              <div *ngIf="getUsersCars().at(indexCars).get('value')!.hasError('maxlength')">USERS.CARS.*.VALUE max must be 10</div>
                          </div>
                      </div>
                  </div>
              </fieldset>
              <fieldset formArrayName="medications" class="border border-dark p-1">
                  <pre>{{ getUsersMedications().errors | json }}</pre>
                  <div class="btn-group">
                      <button type="button" class="btn btn-primary btn-block btn-sm" (click)="getUsersMedications().push(createUsersMedications())">ADD UsersMedications</button>
                  </div>
                  <div *ngFor="let UsersMedications1Data of getUsersMedications().controls; let indexMedications = index;" class="border border-dark p-1" [formGroupName]="indexMedications">
                      <div class="btn-group">
                          <button type="button" class="btn btn-danger btn-sm" (click)="deleteUsersMedications(indexMedications)">DELETE UsersMedications</button>
                      </div>
                      <div class="form-group col-md-12">
                          <label for="medication_name">users.medications.*.medication_name</label>
                          <input type="text" formControlName="medication_name" id="users.medications.*.medication_name" class="form-control" [class.is-invalid]="!getUsersMedications().at(indexMedications).get('medication_name')?.valid">
                          <div *ngIf="!getUsersMedications().at(indexMedications).get('medication_name')?.valid" class="invalid-feedback">
                              <div *ngIf="getUsersMedications().at(indexMedications).get('medication_name')!.hasError('required')">USERS.MEDICATIONS.*.MEDICATION_NAME is required</div>
                              <div *ngIf="getUsersMedications().at(indexMedications).get('medication_name')!.hasError('minlength')">USERS.MEDICATIONS.*.MEDICATION_NAME min must be 3</div>
                              <div *ngIf="getUsersMedications().at(indexMedications).get('medication_name')!.hasError('maxlength')">USERS.MEDICATIONS.*.MEDICATION_NAME max must be 255</div>
                          </div>
                      </div>
                      <div class="form-group col-md-12">
                          <label for="medication_details">users.medications.*.medication_details</label>
                          <textarea formControlName="medication_details" id="users.medications.*.medication_details" class="form-control" cols="30" rows="10" [class.is-invalid]="!getUsersMedications().at(indexMedications).get('medication_details')?.valid"></textarea>
                          <div *ngIf="!getUsersMedications().at(indexMedications).get('medication_details')?.valid" class="invalid-feedback">
                              <div *ngIf="getUsersMedications().at(indexMedications).get('medication_details')!.hasError('minlength')">USERS.MEDICATIONS.*.MEDICATION_DETAILS min must be 3</div>
                              <div *ngIf="getUsersMedications().at(indexMedications).get('medication_details')!.hasError('maxlength')">USERS.MEDICATIONS.*.MEDICATION_DETAILS max must be 4000</div>
                          </div>
                      </div>
                  </div>
              </fieldset>
              <div class="form-group col-md-12">
                  <label for="users.description">users.description</label>
                  <textarea formControlName="description" id="users.description" class="form-control" cols="30" rows="10" [class.is-invalid]="isFieldValid('users.description')"></textarea>
                  <div *ngIf="isFieldValid('users.description')" class="invalid-feedback">
                      <div *ngIf="getField('users.description')!.hasError('required')">USERS.DESCRIPTION is required</div>
                      <div *ngIf="getField('users.description')!.hasError('minlength')">USERS.DESCRIPTION min must be 3</div>
                      <div *ngIf="getField('users.description')!.hasError('maxlength')">USERS.DESCRIPTION max must be 4000</div>
                  </div>
              </div>
              <div class="form-group col-md-12">
                  <label for="users.birthdate">users.birthdate</label>
                  <input type="date" formControlName="birthdate" id="users.birthdate" class="form-control" [class.is-invalid]="isFieldValid('users.birthdate')">
                  <div *ngIf="isFieldValid('users.birthdate')" class="invalid-feedback">
                      <div *ngIf="getField('users.birthdate')!.hasError('required')">USERS.BIRTHDATE is required</div>
                  </div>
              </div>
          </div>
          <div class="form-group col-md-12">
              <label for="title">title</label>
              <input type="text" formControlName="title" id="title" class="form-control" [class.is-invalid]="isFieldValid('title')">
              <div *ngIf="isFieldValid('title')" class="invalid-feedback">
                  <div *ngIf="getField('title')!.hasError('minlength')">TITLE min must be 2</div>
                  <div *ngIf="getField('title')!.hasError('maxlength')">TITLE max must be 255</div>
              </div>
          </div>
          <div class="form-group col-md-12">
              <label for="video">video</label>
              <input type="text" formControlName="video" id="video" class="form-control" [class.is-invalid]="isFieldValid('video')">
              <div *ngIf="isFieldValid('video')" class="invalid-feedback">

              </div>
          </div>
          <div class="form-group col-md-12">
              <label for="vote_average">vote_average</label>
              <input type="number" formControlName="vote_average" id="vote_average" class="form-control" [class.is-invalid]="isFieldValid('vote_average')">
              <div *ngIf="isFieldValid('vote_average')" class="invalid-feedback">
                  <div *ngIf="getField('vote_average')!.hasError('minlength')">VOTE_AVERAGE min must be 2</div>
                  <div *ngIf="getField('vote_average')!.hasError('maxlength')">VOTE_AVERAGE max must be 255</div>
              </div>
          </div>
          <div class="form-group col-md-12">
              <label for="vote_count">vote_count</label>
              <input type="number" formControlName="vote_count" id="vote_count" class="form-control" [class.is-invalid]="isFieldValid('vote_count')">
              <div *ngIf="isFieldValid('vote_count')" class="invalid-feedback">
                  <div *ngIf="getField('vote_count')!.hasError('minlength')">VOTE_COUNT min must be 2</div>
                  <div *ngIf="getField('vote_count')!.hasError('maxlength')">VOTE_COUNT max must be 255</div>
              </div>
          </div>
          <button type="submit" class="btn btn-primary">
              Submit
          </button>
      </form>
  </div>`;
  });
});
