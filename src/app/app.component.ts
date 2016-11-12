import { Component, Inject, NgZone } from '@angular/core';
import { DataService } from './services/data.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: any;
  form: FormGroup;
  messages: any = [];
  testing: any;

  constructor(public ft: FormBuilder, 
              public dataService: DataService,
              private zone: NgZone){

    this.form = this.ft.group({
      name: this.ft.group({
          testEvent: ["", Validators.required],
      }),
    }); 

  }
  
  ngOnInit() {
    // NOTE: run zone.run() (think of it as $rootScope.$apply() 
    // to make sure screen is refreshed correctly on 
    // initial UI load.   
    this.dataService.initCall();
  }
   
  ngAfterViewInit() {
    this.dataService.getDocuments().then((data) => {
      this.messages = data;  
    }).catch((ex) => {
      console.error('Error fetching users', ex);
    });

  }

  addData(event){
    event.preventDefault();
    let date = new Date();
    
    let newDoc = {
        '_id': date,
        'message': date.getTime(),
        'moreandmore': this.form.value.name.testEvent
    };

    this.dataService.addDocument(newDoc);
    this.form.reset();

  }

  deleteToDo(docId) {
    this.dataService.deleteDocument(docId);        
  }                                                                      

}
