import { Injectable, NgZone } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/Rx';
import 'rxjs/add/operator/map';

var PouchDB = require('pouchdb');

@Injectable()
export class DataService {
  
  db: any;
  username: any;
  password: any;
  remote: any;
  data: any = [];
  url: any;
  results: any;
  api: any;

  constructor(private _http: Http, private zone: NgZone) { 
 
    // database name
    this.db = new PouchDB('todo');
    
    // cloudant login details
    this.username = '<your_user_name_here>';
    this.password = '<your_password_here>';    
    
    // cloudant, couchdb, couchbase remote url
    // eg - https://<your_host>.cloudant.com/todo
    this.remote = '<your_host_url>';

    // cloudant, couchdb, couchbase remote url
    // applicable when username/password set. 
    let options = {
      live: true,
      retry: true,
      continuous: true,
      auth: {
        username: this.username,
        password: this.password
      }
    };

    this.db.sync(this.remote, options);
    this.db.setMaxListeners(30);
    
  }

  initCall() {
    // make sure UI is initialised
    // correctly after sync.
    this.zone.run(() => {});
  }

  // NOTE: Another way to retrieve data via a REST call
  getUrl() {
      let headers = new Headers();      
      headers.append("Authorization", "Basic " + btoa(this.username + ":" + this.password)); 
      headers.append("Content-Type", "application/x-www-form-urlencoded");

      this.api = this.remote + '/_all_docs?include_docs=true';
      
      return new Promise(resolve => {
        this._http.get(this.api, {headers: headers})
              .map(res => res.json())
              .subscribe(data => {
                this.results = data;
                
                this.data = [];

                let docs = this.results.rows.map((row) => {
                  this.data.push(row.doc);
                });
                          
                resolve(this.data);

                this.db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
                    this.handleChange(change);
                });

              }); 
      });

  }

  addDocument(doc){
    this.db.put(doc);
  }
 
  deleteDocument(id) {
    this.db.remove(id);
  }

  getDocuments() {
    return new Promise(resolve => {
      this.db.allDocs({
        include_docs: true,
        limit: 30,
        descending: true
      }).then((result) => {
        this.data = [];

        let docs = result.rows.map((row) => {
          this.data.push(row.doc);
        });
 
        this.data.reverse();

        resolve(this.data);
        
        this.db.changes({live: true, since: 'now', include_docs: 
          true}).on('change', (change) => {
              this.handleChange(change);
        });

      }).catch((error) => {
 
        console.log(error);
 
      }); 
 
    });
 
  }
 
  handleChange(change){
 
    let changedDoc = null;
    let changedIndex = null;
 
    this.data.forEach((doc, index) => {
 
      if(doc._id === change.id){
        changedDoc = doc;
        changedIndex = index;
      }
 
    });
 
    //A document was deleted
    if(change.deleted){
      this.data.splice(changedIndex, 1);
    } 
    else {
 
      //A document was updated
      if(changedDoc){
        this.data[changedIndex] = change.doc;
      } 
      //A document was added
      else {
        this.data.push(change.doc);                
      }
 
    }
 
  }  

}
