import { Component, computed, input } from '@angular/core';
import { OverlayComponent } from "../overlay/overlay.component";


//vDropdownAccessibility
//vDropdownShowWarn

@Component({
  selector: 'v-dropdown',
  imports: [OverlayComponent],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss'
})
export class DropdownComponent {
  options = input<any[]>([]);
  optionLabelKey = input('label');


  finalOptions = computed(()=>{
    const options = this.options();
    const res = [];
    const labelKey = this.optionLabelKey();
    for (let i = 0; i < options.length; i++) {
      const item = options[i];
      if(typeof item === "string"){
        res.push({ [labelKey]: item });
      }else{
        res.push(item);
      }
    }
    return res;
  })
  
}
