import { ReactiveDrivenValidator } from './reactive-driven-validator';
import { html_beautify, js_beautify } from 'js-beautify';

describe('reactiveDrivenValidator', () => {
  beforeEach(() => {});

  it('1', () => {
    const reactiveDrivenValidator = new ReactiveDrivenValidator(
      {
        movies: [
          {
            'adult-hadouken': 'nullable|boolean',
            backdrop_path: 'nullable|string',
            belongs_to_collection: 'nullable',
            budget: 'nullable|html:number|integer',
            'genres-EMESME': {
              id: 'nullable|html:number|integer',
              production_companies: [
                [
                  {
                    production_countries: {
                      iso_3166_1: 'nullable|min:2|max:2',
                      name: 'nullable|min:2|max:255',
                    },
                    id: 'html:number|nullable',
                    logo_path: 'nullable|string',
                    name: 'nullable|min:2|max:255',
                    origin_country: 'nullable|min:2|max:2',
                  },
                ],
              ],
              name: 'nullable|html:text|min:2|max:255',
            },
            homepage: 'nullable|html:text|string',
            id: 'nullable|html:number|integer|min:2|max:25',
            imdb_id: 'nullable|string|min:9|max:9',
            original_language: 'nullable|string|min:2|max:2',
            original_title: 'nullable|string|min:2|max:255',
            overview: 'nullable|html:textarea|string|min:2|max:4000',
            popularity: 'nullable|html:number|numeric',
            poster_path: 'nullable|html:text|string',
            release_date: 'html:date|nullable|date_format:Y-m-d',
            revenue: 'html:number|nullable',
            runtime: 'html:number|nullable',
            spoken_languages: {
              iso_639_1: 'nullable|min:2|max:2',
              name: 'nullable|min:2|max:255',
            },
            tagline: 'nullable|min:2|max:255',
            title: 'nullable|min:2|max:255',
            video: 'nullable|boolean',
            vote_average: 'nullable|html:number|number|min:2|max:255',
            vote_count: 'nullable|html:number|integer|min:2|max:255',
          },
          {
            adult: 'nullable|boolean',
            backdrop_path: 'nullable|string',
            belongs_to_collection: 'nullable',
            budget: 'nullable|html:number|integer',
            genres: {
              id: 'nullable|html:number|integer',
              production_companies: [
                [
                  {
                    production_countriesasdasdasdasdasdasdasd: {
                      iso_3166_1: 'nullable|min:2|max:2',
                      name: 'nullable|min:2|max:255',
                    },
                    id: 'html:number|nullable',
                    logo_path: 'nullable|string',
                    name: 'nullable|min:2|max:255',
                    origin_country: 'nullable|min:2|max:2',
                  },
                  {
                    production_countries: {
                      iso_3166_1: 'nullable|min:2|max:2',
                      name: 'nullable|min:2|max:255',
                    },
                    id: 'html:number|nullable',
                    logo_path: 'nullable|string',
                    name: 'nullable|min:2|max:255',
                    origin_country: 'nullable|min:2|max:2',
                  },
                ],
              ],
              name: 'nullable|html:text|min:2|max:255',
            },
            homepage: 'nullable|html:text|string',
            id: 'nullable|html:number|integer|min:2|max:25',
            imdb_id: 'nullable|string|min:9|max:9',
            original_language: 'nullable|string|min:2|max:2',
            original_title: 'nullable|string|min:2|max:255',
            overview: 'nullable|html:textarea|string|min:2|max:4000',
            popularity: 'nullable|html:number|numeric',
            poster_path: 'nullable|html:text|string',
            release_date: 'html:date|nullable|date_format:Y-m-d',
            revenue: 'html:number|nullable',
            runtime: 'html:number|nullable',
            spoken_languages: {
              iso_639_1: 'nullable|min:2|max:2',
              name: 'nullable|min:2|max:255',
            },
            tagline: 'nullable|min:2|max:255',
            title: 'nullable|min:2|max:255',
            video: 'nullable|boolean',
            vote_average: 'nullable|html:number|number|min:2|max:255',
            vote_count: 'nullable|html:number|integer|min:2|max:255',
          },
        ],
      },
      'task-form',
    );
    const response = reactiveDrivenValidator.generateComponent();
    // console.log(js_beautify(response.join("\n")));
    expect(js_beautify(response.join('\n'))).toBe(
      js_beautify(`import {
            Component,
            OnInit
        } from '@angular/core'
        import {
            Validators,
            FormControl,
            AbstractControl,
            FormGroup,
            FormBuilder,
            FormArray,
            ValidatorFn
        } from '@angular/forms'
        import {
            Observable,
            of
        } from 'rxjs';
        import {
            delay,
            shareReplay
        } from 'rxjs/operators';
        
        @Component({
            selector: 'app-task-form',
            templateUrl: './task-form.component.html',
            styleUrls: ['./task-form.component.css']
        })
        export class TaskFormComponent implements OnInit {
            form!: FormGroup;
            formSubmitAttempt: boolean = false;
        
            constructor(
                private formBuilder: FormBuilder
            ) {}
        
            ngOnInit(): void {
        
                this.form = this.formBuilder.group({
                    "movies": this.formBuilder.array([
                        this.createMovies()
                    ]),
                });
            }
        
            onSubmit(): void {
                this.formSubmitAttempt = true;
                if (this.f.valid) {
                    console.log('form submitted');
                } else {
                    this.validateAllFormFields(this.f);
                }
            }
        
            validateAllFormFields(control: AbstractControl): void {
                if (control instanceof FormControl) {
                    control.markAsTouched({
                        onlySelf: true
                    });
                } else if (control instanceof FormGroup) {
                    Object.keys(control.controls).forEach((field: string) => {
                        const groupControl = control.get(field) !;
                        this.validateAllFormFields(groupControl);
                    });
                } else if (control instanceof FormArray) {
                    const controlAsFormArray = control as FormArray;
                    controlAsFormArray.controls.forEach((arrayControl: AbstractControl) => this.validateAllFormFields(arrayControl));
                }
            }
        
            getField(path: (string | number)[] | string): {
                name: string,
                id: string,
                abstractControl: AbstractControl | null | any,
                isFieldValid: boolean | undefined
            } {
                return {
                    name: typeof path === 'string' ? path : path.join('.'),
                    id: typeof path === 'string' ? path : path.join('-'),
                    abstractControl: this.f.get(path),
                    isFieldValid: this.f.get(path)?.invalid && this.f.get(path)?.touched
                }
            }
        
            get f(): FormGroup {
                return this.form as FormGroup;
            }
        
        
            getMoviesGenresProductionCompaniesFormArray(index1: number): FormArray {
                return this.f.get(['movies', index1, 'genres', 'production_companies']) as FormArray;
            }
            deleteMoviesGenresProductionCompanies(index1: number, index2: number): void {
                this.getMoviesGenresProductionCompaniesFormArray(index1).removeAt(index2)
            }
            createMoviesGenresProductionCompanies() {
                return this.formBuilder.array([
                    this.createMoviesGenresProductionCompanies1()
                ])
            }
            getMoviesGenresProductionCompanies1FormArray(index1: number, index2: number): FormArray {
                return this.f.get(['movies', index1, 'genres', 'production_companies', index2]) as FormArray;
            }
            deleteMoviesGenresProductionCompanies1(index1: number, index2: number, index3: number): void {
                this.getMoviesGenresProductionCompanies1FormArray(index1, index2).removeAt(index3)
            }
            createMoviesGenresProductionCompanies1() {
                return this.formBuilder.group({
                    "production_countries": this.formBuilder.group({
                        "iso_3166_1": ['', [Validators.minLength(2), Validators.maxLength(2)]],
                        "name": ['', [Validators.minLength(2), Validators.maxLength(255)]],
                    }),
                    "id": ['', []],
                    "logo_path": ['', []],
                    "name": ['', [Validators.minLength(2), Validators.maxLength(255)]],
                    "origin_country": ['', [Validators.minLength(2), Validators.maxLength(2)]],
                })
            }
            getMoviesFormArray(): FormArray {
                return this.f.get(['movies']) as FormArray;
            }
            deleteMovies(index1: number): void {
                this.getMoviesFormArray().removeAt(index1)
            }
            createMovies() {
                return this.formBuilder.group({
                    "adult": ['', []],
                    "backdrop_path": ['', []],
                    "belongs_to_collection": ['', []],
                    "budget": ['', []],
                    "genres": this.formBuilder.group({
                        "id": ['', []],
                        "production_companies": this.formBuilder.array([
                            this.createMoviesGenresProductionCompanies()
                        ]),
                        "name": ['', [Validators.minLength(2), Validators.maxLength(255)]],
                    }),
                    "homepage": ['', []],
                    "id": ['', [Validators.minLength(2), Validators.maxLength(25)]],
                    "imdb_id": ['', [Validators.minLength(9), Validators.maxLength(9)]],
                    "original_language": ['', [Validators.minLength(2), Validators.maxLength(2)]],
                    "original_title": ['', [Validators.minLength(2), Validators.maxLength(255)]],
                    "overview": ['', [Validators.minLength(2), Validators.maxLength(4000)]],
                    "popularity": ['', []],
                    "poster_path": ['', []],
                    "release_date": ['', []],
                    "revenue": ['', []],
                    "runtime": ['', []],
                    "spoken_languages": this.formBuilder.group({
                        "iso_639_1": ['', [Validators.minLength(2), Validators.maxLength(2)]],
                        "name": ['', [Validators.minLength(2), Validators.maxLength(255)]],
                    }),
                    "tagline": ['', [Validators.minLength(2), Validators.maxLength(255)]],
                    "title": ['', [Validators.minLength(2), Validators.maxLength(255)]],
                    "video": ['', []],
                    "vote_average": ['', [Validators.minLength(2), Validators.maxLength(255)]],
                    "vote_count": ['', [Validators.minLength(2), Validators.maxLength(255)]],
                })
            }
        }
        `),
    );
  });

  it('2', () => {
    const reactiveDrivenValidator = new ReactiveDrivenValidator(
      {
        accounting: [
          {
            firstName: 'required',
            lastName: 'required',
            age: 'required|max:30',
          },
        ],
        sales: [
          {
            firstName: 'required',
            lastName: 'required',
            age: 'required|max:30',
          },
        ],
      },
      'task-form',
    );
    const response = reactiveDrivenValidator.generateComponent();
    // console.log(js_beautify(response.join("\n")));
    expect(js_beautify(response.join('\n'))).toBe(
      js_beautify(`import {
                Component,
                OnInit
            } from '@angular/core'
            import {
                Validators,
                FormControl,
                AbstractControl,
                FormGroup,
                FormBuilder,
                FormArray,
                ValidatorFn
            } from '@angular/forms'
            import {
                Observable,
                of
            } from 'rxjs';
            import {
                delay,
                shareReplay
            } from 'rxjs/operators';
            
            @Component({
                selector: 'app-task-form',
                templateUrl: './task-form.component.html',
                styleUrls: ['./task-form.component.css']
            })
            export class TaskFormComponent implements OnInit {
                form!: FormGroup;
                formSubmitAttempt: boolean = false;
            
                constructor(
                    private formBuilder: FormBuilder
                ) {}
            
                ngOnInit(): void {
            
                    this.form = this.formBuilder.group({
                        "accounting": this.formBuilder.array([
                            this.createAccounting()
                        ]),
                        "sales": this.formBuilder.array([
                            this.createSales()
                        ]),
                    });
                }
            
                onSubmit(): void {
                    this.formSubmitAttempt = true;
                    if (this.f.valid) {
                        console.log('form submitted');
                    } else {
                        this.validateAllFormFields(this.f);
                    }
                }
            
                validateAllFormFields(control: AbstractControl): void {
                    if (control instanceof FormControl) {
                        control.markAsTouched({
                            onlySelf: true
                        });
                    } else if (control instanceof FormGroup) {
                        Object.keys(control.controls).forEach((field: string) => {
                            const groupControl = control.get(field) !;
                            this.validateAllFormFields(groupControl);
                        });
                    } else if (control instanceof FormArray) {
                        const controlAsFormArray = control as FormArray;
                        controlAsFormArray.controls.forEach((arrayControl: AbstractControl) => this.validateAllFormFields(arrayControl));
                    }
                }
            
                getField(path: (string | number)[] | string): {
                    name: string,
                    id: string,
                    abstractControl: AbstractControl | null | any,
                    isFieldValid: boolean | undefined
                } {
                    return {
                        name: typeof path === 'string' ? path : path.join('.'),
                        id: typeof path === 'string' ? path : path.join('-'),
                        abstractControl: this.f.get(path),
                        isFieldValid: this.f.get(path)?.invalid && this.f.get(path)?.touched
                    }
                }
            
                get f(): FormGroup {
                    return this.form as FormGroup;
                }
            
            
                getAccountingFormArray(): FormArray {
                    return this.f.get(['accounting']) as FormArray;
                }
                deleteAccounting(index1: number): void {
                    this.getAccountingFormArray().removeAt(index1)
                }
                createAccounting() {
                    return this.formBuilder.group({
                        "firstName": ['', [Validators.required]],
                        "lastName": ['', [Validators.required]],
                        "age": ['', [Validators.required, Validators.maxLength(30)]],
                    })
                }
                getSalesFormArray(): FormArray {
                    return this.f.get(['sales']) as FormArray;
                }
                deleteSales(index1: number): void {
                    this.getSalesFormArray().removeAt(index1)
                }
                createSales() {
                    return this.formBuilder.group({
                        "firstName": ['', [Validators.required]],
                        "lastName": ['', [Validators.required]],
                        "age": ['', [Validators.required, Validators.maxLength(30)]],
                    })
                }
            }
        `),
    );
  });

  it('3', () => {
    const reactiveDrivenValidator = new ReactiveDrivenValidator(
      {
        users: [
          {
            name: {
              first: 'html:text|required|min:3|max:255',
              middle: 'html:text|nullable|min:3|max:255',
              last: 'html:text|required|min:3|max:255',
            },
            username: 'html:text|required|min:3|max:10',
            password: 'html:password|required|min:3|max:10',
            emails: ['html:email|required|min:10|max:40'],
            contacts: [
              {
                name: 'required|min:3|max:255',
                email: 'required|email|max:255',
              },
            ],
            medications: [
              {
                medication_name: 'required|min:3|max:255',
                medication_details: 'html:textarea|nullable|min:3|max:4000',
              },
            ],
            phoneNumber: 'html:text|required|min:4|max:15',
            location: {
              street: 'html:text|required|min:4|max:15',
              city: 'html:text|required|min:4|max:15',
              state: 'html:text|required|min:4|max:15',
              country: 'html:text|required|min:4|max:15',
              zip: 'html:number|required|min:4|max:15',
              coordinates: {
                latitude: 'html:number|required|min:1|max:255',
                longitude: 'html:number|required|min:1|max:255',
              },
            },
            website: 'html:text|required|min:5|max:255',
            domain: 'html:text|required|min:5|max:255',
            job: {
              title: 'html:text|required|min:1|max:255',
              descriptor: 'html:text|required|min:1|max:255',
              area: 'html:text|required|min:4|max:255',
              type: 'html:text|required|min:4|max:255',
              company: 'html:text|required|min:4|max:255',
            },
            creditCard: {
              number: 'html:text|required|min:4|max:40',
              cvv: 'html:number|required|min:4|max:15',
              issuer: 'html:text|required|min:3|max:3',
            },
          },
        ],
      },
      'task-form',
    );
    const response = reactiveDrivenValidator.generateComponent();
    expect(js_beautify(response.join('\n'))).toBe(
      js_beautify(`import {
                    Component,
                    OnInit
                } from '@angular/core'
                import {
                    Validators,
                    FormControl,
                    AbstractControl,
                    FormGroup,
                    FormBuilder,
                    FormArray,
                    ValidatorFn
                } from '@angular/forms'
                import {
                    Observable,
                    of
                } from 'rxjs';
                import {
                    delay,
                    shareReplay
                } from 'rxjs/operators';
                
                @Component({
                    selector: 'app-task-form',
                    templateUrl: './task-form.component.html',
                    styleUrls: ['./task-form.component.css']
                })
                export class TaskFormComponent implements OnInit {
                    form!: FormGroup;
                    formSubmitAttempt: boolean = false;
                
                    constructor(
                        private formBuilder: FormBuilder
                    ) {}
                
                    ngOnInit(): void {
                
                        this.form = this.formBuilder.group({
                            "users": this.formBuilder.array([
                                this.createUsers()
                            ]),
                        });
                    }
                
                    onSubmit(): void {
                        this.formSubmitAttempt = true;
                        if (this.f.valid) {
                            console.log('form submitted');
                        } else {
                            this.validateAllFormFields(this.f);
                        }
                    }
                
                    validateAllFormFields(control: AbstractControl): void {
                        if (control instanceof FormControl) {
                            control.markAsTouched({
                                onlySelf: true
                            });
                        } else if (control instanceof FormGroup) {
                            Object.keys(control.controls).forEach((field: string) => {
                                const groupControl = control.get(field) !;
                                this.validateAllFormFields(groupControl);
                            });
                        } else if (control instanceof FormArray) {
                            const controlAsFormArray = control as FormArray;
                            controlAsFormArray.controls.forEach((arrayControl: AbstractControl) => this.validateAllFormFields(arrayControl));
                        }
                    }
                
                    getField(path: (string | number)[] | string): {
                        name: string,
                        id: string,
                        abstractControl: AbstractControl | null | any,
                        isFieldValid: boolean | undefined
                    } {
                        return {
                            name: typeof path === 'string' ? path : path.join('.'),
                            id: typeof path === 'string' ? path : path.join('-'),
                            abstractControl: this.f.get(path),
                            isFieldValid: this.f.get(path)?.invalid && this.f.get(path)?.touched
                        }
                    }
                
                    get f(): FormGroup {
                        return this.form as FormGroup;
                    }
                
                
                    getUsersEmailsFormArray(index1: number): FormArray {
                        return this.f.get(['users', index1, 'emails']) as FormArray;
                    }
                    deleteUsersEmails(index1: number, index2: number): void {
                        this.getUsersEmailsFormArray(index1).removeAt(index2)
                    }
                    createUsersEmails() {
                        return this.formBuilder.control('', [Validators.required, Validators.minLength(10), Validators.maxLength(40)]);
                    }
                    getUsersContactsFormArray(index1: number): FormArray {
                        return this.f.get(['users', index1, 'contacts']) as FormArray;
                    }
                    deleteUsersContacts(index1: number, index2: number): void {
                        this.getUsersContactsFormArray(index1).removeAt(index2)
                    }
                    createUsersContacts() {
                        return this.formBuilder.group({
                            "name": ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
                            "email": ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
                        })
                    }
                    getUsersMedicationsFormArray(index1: number): FormArray {
                        return this.f.get(['users', index1, 'medications']) as FormArray;
                    }
                    deleteUsersMedications(index1: number, index2: number): void {
                        this.getUsersMedicationsFormArray(index1).removeAt(index2)
                    }
                    createUsersMedications() {
                        return this.formBuilder.group({
                            "medication_name": ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
                            "medication_details": ['', [Validators.minLength(3), Validators.maxLength(4000)]],
                        })
                    }
                    getUsersFormArray(): FormArray {
                        return this.f.get(['users']) as FormArray;
                    }
                    deleteUsers(index1: number): void {
                        this.getUsersFormArray().removeAt(index1)
                    }
                    createUsers() {
                        return this.formBuilder.group({
                            "name": this.formBuilder.group({
                                "first": ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
                                "middle": ['', [Validators.minLength(3), Validators.maxLength(255)]],
                                "last": ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
                            }),
                            "username": ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
                            "password": ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
                            "emails": this.formBuilder.array([
                                this.createUsersEmails()
                            ]),
                            "contacts": this.formBuilder.array([
                                this.createUsersContacts()
                            ]),
                            "medications": this.formBuilder.array([
                                this.createUsersMedications()
                            ]),
                            "phoneNumber": ['', [Validators.required, Validators.minLength(4), Validators.maxLength(15)]],
                            "location": this.formBuilder.group({
                                "street": ['', [Validators.required, Validators.minLength(4), Validators.maxLength(15)]],
                                "city": ['', [Validators.required, Validators.minLength(4), Validators.maxLength(15)]],
                                "state": ['', [Validators.required, Validators.minLength(4), Validators.maxLength(15)]],
                                "country": ['', [Validators.required, Validators.minLength(4), Validators.maxLength(15)]],
                                "zip": ['', [Validators.required, Validators.minLength(4), Validators.maxLength(15)]],
                                "coordinates": this.formBuilder.group({
                                    "latitude": ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
                                    "longitude": ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
                                }),
                            }),
                            "website": ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]],
                            "domain": ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]],
                            "job": this.formBuilder.group({
                                "title": ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
                                "descriptor": ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
                                "area": ['', [Validators.required, Validators.minLength(4), Validators.maxLength(255)]],
                                "type": ['', [Validators.required, Validators.minLength(4), Validators.maxLength(255)]],
                                "company": ['', [Validators.required, Validators.minLength(4), Validators.maxLength(255)]],
                            }),
                            "creditCard": this.formBuilder.group({
                                "number": ['', [Validators.required, Validators.minLength(4), Validators.maxLength(40)]],
                                "cvv": ['', [Validators.required, Validators.minLength(4), Validators.maxLength(15)]],
                                "issuer": ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
                            }),
                        })
                    }
                }`),
    );
  });

  it('4', () => {
    const reactiveDrivenValidator = new ReactiveDrivenValidator(
      {
        big_ass_array_of_objects: [
          [
            [
              [
                {
                  first_name: ['required|min:3|max:255'],
                  last_name: [['required|min:3|max:255']],
                },
              ],
            ],
          ],
        ],
      },
      'task-form',
    );
    const response = reactiveDrivenValidator.generateComponent();
    expect(js_beautify(response.join('\n'))).toBe(
      js_beautify(`import {
                    Component,
                    OnInit
                } from '@angular/core'
                import {
                    Validators,
                    FormControl,
                    AbstractControl,
                    FormGroup,
                    FormBuilder,
                    FormArray,
                    ValidatorFn
                } from '@angular/forms'
                import {
                    Observable,
                    of
                } from 'rxjs';
                import {
                    delay,
                    shareReplay
                } from 'rxjs/operators';
                
                @Component({
                    selector: 'app-task-form',
                    templateUrl: './task-form.component.html',
                    styleUrls: ['./task-form.component.css']
                })
                export class TaskFormComponent implements OnInit {
                    form!: FormGroup;
                    formSubmitAttempt: boolean = false;
                
                    constructor(
                        private formBuilder: FormBuilder
                    ) {}
                
                    ngOnInit(): void {
                
                        this.form = this.formBuilder.group({
                            "big_ass_array_of_objects": this.formBuilder.array([
                                this.createBigAssArrayOfObjects()
                            ]),
                        });
                    }
                
                    onSubmit(): void {
                        this.formSubmitAttempt = true;
                        if (this.f.valid) {
                            console.log('form submitted');
                        } else {
                            this.validateAllFormFields(this.f);
                        }
                    }
                
                    validateAllFormFields(control: AbstractControl): void {
                        if (control instanceof FormControl) {
                            control.markAsTouched({
                                onlySelf: true
                            });
                        } else if (control instanceof FormGroup) {
                            Object.keys(control.controls).forEach((field: string) => {
                                const groupControl = control.get(field) !;
                                this.validateAllFormFields(groupControl);
                            });
                        } else if (control instanceof FormArray) {
                            const controlAsFormArray = control as FormArray;
                            controlAsFormArray.controls.forEach((arrayControl: AbstractControl) => this.validateAllFormFields(arrayControl));
                        }
                    }
                
                    getField(path: (string | number)[] | string): {
                        name: string,
                        id: string,
                        abstractControl: AbstractControl | null | any,
                        isFieldValid: boolean | undefined
                    } {
                        return {
                            name: typeof path === 'string' ? path : path.join('.'),
                            id: typeof path === 'string' ? path : path.join('-'),
                            abstractControl: this.f.get(path),
                            isFieldValid: this.f.get(path)?.invalid && this.f.get(path)?.touched
                        }
                    }
                
                    get f(): FormGroup {
                        return this.form as FormGroup;
                    }
                
                
                    getBigAssArrayOfObjectsFirstNameFormArray(index1: number, index2: number, index3: number, index4: number): FormArray {
                        return this.f.get(['big_ass_array_of_objects', index1, index2, index3, index4, 'first_name']) as FormArray;
                    }
                    deleteBigAssArrayOfObjectsFirstName(index1: number, index2: number, index3: number, index4: number, index5: number): void {
                        this.getBigAssArrayOfObjectsFirstNameFormArray(index1, index2, index3, index4).removeAt(index5)
                    }
                    createBigAssArrayOfObjectsFirstName() {
                        return this.formBuilder.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]);
                    }
                    getBigAssArrayOfObjectsLastNameFormArray(index1: number, index2: number, index3: number, index4: number): FormArray {
                        return this.f.get(['big_ass_array_of_objects', index1, index2, index3, index4, 'last_name']) as FormArray;
                    }
                    deleteBigAssArrayOfObjectsLastName(index1: number, index2: number, index3: number, index4: number, index5: number): void {
                        this.getBigAssArrayOfObjectsLastNameFormArray(index1, index2, index3, index4).removeAt(index5)
                    }
                    createBigAssArrayOfObjectsLastName() {
                        return this.formBuilder.array([
                            this.createBigAssArrayOfObjectsLastName1()
                        ])
                    }
                    getBigAssArrayOfObjectsLastName1FormArray(index1: number, index2: number, index3: number, index4: number, index5: number): FormArray {
                        return this.f.get(['big_ass_array_of_objects', index1, index2, index3, index4, 'last_name', index5]) as FormArray;
                    }
                    deleteBigAssArrayOfObjectsLastName1(index1: number, index2: number, index3: number, index4: number, index5: number, index6: number): void {
                        this.getBigAssArrayOfObjectsLastName1FormArray(index1, index2, index3, index4, index5).removeAt(index6)
                    }
                    createBigAssArrayOfObjectsLastName1() {
                        return this.formBuilder.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]);
                    }
                    getBigAssArrayOfObjectsFormArray(): FormArray {
                        return this.f.get(['big_ass_array_of_objects']) as FormArray;
                    }
                    deleteBigAssArrayOfObjects(index1: number): void {
                        this.getBigAssArrayOfObjectsFormArray().removeAt(index1)
                    }
                    createBigAssArrayOfObjects() {
                        return this.formBuilder.array([
                            this.createBigAssArrayOfObjects1()
                        ])
                    }
                    getBigAssArrayOfObjects1FormArray(index1: number): FormArray {
                        return this.f.get(['big_ass_array_of_objects', index1]) as FormArray;
                    }
                    deleteBigAssArrayOfObjects1(index1: number, index2: number): void {
                        this.getBigAssArrayOfObjects1FormArray(index1).removeAt(index2)
                    }
                    createBigAssArrayOfObjects1() {
                        return this.formBuilder.array([
                            this.createBigAssArrayOfObjects2()
                        ])
                    }
                    getBigAssArrayOfObjects2FormArray(index1: number, index2: number): FormArray {
                        return this.f.get(['big_ass_array_of_objects', index1, index2]) as FormArray;
                    }
                    deleteBigAssArrayOfObjects2(index1: number, index2: number, index3: number): void {
                        this.getBigAssArrayOfObjects2FormArray(index1, index2).removeAt(index3)
                    }
                    createBigAssArrayOfObjects2() {
                        return this.formBuilder.array([
                            this.createBigAssArrayOfObjects3()
                        ])
                    }
                    getBigAssArrayOfObjects3FormArray(index1: number, index2: number, index3: number): FormArray {
                        return this.f.get(['big_ass_array_of_objects', index1, index2, index3]) as FormArray;
                    }
                    deleteBigAssArrayOfObjects3(index1: number, index2: number, index3: number, index4: number): void {
                        this.getBigAssArrayOfObjects3FormArray(index1, index2, index3).removeAt(index4)
                    }
                    createBigAssArrayOfObjects3() {
                        return this.formBuilder.group({
                            "first_name": this.formBuilder.array([
                                this.createBigAssArrayOfObjectsFirstName()
                            ]),
                            "last_name": this.formBuilder.array([
                                this.createBigAssArrayOfObjectsLastName()
                            ]),
                        })
                    }
                }`),
    );
  });

  // it('4', () => {
  //     const reactiveDrivenValidator = new ReactiveDrivenValidator(
  //         {},
  //         "task-form"
  //     );
  //     const response = reactiveDrivenValidator.generateComponent();
  //     expect(
  //         js_beautify(response.join("\n"))
  //     )
  //         .toBe(
  //             js_beautify(``)
  //         )
  // });
});
