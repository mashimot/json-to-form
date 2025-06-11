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
      this.ecommerce(),
      this.user(),
      this.userMedications(),
      this.getMoviesDetails(),
      this.usersJson(),
      this.nestedArrayOfObjects()
    ]);
  }

  public getExampleByNumber(id: number): Observable<any> {
    return this.getExamples()
      .pipe(
        map(examples => examples[id]),
        map(example => example ? example.data : null)
      );
  }

  public ecommerce() {
    return {
      "name": "Ecommerce",
      "data": {
        "ecommerce": {
          "users": [
            {
              "userId": "U001",
              "name": "João Silva",
              "email": "joao.silva@email.com",
              "phone": "+55 11 91234-5678",
              "birthDate": "1988-03-25",
              "createdAt": "2024-12-01T08:00:00Z",
              "lastLogin": "2025-06-08T21:33:00Z",
              "isActive": true,
              "emailVerified": true,
              "role": "customer",
              "preferences": {
                "newsletterSubscribed": true,
                "preferredLanguage": "pt-BR",
                "currency": "BRL"
              },
              "security": {
                "twoFactorEnabled": true,
                "lastPasswordChange": "2025-01-20T14:00:00Z"
              },
              "addresses": [
                {
                  "addressId": "A001",
                  "street": "Rua das Flores, 123",
                  "city": "São Paulo",
                  "state": "SP",
                  "zip": "01234-567",
                  "country": "Brasil",
                  "type": "residential",
                  "isDefault": true,
                  "geoLocation": {
                    "lat": -23.55052,
                    "lng": -46.63331
                  }
                }
              ],
              "orders": [
                {
                  "orderId": "O1001",
                  "date": "2025-05-01T10:15:30Z",
                  "status": "delivered",
                  "shippingMethod": "PAC",
                  "deliveryEstimate": "2025-05-05",
                  "deliveredAt": "2025-05-04T16:22:00Z",
                  "returnEligibleUntil": "2025-05-14",
                  "couponUsed": {
                    "code": "MAIO10",
                    "discountAmount": 35.08
                  },
                  "payment": {
                    "method": "credit_card",
                    "transactionId": "TX1234567890",
                    "amount": 350.75,
                    "currency": "BRL",
                    "paidAt": "2025-05-01T10:20:00Z",
                    "installments": 3,
                    "cardBrand": "Visa",
                    "cardLast4": "1234"
                  },
                  "items": [
                    {
                      "productId": "P100",
                      "name": "Camiseta Básica",
                      "category": "Roupas",
                      "quantity": 2,
                      "priceUnit": 50,
                      "totalPrice": 100,
                      "attributes": {
                        "size": "M",
                        "color": "azul",
                        "material": "algodão"
                      },
                      "discount": 10,
                      "subtotal": 90,
                      "warehouseId": "WH01",
                      "returnable": true
                    }
                  ],
                  "shippingAddressId": "A002",
                  "tracking": [
                    {
                      "date": "2025-05-01T12:00:00Z",
                      "location": "Centro de Distribuição SP",
                      "status": "Despachado"
                    },
                    {
                      "date": "2025-05-03T09:45:00Z",
                      "location": "Unidade de Entrega SP Zona Oeste",
                      "status": "Saiu para entrega"
                    },
                    {
                      "date": "2025-05-04T16:22:00Z",
                      "location": "Residência do cliente",
                      "status": "Entregue"
                    }
                  ]
                }
              ],
              "reviews": [
                {
                  "reviewId": "R001",
                  "productId": "P100",
                  "rating": 4,
                  "comment": "Produto de boa qualidade, gostei do tecido.",
                  "date": "2025-04-15",
                  "helpfulVotes": 5,
                  "reviewedBy": "João Silva"
                }
              ],
              "wishlist": [
                {
                  "productId": "P300",
                  "addedAt": "2025-06-01T12:30:00Z"
                }
              ],
              "activityLog": [
                {
                  "date": "2025-05-01T09:00:00Z",
                  "action": "login",
                  "ip": "200.145.12.34",
                  "device": "mobile",
                  "browser": "Chrome",
                  "location": "São Paulo - SP"
                }
              ]
            }
          ],
          "products": [
            {
              "productId": "P200",
              "name": "Tênis Esportivo",
              "description": "Tênis para corrida com amortecimento avançado.",
              "brand": "FastRun",
              "categories": ["Calçados", "Esportes"],
              "tags": ["leve", "corrida", "masculino"],
              "price": 250.75,
              "priceHistory": [
                {
                  "date": "2025-04-01",
                  "oldPrice": 299.90,
                  "newPrice": 250.75
                }
              ],
              "stock": 80,
              "sku": "FR-TS-001",
              "createdAt": "2025-01-10T15:30:00Z",
              "updatedAt": "2025-05-01T14:00:00Z",
              "rating": 4.7,
              "reviewsCount": 134,
              "dimensions": {
                "weightKg": 0.85,
                "widthCm": 30,
                "heightCm": 12,
                "depthCm": 18
              },
              "shippingInfo": {
                "shipsFrom": "São Paulo",
                "freeShipping": true,
                "deliveryTimeDays": 5
              },
              "returnPolicy": {
                "returnable": true,
                "daysToReturn": 10
              },
              "variations": [
                {
                  "size": 40,
                  "color": "preto",
                  "stock": 20,
                  "sku": "FR-TS-001-BLK-40",
                  "ean": "7891234567890"
                },
                {
                  "size": 41,
                  "color": "azul",
                  "stock": 15,
                  "sku": "FR-TS-001-BLU-41",
                  "ean": "7891234567891"
                }
              ]
            }
          ]
        }
      }
    }
  }

  public nestedArrayOfObjects() {
    return {
      "name": "Nested Array of Objects",
      "data": {
        "nested_of_objects": [
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