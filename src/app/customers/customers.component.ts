import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn } from "@angular/forms";

import { debounceTime} from 'rxjs/operators'
import { Customer } from "./Customer";

function emailMatcher(c:AbstractControl) : { [ key : string ] : boolean} | null {
  const emailControl = c.get('emailAddress')
  const confirmControl = c.get('confirmEmailAddress')

  // not yet been touched
  if(emailControl.pristine || confirmControl.pristine){
    return null;
  }

  if(emailControl.value === confirmControl.value) {
    return null;
  }
  // return the issue
  return {'match':true}
}

// check that a given number is between 2 given values
function ratingRange(min:number, max:number):ValidatorFn {
  return (c:AbstractControl):{[key:string]:boolean}|null => {
    if(c.value !== null && (isNaN(c.value) || c.value < min ||c.value > max)) {
      return { 'range' : true };
    }
    return null;
  }
}

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
  customerForm: FormGroup;
  customer = new Customer();
  emailMessage: string;

  private emailValidationMessage = {
    required: 'Please enter your email address.',
    email: 'Please enter a valid email address.'
  }

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName:['', [Validators.required, Validators.maxLength(50)]],
      emailGroup: this.fb.group({
        emailAddress:['', [Validators.required, Validators.email]],
        confirmEmailAddress:['', [Validators.required]]
      }, {validator: emailMatcher}),
      phone: '',
      notification: 'email',
      rating: [null, ratingRange(1, 5)],
      sendCatalog:true
    });

    // subscribe to the value changed, better than binding the click event on the radio button
    this.customerForm.get('notification').valueChanges.subscribe(
      value=>this.setNotification(value)
    )

    // use debounce time from rxjs/operators to wait 1 s before the validation kicks in
    const emailControl = this.customerForm.get('emailGroup.emailAddress')
    emailControl.valueChanges
    .pipe(
      debounceTime(1000)
    ).subscribe(
      value=>this.setEmailErrorMessage(emailControl)
    )
  }

  populateTestData(): void {
    this.customerForm.patchValue({
      firstName: 'Jack',
      lastName:'Harkness',
      sendCatalog: false
    });
  }

  save() {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  // if an error needs to be displayed for the email field
  setEmailErrorMessage(c:AbstractControl):void {
    this.emailMessage = ''
    if((c.touched || c.dirty ) && c.errors) {
      this.emailMessage = Object.keys(c.errors).map(
        key=>this.emailMessage += this.emailValidationMessage[key]).join('  ');
    }
  }

  setNotification(notifyVia: string): void {
    const phoneControl = this.customerForm.get('phone');
    if(notifyVia === 'text') {
      phoneControl.setValidators(Validators.required);
    } else {
      phoneControl.clearValidators();
    }
    phoneControl.updateValueAndValidity();
  }

}
