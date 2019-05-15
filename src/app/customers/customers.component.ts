import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms'
import { Customer } from "./Customer";

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
  customer = new Customer();

  constructor() { }

  ngOnInit() {
  }

  save(customerForm: NgForm) {
    console.log(customerForm.form);
    console.log('Saved: ' + JSON.stringify(customerForm.value));
  }

}
