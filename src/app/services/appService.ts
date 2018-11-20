import { Injectable , EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class AppService  {
  userSelected = new EventEmitter<any>();
  receivedMsgsObj = new EventEmitter<any>();
  receivedCurrentUserChat = new EventEmitter<any>();
  chatHistory = new EventEmitter<any>();

  constructor(private http: HttpClient) { }

  getUsersList(token, url) {
    return this.http.get(url, {
        headers: {'QB-Token': token, 'content-type': 'application/json'}
    });
  }
  getLoggedInUserDetails(url,token) {
    return this.http.get(url,{
      headers: {'QB-Token': token,'content-type':'application/json'}
    });
  }
  getChatId(url, token){
      return this.http.get(url,{
        headers: {'QB-Token': token,'content-type':'application/json'}
      });
  }
  getChatHistoryContent(url, token){
      return this.http.get(url,{
        headers: {'QB-Token': token,'content-type':'application/json'}
      });
  }
}
