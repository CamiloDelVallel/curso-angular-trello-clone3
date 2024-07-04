import { Component, Input, OnInit } from '@angular/core';
import { Colors, COLORS } from '@models/colors.model';

@Component({
  selector: 'app-card-color',
  templateUrl: './card-color.component.html'
})
export class CardColorComponent {
  
  @Input() color: Colors = 'sky';

  mapColors = COLORS;

  get colors(){
    const clases = this.mapColors[this.color];
    return clases ? clases: {};
  }

}
