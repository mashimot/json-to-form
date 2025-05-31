import { html_beautify } from 'js-beautify';
import { FrameworkType, ReactiveDrivenHtml } from './reactive-driven-html';

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
            },
            {
                showAddButton: false,
                showDeleteButton: false,
                framework: FrameworkType.DEFAULT
            }
        );
        const response = reactiveDrivenHtml.generate();
        const html = `
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <pre>{{ form.value | json }}</pre>
            <fieldset [formArrayName]="'movies'">
                <div *ngFor="let moviesCtrl of getMovies()?.controls; let index0 = index;">
                    <div [formGroupName]="index0">
                        <input type="text" [formControlName]="'adult'">
                        <input type="text" [formControlName]="'backdrop_path'">
                        <input type="text" [formControlName]="'belongs_to_collection'">
                        <input type="number" [formControlName]="'budget'">
                        <div [formGroupName]="'genres'">
                            <input type="number" [formControlName]="'id'">
                            <fieldset [formArrayName]="'production_companies'">
                                <div *ngFor="let moviesGenresProductionCompanies1Ctrl of getMoviesAtGenresProduction_companies(index0)?.controls; let index1 = index;">
                                    <fieldset [formArrayName]="index1">
                                        <div *ngFor="let moviesGenresProductionCompanies2Ctrl of getMoviesAtGenresProduction_companiesAt(index0, index1)?.controls; let index2 = index;">
                                            <div [formGroupName]="index2">
                                                <div [formGroupName]="'production_countries'">
                                                    <input type="text" [formControlName]="'iso_3166_1'">
                                                    <input type="text" [formControlName]="'name'">
                                                </div>
                                                <input type="number" [formControlName]="'id'">
                                                <input type="text" [formControlName]="'logo_path'">
                                                <input type="text" [formControlName]="'name'">
                                                <input type="text" [formControlName]="'origin_country'">
                                            </div>
                                        </div>
                                    </fieldset>
                                </div>
                            </fieldset>
                            <input type="text" [formControlName]="'name'">
                        </div>
                        <input type="text" [formControlName]="'homepage'">
                        <input type="number" [formControlName]="'id'">
                        <input type="text" [formControlName]="'imdb_id'">
                        <input type="text" [formControlName]="'original_language'">
                        <input type="text" [formControlName]="'original_title'">
                        <textarea [formControlName]="'overview'" cols="30" rows="10"></textarea>
                        <input type="number" [formControlName]="'popularity'">
                        <input type="text" [formControlName]="'poster_path'">
                        <input type="date" [formControlName]="'release_date'">
                        <input type="number" [formControlName]="'revenue'">
                        <input type="number" [formControlName]="'runtime'">
                        <div [formGroupName]="'spoken_languages'">
                            <input type="text" [formControlName]="'iso_639_1'">
                            <input type="text" [formControlName]="'name'">
                        </div>
                        <input type="text" [formControlName]="'tagline'">
                        <input type="text" [formControlName]="'title'">
                        <input type="text" [formControlName]="'video'">
                        <input type="number" [formControlName]="'vote_average'">
                        <input type="number" [formControlName]="'vote_count'">
                    </div>
                </div>
            </fieldset>
            <button type="submit" class="btn btn-primary">
                Submit
            </button>
        </form>
        `
        expect(html_beautify(response.join("\n"))).toBe(html_beautify(html));
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
            },
            {
                showAddButton: false,
                showDeleteButton: false,
                framework: FrameworkType.DEFAULT
            }
        );
        const response = reactiveDrivenHtml.generate();
        const html = html_beautify(
            `
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <pre>{{ form.value | json }}</pre>
                <fieldset [formArrayName]="'accounting'">
                    <div *ngFor="let accountingCtrl of getAccounting()?.controls; let index0 = index;">
                        <div [formGroupName]="index0">
                            <input type="text" [formControlName]="'firstName'">
                            <input type="text" [formControlName]="'lastName'">
                            <input type="text" [formControlName]="'age'">
                        </div>
                    </div>
                </fieldset>
                <fieldset [formArrayName]="'sales'">
                    <div *ngFor="let salesCtrl of getSales()?.controls; let index0 = index;">
                        <div [formGroupName]="index0">
                            <input type="text" [formControlName]="'firstName'">
                            <input type="text" [formControlName]="'lastName'">
                            <input type="text" [formControlName]="'age'">
                        </div>
                    </div>
                </fieldset>
                <button type="submit" class="btn btn-primary">
                    Submit
                </button>
            </form>
        `
        );
        expect(html_beautify(response.join("\n"))).toBe(html)
    });

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
            },
            {
                showAddButton: false,
                showDeleteButton: false,
                framework: FrameworkType.DEFAULT
            }
        );
        const response = reactiveDrivenHtml.generate();
        const html = `
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <pre>{{ form.value | json }}</pre>
            <fieldset [formArrayName]="'users'">
                <div *ngFor="let usersCtrl of getUsers()?.controls; let index0 = index;">
                    <div [formGroupName]="index0">
                        <div [formGroupName]="'name'">
                            <input type="text" [formControlName]="'first'">
                            <input type="text" [formControlName]="'middle'">
                            <input type="text" [formControlName]="'last'">
                        </div>
                        <input type="text" [formControlName]="'username'">
                        <input type="password" [formControlName]="'password'">
                        <fieldset [formArrayName]="'emails'">
                            <div *ngFor="let usersEmails1Ctrl of getUsersAtEmails(index0)?.controls; let index1 = index;">
                                <input type="email" [formControlName]="index1">
                            </div>
                        </fieldset>
                        <fieldset [formArrayName]="'contacts'">
                            <div *ngFor="let usersContacts1Ctrl of getUsersAtContacts(index0)?.controls; let index1 = index;">
                                <div [formGroupName]="index1">
                                    <input type="text" [formControlName]="'name'">
                                    <input type="text" [formControlName]="'email'">
                                </div>
                            </div>
                        </fieldset>
                        <fieldset [formArrayName]="'medications'">
                            <div *ngFor="let usersMedications1Ctrl of getUsersAtMedications(index0)?.controls; let index1 = index;">
                                <div [formGroupName]="index1">
                                    <input type="text" [formControlName]="'medication_name'">
                                    <textarea [formControlName]="'medication_details'" cols="30" rows="10"></textarea>
                                </div>
                            </div>
                        </fieldset>
                        <input type="text" [formControlName]="'phoneNumber'">
                        <div [formGroupName]="'location'">
                            <input type="text" [formControlName]="'street'">
                            <input type="text" [formControlName]="'city'">
                            <input type="text" [formControlName]="'state'">
                            <input type="text" [formControlName]="'country'">
                            <input type="number" [formControlName]="'zip'">
                            <div [formGroupName]="'coordinates'">
                                <input type="number" [formControlName]="'latitude'">
                                <input type="number" [formControlName]="'longitude'">
                            </div>
                        </div>
                        <input type="text" [formControlName]="'website'">
                        <input type="text" [formControlName]="'domain'">
                        <div [formGroupName]="'job'">
                            <input type="text" [formControlName]="'title'">
                            <input type="text" [formControlName]="'descriptor'">
                            <input type="text" [formControlName]="'area'">
                            <input type="text" [formControlName]="'type'">
                            <input type="text" [formControlName]="'company'">
                        </div>
                        <div [formGroupName]="'creditCard'">
                            <input type="text" [formControlName]="'number'">
                            <input type="number" [formControlName]="'cvv'">
                            <input type="text" [formControlName]="'issuer'">
                        </div>
                    </div>
                </div>
            </fieldset>
            <button type="submit" class="btn btn-primary">
                Submit
            </button>
        </form>
        `
        expect(html_beautify(response.join("\n"))).toBe(html_beautify(html));
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
            },
            {
                showAddButton: false,
                showDeleteButton: false,
                framework: FrameworkType.DEFAULT
            }
        );
        const response = reactiveDrivenHtml.generate();
        const html = `
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <pre>{{ form.value | json }}</pre>
            <fieldset [formArrayName]="'big_ass_array_of_objects'">
                <div *ngFor="let bigAssArrayOfObjectsCtrl of getBig_ass_array_of_objects()?.controls; let index0 = index;">
                    <fieldset [formArrayName]="index0">
                        <div *ngFor="let bigAssArrayOfObjects1Ctrl of getBig_ass_array_of_objectsAt(index0)?.controls; let index1 = index;">
                            <fieldset [formArrayName]="index1">
                                <div *ngFor="let bigAssArrayOfObjects2Ctrl of getBig_ass_array_of_objectsAtAt(index0, index1)?.controls; let index2 = index;">
                                    <fieldset [formArrayName]="index2">
                                        <div *ngFor="let bigAssArrayOfObjects3Ctrl of getBig_ass_array_of_objectsAtAtAt(index0, index1, index2)?.controls; let index3 = index;">
                                            <div [formGroupName]="index3">
                                                <fieldset [formArrayName]="'first_name'">
                                                    <div *ngFor="let bigAssArrayOfObjectsFirstName4Ctrl of getBig_ass_array_of_objectsAtAtAtAtFirst_name(index0, index1, index2, index3)?.controls; let index4 = index;">
                                                        <input type="text" [formControlName]="index4">
                                                    </div>
                                                </fieldset>
                                                <fieldset [formArrayName]="'last_name'">
                                                    <div *ngFor="let bigAssArrayOfObjectsLastName4Ctrl of getBig_ass_array_of_objectsAtAtAtAtLast_name(index0, index1, index2, index3)?.controls; let index4 = index;">
                                                        <fieldset [formArrayName]="index4">
                                                            <div *ngFor="let bigAssArrayOfObjectsLastName5Ctrl of getBig_ass_array_of_objectsAtAtAtAtLast_nameAt(index0, index1, index2, index3, index4)?.controls; let index5 = index;">
                                                                <input type="text" [formControlName]="index5">
                                                            </div>
                                                        </fieldset>
                                                    </div>
                                                </fieldset>
                                            </div>
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
        </form>
        `
        expect(html_beautify(response.join("\n"))).toBe(html_beautify(html))
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
