import { ReactiveDrivenHtml } from './reactive-driven-html';
import { html_beautify, js_beautify } from 'js-beautify';

describe('ReactiveDrivenHtml', () => {
    beforeEach(() => {
    });

    it('1', () => {
        const reactiveDrivenHtml = new ReactiveDrivenHtml(
            {
                "movies": [
                    {
                        "adult": "nullable|boolean",
                        "backdrop_path": "nullable|string",
                        "belongs_to_collection": "nullable",
                        "budget": "nullable|html:number|integer",
                        "genres123": {
                            "id": "nullable|html:number|integer",
                            "production_companies": [
                                [
                                    {
                                        "production_countries": {
                                            "iso_3166_1": "nullable|min:2|max:2",
                                            "name": "nullable|min:2|max:255"
                                        },
                                        "id": "html:number|nullable",
                                        "logo_path": "nullable|string",
                                        "name": "nullable|min:2|max:255",
                                        "origin_country": "nullable|min:2|max:2"
                                    }
                                ]
                            ],
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
                        "release_date": "html:date|nullable|date_format:Y-m-d",
                        "revenue": "html:number|nullable",
                        "runtime": "html:number|nullable",
                        "spoken_languages": {
                            "iso_639_1": "nullable|min:2|max:2",
                            "name": "nullable|min:2|max:255"
                        },
                        "tagline": "nullable|min:2|max:255",
                        "title": "nullable|min:2|max:255",
                        "video": "nullable|boolean",
                        "vote_average": "nullable|html:number|number|min:2|max:255",
                        "vote_count": "nullable|html:number|integer|min:2|max:255"
                    },
                    {
                        "adult": "nullable|boolean",
                        "backdrop_path": "nullable|string",
                        "belongs_to_collection": "nullable",
                        "budget": "nullable|html:number|integer",
                        "genres": {
                            "id": "nullable|html:number|integer",
                            "production_companies": [
                                [
                                    {
                                        "production_countries": {
                                            "iso_3166_1": "nullable|min:2|max:2",
                                            "name": "nullable|min:2|max:255"
                                        },
                                        "id": "html:number|nullable",
                                        "logo_path": "nullable|string",
                                        "name": "nullable|min:2|max:255",
                                        "origin_country": "nullable|min:2|max:2"
                                    }
                                ]
                            ],
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
                        "release_date": "html:date|nullable|date_format:Y-m-d",
                        "revenue": "html:number|nullable",
                        "runtime": "html:number|nullable",
                        "spoken_languages": {
                            "iso_639_1": "nullable|min:2|max:2",
                            "name": "nullable|min:2|max:255"
                        },
                        "tagline": "nullable|min:2|max:255",
                        "title": "nullable|min:2|max:255",
                        "video": "nullable|boolean",
                        "vote_average": "nullable|html:number|number|min:2|max:255",
                        "vote_count": "nullable|html:number|integer|min:2|max:255"
                    }
                ]
            }
        );
        const response = reactiveDrivenHtml.generate();
        expect(
            html_beautify(response.join("\n"))
        )
            .toBe(
                html_beautify(`<form [formGroup]="form" (ngSubmit)="onSubmit()">
            <pre>{{ form.value | json }}</pre>
            <fieldset [formArrayName]="'movies'" class="form-group">
                <div class="btn-group">
                    <button type="button" class="btn btn-primary btn-block btn-sm" (click)="getMoviesFormArray().push(createMovies())">
                        <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                        ADD Movies
                    </button>
                </div>
                <div *ngFor="let _movies1 of getMoviesFormArray()?.controls; let index1 = index;" [formGroupName]="index1">
        
                    <div class="btn-group">
                        <button type="button" (click)="deleteMovies(index1)" class="btn btn-danger btn-sm">
                            <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                            DELETE Movies
                        </button>
                    </div>
                    <div class="form-group" *ngIf="getField(['movies',index1,'adult']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="text" [formControlName]="'adult'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                        </div>
                    </div>
                    <div class="form-group" *ngIf="getField(['movies',index1,'backdrop_path']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="text" [formControlName]="'backdrop_path'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                        </div>
                    </div>
                    <div class="form-group" *ngIf="getField(['movies',index1,'belongs_to_collection']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="text" [formControlName]="'belongs_to_collection'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                        </div>
                    </div>
                    <div class="form-group" *ngIf="getField(['movies',index1,'budget']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="number" [formControlName]="'budget'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                        </div>
                    </div>
                    <div [formGroupName]="'genres'">
                        <div class="form-group" *ngIf="getField(['movies',index1,'genres','id']) as field">
                            <label [for]="field.id">{{ field.id }}</label>
                            <input type="number" [formControlName]="'id'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                            <div *ngIf="field.isFieldValid" class="invalid-feedback">
                            </div>
                        </div>
                        <fieldset [formArrayName]="'production_companies'" class="form-group">
                            <div class="btn-group">
                                <button type="button" class="btn btn-primary btn-block btn-sm" (click)="getMoviesGenresProductionCompaniesFormArray(index1).push(createMoviesGenresProductionCompanies())">
                                    <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                    ADD MoviesGenresProductionCompanies
                                </button>
                            </div>
                            <div *ngFor="let _moviesGenresProductionCompanies1 of getMoviesGenresProductionCompaniesFormArray(index1)?.controls; let index2 = index;">
        
                                <div class="btn-group">
                                    <button type="button" (click)="deleteMoviesGenresProductionCompanies(index1,index2)" class="btn btn-danger btn-sm">
                                        <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                        DELETE MoviesGenresProductionCompanies
                                    </button>
                                </div>
                                <fieldset [formArrayName]="index2" class="form-group">
                                    <div class="btn-group">
                                        <button type="button" class="btn btn-primary btn-block btn-sm" (click)="getMoviesGenresProductionCompanies1FormArray(index1,index2).push(createMoviesGenresProductionCompanies1())">
                                            <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                            ADD MoviesGenresProductionCompanies1
                                        </button>
                                    </div>
                                    <div *ngFor="let _moviesGenresProductionCompanies2 of getMoviesGenresProductionCompanies1FormArray(index1,index2)?.controls; let index3 = index;" [formGroupName]="index3">
        
                                        <div class="btn-group">
                                            <button type="button" (click)="deleteMoviesGenresProductionCompanies1(index1,index2,index3)" class="btn btn-danger btn-sm">
                                                <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                                DELETE MoviesGenresProductionCompanies1
                                            </button>
                                        </div>
                                        <div [formGroupName]="'production_countries'">
                                            <div class="form-group" *ngIf="getField(['movies',index1,'genres','production_companies',index2,index3,'production_countries','iso_3166_1']) as field">
                                                <label [for]="field.id">{{ field.id }}</label>
                                                <input type="text" [formControlName]="'iso_3166_1'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                                <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                                    <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 2</div>
                                                    <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 2</div>
                                                </div>
                                            </div>
                                            <div class="form-group" *ngIf="getField(['movies',index1,'genres','production_companies',index2,index3,'production_countries','name']) as field">
                                                <label [for]="field.id">{{ field.id }}</label>
                                                <input type="text" [formControlName]="'name'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                                <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                                    <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 2</div>
                                                    <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="form-group" *ngIf="getField(['movies',index1,'genres','production_companies',index2,index3,'id']) as field">
                                            <label [for]="field.id">{{ field.id }}</label>
                                            <input type="number" [formControlName]="'id'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                            <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                            </div>
                                        </div>
                                        <div class="form-group" *ngIf="getField(['movies',index1,'genres','production_companies',index2,index3,'logo_path']) as field">
                                            <label [for]="field.id">{{ field.id }}</label>
                                            <input type="text" [formControlName]="'logo_path'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                            <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                            </div>
                                        </div>
                                        <div class="form-group" *ngIf="getField(['movies',index1,'genres','production_companies',index2,index3,'name']) as field">
                                            <label [for]="field.id">{{ field.id }}</label>
                                            <input type="text" [formControlName]="'name'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                            <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                                <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 2</div>
                                                <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                                            </div>
                                        </div>
                                        <div class="form-group" *ngIf="getField(['movies',index1,'genres','production_companies',index2,index3,'origin_country']) as field">
                                            <label [for]="field.id">{{ field.id }}</label>
                                            <input type="text" [formControlName]="'origin_country'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                            <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                                <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 2</div>
                                                <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 2</div>
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                        </fieldset>
                        <div class="form-group" *ngIf="getField(['movies',index1,'genres','name']) as field">
                            <label [for]="field.id">{{ field.id }}</label>
                            <input type="text" [formControlName]="'name'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                            <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 2</div>
                                <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group" *ngIf="getField(['movies',index1,'homepage']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="text" [formControlName]="'homepage'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                        </div>
                    </div>
                    <div class="form-group" *ngIf="getField(['movies',index1,'id']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="number" [formControlName]="'id'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                            <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 2</div>
                            <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 25</div>
                        </div>
                    </div>
                    <div class="form-group" *ngIf="getField(['movies',index1,'imdb_id']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="text" [formControlName]="'imdb_id'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                            <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 9</div>
                            <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 9</div>
                        </div>
                    </div>
                    <div class="form-group" *ngIf="getField(['movies',index1,'original_language']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="text" [formControlName]="'original_language'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                            <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 2</div>
                            <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 2</div>
                        </div>
                    </div>
                    <div class="form-group" *ngIf="getField(['movies',index1,'original_title']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="text" [formControlName]="'original_title'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                            <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 2</div>
                            <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                        </div>
                    </div>
                    <div class="form-group" *ngIf="getField(['movies',index1,'overview']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <textarea [formControlName]="'overview'" [id]="field.id" class="form-control" cols="30" rows="10" [class.is-invalid]="field.isFieldValid"></textarea>
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                            <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 2</div>
                            <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 4000</div>
                        </div>
                    </div>
                    <div class="form-group" *ngIf="getField(['movies',index1,'popularity']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="number" [formControlName]="'popularity'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                        </div>
                    </div>
                    <div class="form-group" *ngIf="getField(['movies',index1,'poster_path']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="text" [formControlName]="'poster_path'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                        </div>
                    </div>
                    <div class="form-group" *ngIf="getField(['movies',index1,'release_date']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="date" [formControlName]="'release_date'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                        </div>
                    </div>
                    <div class="form-group" *ngIf="getField(['movies',index1,'revenue']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="number" [formControlName]="'revenue'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                        </div>
                    </div>
                    <div class="form-group" *ngIf="getField(['movies',index1,'runtime']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="number" [formControlName]="'runtime'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                        </div>
                    </div>
                    <div [formGroupName]="'spoken_languages'">
                        <div class="form-group" *ngIf="getField(['movies',index1,'spoken_languages','iso_639_1']) as field">
                            <label [for]="field.id">{{ field.id }}</label>
                            <input type="text" [formControlName]="'iso_639_1'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                            <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 2</div>
                                <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 2</div>
                            </div>
                        </div>
                        <div class="form-group" *ngIf="getField(['movies',index1,'spoken_languages','name']) as field">
                            <label [for]="field.id">{{ field.id }}</label>
                            <input type="text" [formControlName]="'name'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                            <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 2</div>
                                <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group" *ngIf="getField(['movies',index1,'tagline']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="text" [formControlName]="'tagline'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                            <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 2</div>
                            <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                        </div>
                    </div>
                    <div class="form-group" *ngIf="getField(['movies',index1,'title']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="text" [formControlName]="'title'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                            <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 2</div>
                            <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                        </div>
                    </div>
                    <div class="form-group" *ngIf="getField(['movies',index1,'video']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="text" [formControlName]="'video'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                        </div>
                    </div>
                    <div class="form-group" *ngIf="getField(['movies',index1,'vote_average']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="number" [formControlName]="'vote_average'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                            <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 2</div>
                            <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                        </div>
                    </div>
                    <div class="form-group" *ngIf="getField(['movies',index1,'vote_count']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="number" [formControlName]="'vote_count'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                            <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 2</div>
                            <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                        </div>
                    </div>
                </div>
            </fieldset>
            <button type="submit" class="btn btn-primary">
                Submit
            </button>
        </form>`)
            )
    });

    it('2', () => {
        const reactiveDrivenHtml = new ReactiveDrivenHtml(
            {
                "accounting": [
                    {
                        "firstName": "required",
                        "lastName": "required",
                        "age": "required|max:30"
                    }
                ],
                "sales": [
                    {
                        "firstName": "required",
                        "lastName": "required",
                        "age": "required|max:30"
                    }
                ]
            }
        );
        const response = reactiveDrivenHtml.generate();
        expect(
            html_beautify(response.join("\n"))
        )
            .toBe(
                html_beautify(`<form [formGroup]="form" (ngSubmit)="onSubmit()">
            <pre>{{ form.value | json }}</pre>
            <fieldset [formArrayName]="'accounting'" class="form-group">
                <div class="btn-group">
                    <button type="button" class="btn btn-primary btn-block btn-sm" (click)="getAccountingFormArray().push(createAccounting())">
                        <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                        ADD Accounting
                    </button>
                </div>
                <div *ngFor="let _accounting1 of getAccountingFormArray()?.controls; let index1 = index;" [formGroupName]="index1">
        
                    <div class="btn-group">
                        <button type="button" (click)="deleteAccounting(index1)" class="btn btn-danger btn-sm">
                            <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                            DELETE Accounting
                        </button>
                    </div>
                    <div class="form-group" *ngIf="getField(['accounting',index1,'firstName']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="text" [formControlName]="'firstName'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                            <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                        </div>
                    </div>
                    <div class="form-group" *ngIf="getField(['accounting',index1,'lastName']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="text" [formControlName]="'lastName'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                            <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                        </div>
                    </div>
                    <div class="form-group" *ngIf="getField(['accounting',index1,'age']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="text" [formControlName]="'age'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                            <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                            <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 30</div>
                        </div>
                    </div>
                </div>
            </fieldset>
            <fieldset [formArrayName]="'sales'" class="form-group">
                <div class="btn-group">
                    <button type="button" class="btn btn-primary btn-block btn-sm" (click)="getSalesFormArray().push(createSales())">
                        <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                        ADD Sales
                    </button>
                </div>
                <div *ngFor="let _sales1 of getSalesFormArray()?.controls; let index1 = index;" [formGroupName]="index1">
        
                    <div class="btn-group">
                        <button type="button" (click)="deleteSales(index1)" class="btn btn-danger btn-sm">
                            <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                            DELETE Sales
                        </button>
                    </div>
                    <div class="form-group" *ngIf="getField(['sales',index1,'firstName']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="text" [formControlName]="'firstName'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                            <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                        </div>
                    </div>
                    <div class="form-group" *ngIf="getField(['sales',index1,'lastName']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="text" [formControlName]="'lastName'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                            <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                        </div>
                    </div>
                    <div class="form-group" *ngIf="getField(['sales',index1,'age']) as field">
                        <label [for]="field.id">{{ field.id }}</label>
                        <input type="text" [formControlName]="'age'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                        <div *ngIf="field.isFieldValid" class="invalid-feedback">
                            <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                            <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 30</div>
                        </div>
                    </div>
                </div>
            </fieldset>
            <button type="submit" class="btn btn-primary">
                Submit
            </button>
        </form>`)
            )
    })

    it('3', () => {
        const reactiveDrivenHtml = new ReactiveDrivenHtml(
            {
                "users": [{
                    "name": {
                        "first": "html:text|required|min:3|max:255",
                        "middle": "html:text|nullable|min:3|max:255",
                        "last": "html:text|required|min:3|max:255"
                    },
                    "username": "html:text|required|min:3|max:10",
                    "password": "html:password|required|min:3|max:10",
                    "emails": ["html:email|required|min:10|max:40"],
                    "contacts": [{
                        "name": "required|min:3|max:255",
                        "email": "required|email|max:255"
                    }],
                    "medications": [{
                        "medication_name": "required|min:3|max:255",
                        "medication_details": "html:textarea|nullable|min:3|max:4000"
                    }],
                    "phoneNumber": "html:text|required|min:4|max:15",
                    "location": {
                        "street": "html:text|required|min:4|max:15",
                        "city": "html:text|required|min:4|max:15",
                        "state": "html:text|required|min:4|max:15",
                        "country": "html:text|required|min:4|max:15",
                        "zip": "html:number|required|min:4|max:15",
                        "coordinates": {
                            "latitude": "html:number|required|min:1|max:255",
                            "longitude": "html:number|required|min:1|max:255"
                        }
                    },
                    "website": "html:text|required|min:5|max:255",
                    "domain": "html:text|required|min:5|max:255",
                    "job": {
                        "title": "html:text|required|min:1|max:255",
                        "descriptor": "html:text|required|min:1|max:255",
                        "area": "html:text|required|min:4|max:255",
                        "type": "html:text|required|min:4|max:255",
                        "company": "html:text|required|min:4|max:255"
                    },
                    "creditCard": {
                        "number": "html:text|required|min:4|max:40",
                        "cvv": "html:number|required|min:4|max:15",
                        "issuer": "html:text|required|min:3|max:3"
                    }
                }]
            }
        );
        const response = reactiveDrivenHtml.generate();
        expect(
            html_beautify(response.join("\n"))
        )
            .toBe(
                html_beautify(`<form [formGroup]="form" (ngSubmit)="onSubmit()">
                <pre>{{ form.value | json }}</pre>
                <fieldset [formArrayName]="'users'" class="form-group">
                    <div class="btn-group">
                        <button type="button" class="btn btn-primary btn-block btn-sm" (click)="getUsersFormArray().push(createUsers())">
                            <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                            ADD Users
                        </button>
                    </div>
                    <div *ngFor="let _users1 of getUsersFormArray()?.controls; let index1 = index;" [formGroupName]="index1">
            
                        <div class="btn-group">
                            <button type="button" (click)="deleteUsers(index1)" class="btn btn-danger btn-sm">
                                <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                DELETE Users
                            </button>
                        </div>
                        <div [formGroupName]="'name'">
                            <div class="form-group" *ngIf="getField(['users',index1,'name','first']) as field">
                                <label [for]="field.id">{{ field.id }}</label>
                                <input type="text" [formControlName]="'first'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                    <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                    <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 3</div>
                                    <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                                </div>
                            </div>
                            <div class="form-group" *ngIf="getField(['users',index1,'name','middle']) as field">
                                <label [for]="field.id">{{ field.id }}</label>
                                <input type="text" [formControlName]="'middle'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                    <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 3</div>
                                    <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                                </div>
                            </div>
                            <div class="form-group" *ngIf="getField(['users',index1,'name','last']) as field">
                                <label [for]="field.id">{{ field.id }}</label>
                                <input type="text" [formControlName]="'last'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                    <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                    <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 3</div>
                                    <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                                </div>
                            </div>
                        </div>
                        <div class="form-group" *ngIf="getField(['users',index1,'username']) as field">
                            <label [for]="field.id">{{ field.id }}</label>
                            <input type="text" [formControlName]="'username'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                            <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 3</div>
                                <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 10</div>
                            </div>
                        </div>
                        <div class="form-group" *ngIf="getField(['users',index1,'password']) as field">
                            <label [for]="field.id">{{ field.id }}</label>
                            <input type="password" [formControlName]="'password'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                            <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 3</div>
                                <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 10</div>
                            </div>
                        </div>
                        <fieldset [formArrayName]="'emails'" class="form-group">
                            <div class="btn-group">
                                <button type="button" class="btn btn-primary btn-block btn-sm" (click)="getUsersEmailsFormArray(index1).push(createUsersEmails())">
                                    <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                    ADD UsersEmails
                                </button>
                            </div>
                            <div *ngFor="let _usersEmails1 of getUsersEmailsFormArray(index1)?.controls; let index2 = index;">
                                <div class="btn-group">
                                    <button type="button" (click)="deleteUsersEmails(index1,index2)" class="btn btn-danger btn-sm">
                                        <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                        DELETE UsersEmails
                                    </button>
                                </div>
                                <div class="form-group" *ngIf="getField(['users',index1,'emails',index2]) as field">
                                    <label [for]="field.id">{{ field.id }}</label>
                                    <input type="email" [formControlName]="index2" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                    <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                        <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                        <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 10</div>
                                        <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 40</div>
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                        <fieldset [formArrayName]="'contacts'" class="form-group">
                            <div class="btn-group">
                                <button type="button" class="btn btn-primary btn-block btn-sm" (click)="getUsersContactsFormArray(index1).push(createUsersContacts())">
                                    <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                    ADD UsersContacts
                                </button>
                            </div>
                            <div *ngFor="let _usersContacts1 of getUsersContactsFormArray(index1)?.controls; let index2 = index;" [formGroupName]="index2">
            
                                <div class="btn-group">
                                    <button type="button" (click)="deleteUsersContacts(index1,index2)" class="btn btn-danger btn-sm">
                                        <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                        DELETE UsersContacts
                                    </button>
                                </div>
                                <div class="form-group" *ngIf="getField(['users',index1,'contacts',index2,'name']) as field">
                                    <label [for]="field.id">{{ field.id }}</label>
                                    <input type="text" [formControlName]="'name'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                    <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                        <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                        <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 3</div>
                                        <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                                    </div>
                                </div>
                                <div class="form-group" *ngIf="getField(['users',index1,'contacts',index2,'email']) as field">
                                    <label [for]="field.id">{{ field.id }}</label>
                                    <input type="text" [formControlName]="'email'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                    <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                        <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                        <div *ngIf="field.abstractControl!.hasError('email')">{{ field.id.toUpperCase() }} an valid Email</div>
                                        <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                        <fieldset [formArrayName]="'medications'" class="form-group">
                            <div class="btn-group">
                                <button type="button" class="btn btn-primary btn-block btn-sm" (click)="getUsersMedicationsFormArray(index1).push(createUsersMedications())">
                                    <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                    ADD UsersMedications
                                </button>
                            </div>
                            <div *ngFor="let _usersMedications1 of getUsersMedicationsFormArray(index1)?.controls; let index2 = index;" [formGroupName]="index2">
            
                                <div class="btn-group">
                                    <button type="button" (click)="deleteUsersMedications(index1,index2)" class="btn btn-danger btn-sm">
                                        <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                        DELETE UsersMedications
                                    </button>
                                </div>
                                <div class="form-group" *ngIf="getField(['users',index1,'medications',index2,'medication_name']) as field">
                                    <label [for]="field.id">{{ field.id }}</label>
                                    <input type="text" [formControlName]="'medication_name'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                    <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                        <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                        <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 3</div>
                                        <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                                    </div>
                                </div>
                                <div class="form-group" *ngIf="getField(['users',index1,'medications',index2,'medication_details']) as field">
                                    <label [for]="field.id">{{ field.id }}</label>
                                    <textarea [formControlName]="'medication_details'" [id]="field.id" class="form-control" cols="30" rows="10" [class.is-invalid]="field.isFieldValid"></textarea>
                                    <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                        <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 3</div>
                                        <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 4000</div>
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                        <div class="form-group" *ngIf="getField(['users',index1,'phoneNumber']) as field">
                            <label [for]="field.id">{{ field.id }}</label>
                            <input type="text" [formControlName]="'phoneNumber'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                            <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 4</div>
                                <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 15</div>
                            </div>
                        </div>
                        <div [formGroupName]="'location'">
                            <div class="form-group" *ngIf="getField(['users',index1,'location','street']) as field">
                                <label [for]="field.id">{{ field.id }}</label>
                                <input type="text" [formControlName]="'street'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                    <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                    <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 4</div>
                                    <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 15</div>
                                </div>
                            </div>
                            <div class="form-group" *ngIf="getField(['users',index1,'location','city']) as field">
                                <label [for]="field.id">{{ field.id }}</label>
                                <input type="text" [formControlName]="'city'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                    <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                    <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 4</div>
                                    <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 15</div>
                                </div>
                            </div>
                            <div class="form-group" *ngIf="getField(['users',index1,'location','state']) as field">
                                <label [for]="field.id">{{ field.id }}</label>
                                <input type="text" [formControlName]="'state'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                    <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                    <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 4</div>
                                    <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 15</div>
                                </div>
                            </div>
                            <div class="form-group" *ngIf="getField(['users',index1,'location','country']) as field">
                                <label [for]="field.id">{{ field.id }}</label>
                                <input type="text" [formControlName]="'country'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                    <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                    <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 4</div>
                                    <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 15</div>
                                </div>
                            </div>
                            <div class="form-group" *ngIf="getField(['users',index1,'location','zip']) as field">
                                <label [for]="field.id">{{ field.id }}</label>
                                <input type="number" [formControlName]="'zip'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                    <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                    <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 4</div>
                                    <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 15</div>
                                </div>
                            </div>
                            <div [formGroupName]="'coordinates'">
                                <div class="form-group" *ngIf="getField(['users',index1,'location','coordinates','latitude']) as field">
                                    <label [for]="field.id">{{ field.id }}</label>
                                    <input type="number" [formControlName]="'latitude'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                    <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                        <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                        <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 1</div>
                                        <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                                    </div>
                                </div>
                                <div class="form-group" *ngIf="getField(['users',index1,'location','coordinates','longitude']) as field">
                                    <label [for]="field.id">{{ field.id }}</label>
                                    <input type="number" [formControlName]="'longitude'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                    <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                        <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                        <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 1</div>
                                        <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form-group" *ngIf="getField(['users',index1,'website']) as field">
                            <label [for]="field.id">{{ field.id }}</label>
                            <input type="text" [formControlName]="'website'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                            <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 5</div>
                                <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                            </div>
                        </div>
                        <div class="form-group" *ngIf="getField(['users',index1,'domain']) as field">
                            <label [for]="field.id">{{ field.id }}</label>
                            <input type="text" [formControlName]="'domain'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                            <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 5</div>
                                <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                            </div>
                        </div>
                        <div [formGroupName]="'job'">
                            <div class="form-group" *ngIf="getField(['users',index1,'job','title']) as field">
                                <label [for]="field.id">{{ field.id }}</label>
                                <input type="text" [formControlName]="'title'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                    <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                    <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 1</div>
                                    <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                                </div>
                            </div>
                            <div class="form-group" *ngIf="getField(['users',index1,'job','descriptor']) as field">
                                <label [for]="field.id">{{ field.id }}</label>
                                <input type="text" [formControlName]="'descriptor'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                    <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                    <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 1</div>
                                    <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                                </div>
                            </div>
                            <div class="form-group" *ngIf="getField(['users',index1,'job','area']) as field">
                                <label [for]="field.id">{{ field.id }}</label>
                                <input type="text" [formControlName]="'area'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                    <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                    <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 4</div>
                                    <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                                </div>
                            </div>
                            <div class="form-group" *ngIf="getField(['users',index1,'job','type']) as field">
                                <label [for]="field.id">{{ field.id }}</label>
                                <input type="text" [formControlName]="'type'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                    <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                    <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 4</div>
                                    <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                                </div>
                            </div>
                            <div class="form-group" *ngIf="getField(['users',index1,'job','company']) as field">
                                <label [for]="field.id">{{ field.id }}</label>
                                <input type="text" [formControlName]="'company'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                    <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                    <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 4</div>
                                    <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                                </div>
                            </div>
                        </div>
                        <div [formGroupName]="'creditCard'">
                            <div class="form-group" *ngIf="getField(['users',index1,'creditCard','number']) as field">
                                <label [for]="field.id">{{ field.id }}</label>
                                <input type="text" [formControlName]="'number'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                    <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                    <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 4</div>
                                    <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 40</div>
                                </div>
                            </div>
                            <div class="form-group" *ngIf="getField(['users',index1,'creditCard','cvv']) as field">
                                <label [for]="field.id">{{ field.id }}</label>
                                <input type="number" [formControlName]="'cvv'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                    <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                    <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 4</div>
                                    <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 15</div>
                                </div>
                            </div>
                            <div class="form-group" *ngIf="getField(['users',index1,'creditCard','issuer']) as field">
                                <label [for]="field.id">{{ field.id }}</label>
                                <input type="text" [formControlName]="'issuer'" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                    <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                    <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 3</div>
                                    <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 3</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </fieldset>
                <button type="submit" class="btn btn-primary">
                    Submit
                </button>
            </form>`)
            )
    });

    it('4', () => {
        const reactiveDrivenHtml = new ReactiveDrivenHtml(
            {
                "big_ass_array_of_objects": [
                    [
                        [
                            [
                                {
                                    "first_name": [
                                        "required|min:3|max:255"
                                    ],
                                    "last_name": [
                                        [
                                            "required|min:3|max:255"
                                        ]
                                    ]
                                }
                            ]
                        ]
                    ]
                ]
            }
        );
        const response = reactiveDrivenHtml.generate();
        expect(
            html_beautify(response.join("\n"))
        )
            .toBe(
                html_beautify(`<form [formGroup]="form" (ngSubmit)="onSubmit()">
                <pre>{{ form.value | json }}</pre>
                <fieldset [formArrayName]="'big_ass_array_of_objects'" class="form-group">
                    <div class="btn-group">
                        <button type="button" class="btn btn-primary btn-block btn-sm" (click)="getBigAssArrayOfObjectsFormArray().push(createBigAssArrayOfObjects())">
                            <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                            ADD BigAssArrayOfObjects
                        </button>
                    </div>
                    <div *ngFor="let _bigAssArrayOfObjects1 of getBigAssArrayOfObjectsFormArray()?.controls; let index1 = index;">
            
                        <div class="btn-group">
                            <button type="button" (click)="deleteBigAssArrayOfObjects(index1)" class="btn btn-danger btn-sm">
                                <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                DELETE BigAssArrayOfObjects
                            </button>
                        </div>
                        <fieldset [formArrayName]="index1" class="form-group">
                            <div class="btn-group">
                                <button type="button" class="btn btn-primary btn-block btn-sm" (click)="getBigAssArrayOfObjects1FormArray(index1).push(createBigAssArrayOfObjects1())">
                                    <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                    ADD BigAssArrayOfObjects1
                                </button>
                            </div>
                            <div *ngFor="let _bigAssArrayOfObjects2 of getBigAssArrayOfObjects1FormArray(index1)?.controls; let index2 = index;">
            
                                <div class="btn-group">
                                    <button type="button" (click)="deleteBigAssArrayOfObjects1(index1,index2)" class="btn btn-danger btn-sm">
                                        <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                        DELETE BigAssArrayOfObjects1
                                    </button>
                                </div>
                                <fieldset [formArrayName]="index2" class="form-group">
                                    <div class="btn-group">
                                        <button type="button" class="btn btn-primary btn-block btn-sm" (click)="getBigAssArrayOfObjects2FormArray(index1,index2).push(createBigAssArrayOfObjects2())">
                                            <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                            ADD BigAssArrayOfObjects2
                                        </button>
                                    </div>
                                    <div *ngFor="let _bigAssArrayOfObjects3 of getBigAssArrayOfObjects2FormArray(index1,index2)?.controls; let index3 = index;">
            
                                        <div class="btn-group">
                                            <button type="button" (click)="deleteBigAssArrayOfObjects2(index1,index2,index3)" class="btn btn-danger btn-sm">
                                                <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                                DELETE BigAssArrayOfObjects2
                                            </button>
                                        </div>
                                        <fieldset [formArrayName]="index3" class="form-group">
                                            <div class="btn-group">
                                                <button type="button" class="btn btn-primary btn-block btn-sm" (click)="getBigAssArrayOfObjects3FormArray(index1,index2,index3).push(createBigAssArrayOfObjects3())">
                                                    <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                                    ADD BigAssArrayOfObjects3
                                                </button>
                                            </div>
                                            <div *ngFor="let _bigAssArrayOfObjects4 of getBigAssArrayOfObjects3FormArray(index1,index2,index3)?.controls; let index4 = index;" [formGroupName]="index4">
            
                                                <div class="btn-group">
                                                    <button type="button" (click)="deleteBigAssArrayOfObjects3(index1,index2,index3,index4)" class="btn btn-danger btn-sm">
                                                        <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                                        DELETE BigAssArrayOfObjects3
                                                    </button>
                                                </div>
                                                <fieldset [formArrayName]="'first_name'" class="form-group">
                                                    <div class="btn-group">
                                                        <button type="button" class="btn btn-primary btn-block btn-sm" (click)="getBigAssArrayOfObjectsFirstNameFormArray(index1,index2,index3,index4).push(createBigAssArrayOfObjectsFirstName())">
                                                            <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                                            ADD BigAssArrayOfObjectsFirstName
                                                        </button>
                                                    </div>
                                                    <div *ngFor="let _bigAssArrayOfObjectsFirstName1 of getBigAssArrayOfObjectsFirstNameFormArray(index1,index2,index3,index4)?.controls; let index5 = index;">
                                                        <div class="btn-group">
                                                            <button type="button" (click)="deleteBigAssArrayOfObjectsFirstName(index1,index2,index3,index4,index5)" class="btn btn-danger btn-sm">
                                                                <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                                                DELETE BigAssArrayOfObjectsFirstName
                                                            </button>
                                                        </div>
                                                        <div class="form-group" *ngIf="getField(['big_ass_array_of_objects',index1,index2,index3,index4,'first_name',index5]) as field">
                                                            <label [for]="field.id">{{ field.id }}</label>
                                                            <input type="text" [formControlName]="index5" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                                            <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                                                <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                                                <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 3</div>
                                                                <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </fieldset>
                                                <fieldset [formArrayName]="'last_name'" class="form-group">
                                                    <div class="btn-group">
                                                        <button type="button" class="btn btn-primary btn-block btn-sm" (click)="getBigAssArrayOfObjectsLastNameFormArray(index1,index2,index3,index4).push(createBigAssArrayOfObjectsLastName())">
                                                            <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                                            ADD BigAssArrayOfObjectsLastName
                                                        </button>
                                                    </div>
                                                    <div *ngFor="let _bigAssArrayOfObjectsLastName1 of getBigAssArrayOfObjectsLastNameFormArray(index1,index2,index3,index4)?.controls; let index5 = index;">
                                                        <div class="btn-group">
                                                            <button type="button" (click)="deleteBigAssArrayOfObjectsLastName(index1,index2,index3,index4,index5)" class="btn btn-danger btn-sm">
                                                                <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                                                DELETE BigAssArrayOfObjectsLastName
                                                            </button>
                                                        </div>
                                                        <fieldset [formArrayName]="index5" class="form-group">
                                                            <div class="btn-group">
                                                                <button type="button" class="btn btn-primary btn-block btn-sm" (click)="getBigAssArrayOfObjectsLastName1FormArray(index1,index2,index3,index4,index5).push(createBigAssArrayOfObjectsLastName1())">
                                                                    <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                                                    ADD BigAssArrayOfObjectsLastName1
                                                                </button>
                                                            </div>
                                                            <div *ngFor="let _bigAssArrayOfObjectsLastName2 of getBigAssArrayOfObjectsLastName1FormArray(index1,index2,index3,index4,index5)?.controls; let index6 = index;">
                                                                <div class="btn-group">
                                                                    <button type="button" (click)="deleteBigAssArrayOfObjectsLastName1(index1,index2,index3,index4,index5,index6)" class="btn btn-danger btn-sm">
                                                                        <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                                                        DELETE BigAssArrayOfObjectsLastName1
                                                                    </button>
                                                                </div>
                                                                <div class="form-group" *ngIf="getField(['big_ass_array_of_objects',index1,index2,index3,index4,'last_name',index5,index6]) as field">
                                                                    <label [for]="field.id">{{ field.id }}</label>
                                                                    <input type="text" [formControlName]="index6" [id]="field.id" class="form-control" [class.is-invalid]="field.isFieldValid">
                                                                    <div *ngIf="field.isFieldValid" class="invalid-feedback">
                                                                        <div *ngIf="field.abstractControl!.hasError('required')">{{ field.id.toUpperCase() }} is required</div>
                                                                        <div *ngIf="field.abstractControl!.hasError('minlength')">{{ field.id.toUpperCase() }} min must be 3</div>
                                                                        <div *ngIf="field.abstractControl!.hasError('maxlength')">{{ field.id.toUpperCase() }} max must be 255</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </fieldset>
                                                    </div>
                                                </fieldset>
                                            </div>
                                        </fieldset>
                                    </div>
                                </fieldset>
                            </div>
                        </fieldset>
                    </div>
                </fieldset>
                <button type="submit" class="btn btn-primary">
                    Submit
                </button>
            </form>`)
            )
    })

    // it('4', () => {
    //     const reactiveDrivenHtml = new ReactiveDrivenHtml(
    //     );
    //     const response = reactiveDrivenHtml.generate();
    //     expect(
    //         html_beautify(response.join("\n"))
    //     )
    //         .toBe(
    //             html_beautify(``)
    //         )
    // })    
});
