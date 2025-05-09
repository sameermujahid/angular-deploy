import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class HomeComponent {
  counter = 0;
  messages: string[] = [];
  newMessage = '';

  incrementCounter() {
    this.counter++;
  }

  addMessage() {
    if (this.newMessage.trim()) {
      this.messages.push(this.newMessage);
      this.newMessage = '';
    }
  }

  removeMessage(index: number) {
    this.messages.splice(index, 1);
  }
}
