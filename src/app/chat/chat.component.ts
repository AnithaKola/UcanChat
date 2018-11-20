import { Component, OnInit , OnChanges, SimpleChanges, SimpleChange} from '@angular/core';
import { AppService } from '../services/appService';
import { Router } from '@angular/router';
import { APP_END_POINTS, APP_CREDENTIALS, urlsList } from '../constants';

declare var QB: any;
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnChanges {

  loginDetails: any;
  loginSessonData: any;
  recievedMsg: any;
  usersList: any = [];
  _userDetails: any = {};
  loggedInUSerId: any;
  userLastmsg : any = '';
  notifiedChatObj : any;
  selectedUser: any = {
    user: {
      full_name: ''
    }
  };
  chatHistory: any = [];
  scrollElement: any;

  public endpoints: any = APP_END_POINTS;
  public CREDENTIALS: any = APP_CREDENTIALS;
  public urls = urlsList;
  constructor(public userDetails: AppService, public router: Router) { }

  ngOnChanges(changes: SimpleChanges) {
    const list: SimpleChange = changes.users;
    if(list.currentValue !== list.previousValue && list.currentValue.length >0){
      let selected = list.currentValue[0];
      this.selectedUser = selected;
      this.userDetails.userSelected.emit(selected);
      this.getChatHistory(this.loginSessonData.user_id, selected.user.id , this.loginSessonData.token);
    }
  }

  ngOnInit() {

    this.userDetails.chatHistory
        .subscribe((history: any) => {
          this.userLastmsg = history[history.length-1].message;
        });
    this.userDetails.receivedMsgsObj
        .subscribe((data) => {
            this.notifiedChatObj = data;
            if( this.selectedUser == undefined || this.selectedUser.user.id !== data.from){
              var d = document.getElementById(data.from);
              d.className += " notify-active";
            }else{
              this.userDetails.receivedCurrentUserChat.emit(this.notifiedChatObj);
            }
        });
    this.loginDetails = JSON.parse(sessionStorage.getItem('signinDetails'));
    this.loginSessonData = JSON.parse(sessionStorage.getItem('sessionDetails'));
    let token = this.loginSessonData.token;
    let id = this.loginSessonData.user_id;
    this.loggedInUSerId = id;
    let params = {
      userId  : id,
      password : this.loginDetails.password
    };
    let userDetailsUrl = this.urls.userdetails + this.loginDetails.username;
    this.userDetails.getLoggedInUserDetails(userDetailsUrl, token)
      .subscribe((data: any) => {
        this._userDetails = data.user;
      });
    let urlListUrl = this.urls.usersList + id;
    this.userDetails.getUsersList(token, urlListUrl)
      .subscribe((data: any) => {
        this.usersList = data.items;
        this.selectedUser = this.usersList[0];
        this.getChatHistory(id, this.selectedUser.user.id, token);
        QB.init(this.CREDENTIALS.appId, this.CREDENTIALS.authKey, this.CREDENTIALS.authSecret, this.endpoints );
        QB.chat.connect(params, (err, roster) => {
        if (err) {
            console.log(err);
        } else {
          QB.chat.onMessageListener = this.MessagesFromUsers;
        }
        });
    });
    this.userDetails.userSelected
        .subscribe((user: any) => {
          this.selectedUser = user;
          this.chatHistory = [];
          this.getChatHistory(id, user.user.id, token);
        });
        this.userDetails.receivedCurrentUserChat
        .subscribe((object) => {
          this.chatHistory.push({'message': object.body});
          setTimeout(this.scrollSetToBottom, 1000);
        });
  }
  getChatHistory(from, to, token){
    let url = this.endpoints.api_endpoint + '//chat/Dialog.json?occupants_ids=';
    if(from > to)
      {    
          let occupants = to + "," + from;
          url += occupants;
      }
      else{
          let occupants = from + "," + to;
          url += occupants;
      }
      this.userDetails.getChatId(url, token)
      .subscribe((data: any) => {
        if(data.items.length > 0) {
          let chatdialId = data.items[0]._id;
          let url = this.endpoints.api_endpoint + "/chat/Message.json?chat_dialog_id="+ chatdialId;
          this.userDetails.getChatHistoryContent(url, token)
            .subscribe((data: any) => {
            this.chatHistory = data.items;
            setTimeout(this.scrollSetToBottom, 1000);
            this.userDetails.chatHistory.emit(this.chatHistory);
          });
        }else{
          this.chatHistory = [];
        }
      });
  }
  sendMessage(userId, value) {
    QB.chat.send(userId, {
      type: 'chat',
      body: value.form.value.chatContent,
      extension: {save_to_history: 1}
    });
    setTimeout(this.scrollSetToBottom, 200);
    this.chatHistory.push({'message': value.form.value.chatContent, 'sender_id': this._userDetails.id });
  }
  MessagesFromUsers = (userId, msg) => {
    this.recievedMsg = {
      from : userId,
      body: msg.body
    };
    this.userDetails.receivedMsgsObj.emit(this.recievedMsg);
  }
  changeUser(user) {
    let list = document.getElementsByClassName('active');
    if(list.length > 0){
    list[0].classList.remove('active');
    }
    let item = document.getElementById(user.user.id);
    item.className = 'active';
    this.selectedUser = user;
    this.userDetails.userSelected.emit(user);
  }

  logout() {
    // QB.destroySession(this.loginSessonData.token, (err, res) => {
    //   if (res) {
    //     console.log(res);
    //     this.router.navigate(['signin']);
    //   } else {
    //     console.log(err);
    //   }
    // });
    this.router.navigate(['signin']);
    location.reload();
  }

  scrollSetToBottom() {
    this.scrollElement = document.getElementById('scrollDiv');
    this.scrollElement.scrollTop = this.scrollElement.scrollHeight;
  }

}
