import { Component, signal } from '@angular/core';
import { DropdownComponent } from "./app/components/dropdown/dropdown";

@Component({
  selector: 'app-root',
  imports: [DropdownComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  options1 = signal(['valaram', 'rakesh', 'mukesh']);
  options2 = signal([{ id: 1, label: 'valaram' }, { id: 2, label: 'rakesh' }, { id: 3, label: 'mukesh ' }]);

}
