import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class JsonToFormService {

  constructor() { }

  public getExamples(): Observable<any[]> {
    return of([
      this.user(),
      this.userMedications(),
      this.getMoviesDetails(),
      this.usersJson(),
      this.bigAssArrayOfObjects()
    ]);
  }

  public getExampleByNumber(id: number): Observable<any> {
    return this.getExamples()
      .pipe(
        map(examples => examples[id]),
        map(example => example ? example.data : null)
      );
  }

  public bigAssArrayOfObjects() {
    return {
      "name": "Big Ass Array of Objects",
      "data": {
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
    }
  }

  public getMoviesDetails() {
    return {
      "name": "https://developers.themoviedb.org/3/movies/get-movie-details",
      "data": {
        "adult": "nullable|boolean",
        "backdrop_path": "nullable|string",
        "belongs_to_collection": "nullable",
        "budget": "nullable|html:number|integer",
        "genres": {
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
        "production_companies": {
          "id": "html:number|nullable",
          "logo_path": "nullable|string",
          "name": "nullable|min:2|max:255",
          "origin_country": "nullable|min:2|max:2"
        },
        "production_countries": {
          "iso_3166_1": "nullable|min:2|max:2",
          "name": "nullable|min:2|max:255"
        },
        "release_date": "html:date|nullable|date_format:Y-m-d",
        "revenue": "html:number|nullable",
        "runtime": "html:number|nullable",
        "spoken_languages": {
          "iso_639_1": "nullable|min:2|max:2",
          "name": "nullable|min:2|max:255"
        },
        "status": [
          "nullable",
          "html:radio"
        ],
        "tagline": "nullable|min:2|max:255",
        "title": "nullable|min:2|max:255",
        "video": "nullable|boolean",
        "vote_average": "nullable|html:number|number|min:2|max:255",
        "vote_count": "nullable|html:number|integer|min:2|max:255"
      }
    }
  }

  public user() {
    return {
      name: 'user',
      data: {
        "users": [
          {
            "name": {
              "first": "html:text|required|min:3|max:255",
              "middle": "html:text|nullable|min:3|max:255",
              "last": "html:text|required|min:3|max:255"
            },
            "username": "html:text|required|min:3|max:10",
            "password": "html:password|required|min:3|max:10",
            "emails": [
              "html:email|required|min:10|max:40"
            ],
            "contacts": [
              {
                "name": "required|min:3|max:255",
                "email": "required|email|max:255"
              }
            ],
            "medications": [
              {
                "medication_name": "required|min:3|max:255",
                "medication_details": "html:textarea|nullable|min:3|max:4000"
              }
            ],
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
          }
        ]
      }
    }
  }

  public userMedications() {
    return {
      "name": "User Medication Form",
      "data": {
        "user": {
          "first_name": "required|min:30",
          "last_name": "required|min:2",
          "birthday_date": "required|html:date",
          "favorite_fruits": "required|min:30"
        },
        "has_diabetes": [
          "html:radio",
          "required"
        ],
        "contacts": {
          "name": "required|min:3|max:255",
          "email": "required|email|max:255"
        },
        "medications": {
          "medication_name": "required|min:3|max:255",
          "medication_details": "html:textarea|nullable|min:3|max:4000"
        }
      }
    }
  }

  public usersJson() {
    return {
      'name': "Users Form",
      'data': {
        'users': {
          'first_name': 'required|min:3|max:255',
          'last_name': 'required|min:3|max:255',
          'email': 'email|unique:users',
          'nickname': "nullable|min:3|max:255",
          'description': "html:textarea|required|min:3|max:4000",
          'birthdate': "html:date|required"
        }
      }
    }
  }
}