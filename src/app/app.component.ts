import {Component, Input, DoCheck} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

// Payout tables, in descending order.
const PAYOUTS = [
  [.4, .24, .16, .12, .08],
  [.5, .25, .15, .1],
  [.5, .3, .2],
  [.7, .3],
  [1.0]
];

class Payout {
  place: string;
  percentage: number;
  amount: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
@NgModule({
  imports: [
    BrowserModule,
    FormsModule
  ],
  declarations: [
    AppComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppComponent implements DoCheck {
  @Input()
  entryFees = 100;

  @Input()
  minimum = 10;

  @Input()
  roundTo = 5;

  actualPayouts: Payout[] = [
    {place: '1st', percentage: 1.0, amount: 50}
  ];

  constructor() {
  }

  ngDoCheck(): void {
    this.calculatePayouts();
  }

  private calculatePayouts(): void {
    let ok = false;
    for (let i = 0; i < PAYOUTS.length; ++i) {
      if (this.attemptPayout(PAYOUTS[i])) {
        ok = true;
        break;
      }
    }
    // Fall back to paying 100%
    if (!ok) {
      this.actualPayouts = [{
        place: this.toOrdinal(1),
        percentage: 1.0,
        amount: this.entryFees
      }];
    }
  }

  private toOrdinal(place: number): string {
    let suffix = '';
    const mod100 = place % 100;
    if (mod100 >= 11 && mod100 <= 19) {
      suffix = 'th';
    } else {
      const mod10 = place % 10;
      switch (mod10) {
        case 0:
          suffix = 'th';
          break;
        case 1:
          suffix = 'st';
          break;
        case 2:
          suffix = 'nd';
          break;
        case 3:
          suffix = 'rd';
          break;
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
          suffix = 'th';
          break;
      }
    }
    return '' + place + suffix;
  }

  private attemptPayout(payout): boolean {
    const last = this.entryFees * payout[payout.length - 1];
    if (last < this.minimum) {
      return false;
    }
    this.actualPayouts = [];
    for (let i = 0; i < payout.length; ++i) {
      const amount = this.roundNumber(this.entryFees * payout[i]);
      this.actualPayouts.push({
        place: this.toOrdinal(i + 1),
        percentage: payout[i],
        amount: amount
      });
    }

    // Adjust for rounding errors.
    let round = this.roundTo;
    if (isNaN(round)) {
      round = 1;
    }
    let total = 0;
    for (let i = 0; i < this.actualPayouts.length; ++i) {
      total += this.actualPayouts[i].amount;
    }
    let excess = this.entryFees - total;
    const adjustment = Number(round);
    let add = false;
    if (excess > 0) {
      add = true;
    }
    excess = Math.abs(excess);
    let next = 0;
    while (excess > 0) {
      if (add) {
        this.actualPayouts[next].amount += adjustment;
      } else {
        this.actualPayouts[next].amount -= adjustment;
      }
      excess -= adjustment;
      next = (next + 1) % this.actualPayouts.length;
    }
    return true;
  }

  private roundNumber(amount: number): number {
    let round = this.roundTo;
    if (isNaN(round)) {
      round = 1;
    }
    const multiplier = Math.round(amount / round);
    const out = multiplier * round;
    return out;
  }
}
