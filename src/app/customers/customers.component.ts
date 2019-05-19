import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn } from "@angular/forms";

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
