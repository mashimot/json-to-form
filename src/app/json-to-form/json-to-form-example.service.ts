import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JsonToFormExampleService {

  constructor() { }

  getExamples(){
    let examples: any[] = [
      this.userMedications(),
      this.usersJson(),
      this.bigAssArrayOfObjects(),
      this.user(),
      this.randomJson(),
    ];

    return examples;
  }

  getExampleByNumber(id: number){
    let examples: {
      [key: number]: any
    } = this.getExamples();
    
    return typeof examples[id] != 'undefined'
      ? examples[id]
      : null;
  }

  public bigAssArrayOfObjects(){
    return {
      "name": "Big Ass Array of Objects",
      "data": {
        "big_ass_array_of_objects.*.*.*.*.*.*.*.*": {
          first_name: "required|min:3|max:255",
          last_name: "required|min:3|max:255"
        }
      }
    }
  }

  public user(){
    return {
      "name": "User",
      "data": {
        "user": {
          "first_name": "required|min:30",
          "surname": "required|min:2",
          "cell": "required|html:number",
          "location.*": "required|min:30",
          "profession.*":  "required|min:3|max:255",
          "cars.*": {
            "model": "required|min:2",
            "year": "required|html:number|min:4|max:4",
            "value": "required|min:2|max:10"
          },
          "medications.*": {
            "medication_name": "required|min:3|max:255",
            "medication_details": "html:textarea|nullable|min:3|max:4000"
          }
        }
      }
    }
  }


  public userMedications(){
    return {
      "name": "User Medication Form",
      "data": {
        "user": {
          "first_name": "required|min:30",
          "last_name": "required|min:2",
          "birthday_date": "required|html:date",
          "favorite_fruits.*": "required|min:30"
        },
        "has_diabetes": [
          "html:radio",
          "required",
          [
            "true",
            "false"
          ]
        ],
        "contacts.*": {
          "name": "required|min:3|max:255",
          "email": "required|email|max:255"
        },
        "medications.*": {
          "medication_name": "required|min:3|max:255",
          "medication_details": "html:textarea|nullable|min:3|max:4000"
        }
      } 
    }
  }

  public usersJson(){
    return {
        'name': "Users Form",
        'data' : {
          'users': {
          'first_name': 'required|min:3|max:255',
          'last_name': 'required|min:3|max:255',
          'email.*': 'email|unique:users',
          'nickname': "nullable|min:3|max:255", 
          'description': "html:textarea|required|min:3|max:4000",
          'birthdate': "html:date|required"
        }
      }
    }
  }

  public randomJson(){
    return {
      'name': 'Random',
      'data': {
        "user": {
            "first_name": "required|min:30",
            "last_name": "required|min:2",
            "birthday_date": "required|html:date",
            "favorite_fruits.*": "required|min:30"
        },
        "password": "html:password|required|max:10",
        "rank": "html:text|required|numeric|",
        "is_new": "html:text|required|boolean",
        "is_active": "html:text|required|boolean",
        "type": "html:text|string|max:255",
        "tag": {
            "id": "html:hidden|required|numeric",
            "name": "html:text|string|max:255",
            "coin_counter": "html:number|required|numeric",
            "ico_counter": "html:number|required|min:3"
        },
        "favorite_bass_player": [
            "html:select",
            "required",
            [
                "Les Claypool",
                "Geddy Lee",
                "Flea",
                "Victor Wooten",
                "Jaco Pastorius"
            ]            
        ],
        "favorite_fruits.*": [
            "html:radio",
            "required",
            [{
                id: 1,
                name: "Banana"
            },{
                id: 2,
                name: "Apple"
            },{
                id: 3,
                name: "Pear"
            },{
                id: 4,
                name: "Pineapple"
            }] 
        ]
      }
    }
    
    ;
  }
}
