import {Component, Input, DoCheck} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

class Payout {
  place: string;
  percentage: number;
  amount: number;
}

enum Direction {
  Forward,
  Backward,
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
  /** Entry fee from form. */
  @Input()
  entryFees = 160;

  /** Minimum payout from form. */
  @Input()
  minimum = 20;

  /**
   * Payouts to disable.
   */
  actualPayouts: Payout[] = [];

  // Payout tables, in descending order.
  PAYOUTS = [
    [.4, .24, .16, .12, .08],
    [.5, .25, .15, .1],
    [.5, .3, .2],
    [.7, .3],
    [1.0]
  ];

  constructor() {
  }

  ngDoCheck(): void {
    this.calculatePayouts();
  }

  private validNumber(x): boolean {
    return Number(x) > 0;
  }

  private calculatePayouts(): void {
    if (!this.validNumber(this.entryFees) || !this.validNumber(this.minimum)) {
      this.actualPayouts = [];
      return;
    }
    const round = this.getRoundFactor();
    let ok = false;
    for (let i = 0; i < this.PAYOUTS.length; ++i) {
      if (this.attemptPayout(this.PAYOUTS[i], round)) {
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

  /**
   * Gets place ordinal strings.
   *
   * @param {number} place, starting at 1.
   * @returns {string} ordinal, e.g. 1st, 2nd, 3rd.
   */
  toOrdinal(place: number): string {
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

  /**
   * Figures out whether to round to nearest 5 or nearest whole number.
   */
  private getRoundFactor(): number {
    if (this.entryFees % 5 === 0) {
      return 5;
    }
    return 1;
  }

  private sum(payout: number[]): number {
    let total = 0;
    for (let i=0; i < payout.length; ++i) {
      total += payout[i];
    }
    return total;
  }

  private makeDecreasing(payouts: number[], round: number): void {
    for (let i = 1; i < payouts.length; ++i) {
      if (payouts[i] === payouts[i-1]) {
        payouts[i] -= round;
      }
    }
  }

  private increaseFromBottom(payouts: number[], excess: number, round: number): void {
    this.distribute(payouts, excess, round, Direction.Backward);
  }

  private increaseFromTop(payouts: number[], excess: number, round: number): void {
    this.distribute(payouts, excess, round, Direction.Forward);
  }

  private decreaseFromBottom(payouts: number[], excess: number, round: number): void {
    this.distribute(payouts, excess, -round, Direction.Backward);
  }

  private decreaseFromTop(payouts: number[], excess: number, round: number): void {
    this.distribute(payouts, excess, -round, Direction.Forward);
  }

  /**
   * Distributes excess over payouts.
   *
   * @param {number[]} payouts to modify
   * @param {number} excess amount to distribute
   * @param {number} step size of each distribution
   * @param {Direction} direction whether to start at front or back.
   */
  private distribute(payouts: number[], excess: number, step: number, direction: Direction) {
    if (excess % step !== 0) {
      throw new Error(`excess ${excess} must be a multiple of ${step}`);
    }
    if (direction === Direction.Forward) {
      let next = 0;
      while (excess !== 0) {
        payouts[next] += step;
        excess -= step;
        next = (next + 1) % payouts.length;
      }
    } else {
      let next = payouts.length - 1;
      while (excess !== 0) {
        payouts[next] += step;
        excess -= step;
        --next;
        if (next < 0) {
          next = payouts.length - 1;
        }
      }
    }
  }

  private attemptPayout(table: number[], round: number): boolean {
    const planned: number[] = [];
    // Start by rounding payouts.
    for (let i = 0; i < table.length; ++i) {
      const amount = this.roundNumber(this.entryFees * table[i], round);
      planned.push(amount);
    }

    // Then make them steadily decreasing.
    this.makeDecreasing(planned, round);

    // Then distribute any leftovers.
    let excess: number = this.entryFees - this.sum(planned);
    if (excess > 0) {
      this.increaseFromBottom(planned, excess, round);
      // Make them steadily decreasing again.
      this.makeDecreasing(planned, round);
      // Distribute any leftovers from the top.
      excess = this.entryFees - this.sum(planned);
      this.increaseFromTop(planned, excess, round);
    } else if (excess < 0) {
      this.decreaseFromTop(planned, excess, round);
      // Make them steadily decreasing again.
      this.makeDecreasing(planned, round);
      // Distribute any leftovers from the top.
      excess = this.entryFees - this.sum(planned);
      this.increaseFromTop(planned, excess, round);
    }

    // Make sure that all payouts are greater than minimum.
    for (let i = planned.length - 1; i >= 0; --i) {
      if (planned[i] < this.minimum) {
        return false;
      }
    }

    // Got it. Create the new payouts to be displayed..
    this.actualPayouts = [];
    for (let i = 0; i < planned.length; ++i) {
      this.actualPayouts.push({
        place: this.toOrdinal(i + 1),
        percentage: table[i],
        amount: planned[i]
      });
    }
    return true;
  }

  private roundNumber(amount: number, round: number): number {
    const multiplier = Math.round(amount / round);
    const out = multiplier * round;
    return out;
  }
}
