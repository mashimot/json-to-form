import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JsonToFormExampleService {

  constructor() { }

  getExamples(){
    let examples: any[] = [
      this.userMedications(),
      this.randomJson(),
      this.usersJson(),
      
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
        'name': "User Form",
        'data' : {
          'users.*': {
          'email': 'email|unique:users',
          'first_name': 'required|min:3|max:255',
          'last_name': 'required|min:3|max:255',
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
