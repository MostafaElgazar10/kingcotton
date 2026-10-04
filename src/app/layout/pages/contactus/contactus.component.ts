
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ContactService,
  ContactRequest
} from '../../../core/services/contactus.service';

@Component({
  selector: 'app-contactus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contactus.component.html',
  styleUrl: './contactus.component.scss'
})
export class ContactusComponent {
  contact: ContactRequest = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  captchaChecked = false;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private contactService: ContactService) {}

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    // CAPTCHA validation
    if (!this.captchaChecked) {
      this.errorMessage = 'Please confirm that you are not a robot.';
      return;
    }

    // Prevent duplicate submissions
    if (this.loading) {
      return;
    }

    // Validate all fields
    if (
      !this.contact.name.trim() ||
      !this.contact.email.trim() ||
      !this.contact.phone.trim() ||
      !this.contact.subject.trim() ||
      !this.contact.message.trim()
    ) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.contact.email.trim())) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.loading = true;

    const payload: ContactRequest = {
      name: this.contact.name.trim(),
      email: this.contact.email.trim(),
      phone: this.contact.phone.trim(),
      subject: this.contact.subject.trim(),
      message: this.contact.message.trim()
    };

    this.contactService.sendMessage(payload).subscribe({
      next: (response) => {
        if (response.status) {
          this.successMessage =
            response.data?.message || 'Message sent successfully!';

          this.contact = {
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
          };

          this.captchaChecked = false;
        } else {
          this.errorMessage =
            'Unable to send your message. Please try again.';
        }

        this.loading = false;
      },

      error: (error: any) => {
        console.error('Contact API Error:', error);

        this.errorMessage =
          error.error?.message ||
          'Something went wrong. Please try again later.';

        this.loading = false;
      }
    });
  }
}