import axios from 'axios';
import { interval } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { concatMap, pluck } from 'rxjs/operators';

class App {
  constructor() {
    this.appEl = document.querySelector('.app');
    this.messages = [];
    this.lastRecievedDate = 0;
    this.messagesListEl = undefined;
    this.MAX_SUBJECT_LENGTH = 15;
  }

  updateMessages(messages) {
    const messagesForDisplay = [...messages]
      .filter((m) => m.received > this.lastRecievedDate)
      .sort((a, b) => a.received - b.received);
    this.displayMessages(messagesForDisplay);
    this.updateLastRecivedDate(messages);
  }

  getTrimmedSubjectText(text) {
    return text.length > 15
      ? `${text.slice(0, this.MAX_SUBJECT_LENGTH)}...`
      : text;
  }

  createMessageEl(message) {
    const messageEl = document.createElement('li');
    messageEl.classList.add('message');

    const messageFromEl = document.createElement('div');
    messageFromEl.classList.add('message-from');
    messageFromEl.innerText = message.from;
    messageEl.appendChild(messageFromEl);

    const messageSubjectEl = document.createElement('div');
    messageSubjectEl.classList.add('message-subject');
    messageSubjectEl.innerText = this.getTrimmedSubjectText(message.subject);
    messageEl.appendChild(messageSubjectEl);

    const messageDateEl = document.createElement('div');
    messageDateEl.classList.add('message-date-time');
    const date = new Date(message.received);
    messageDateEl.innerText = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    messageEl.appendChild(messageDateEl);

    return messageEl;
  }

  displayMessages(messages) {
    messages.forEach((message) => {
      this.messagesListEl.prepend(this.createMessageEl(message));
    });
  }

  updateLastRecivedDate(messages) {
    [this.lastRecievedDate] = messages.map((m) => m.received).sort((a, b) => b - a);
  }

  loadData() {
    axios.get('http://localhost:7777/messages/unread')
      .then((res) => this.updateMessages(res.data.messages));
  }

  init() {
    const colEl = document.createElement('div');
    colEl.classList.add('app-column');
    this.appEl.appendChild(colEl);

    const titlteEl = document.createElement('div');
    titlteEl.classList.add('messages-title');
    titlteEl.innerText = 'Incoming:';
    colEl.appendChild(titlteEl);

    const messagesListEl = document.createElement('ul');
    messagesListEl.classList.add('messages-list');
    colEl.appendChild(messagesListEl);
    this.messagesListEl = messagesListEl;

    // no rxjs version
    // this.loadData();
    // setInterval(() => this.loadData(), 1000);

    interval(1000)
      .pipe(
        concatMap(() => ajax.getJSON('http://localhost:7777/messages/unread')),
        pluck('messages'),
      )
      .subscribe((messages) => this.updateMessages(messages));
  }
}

const app = new App();
app.init();
