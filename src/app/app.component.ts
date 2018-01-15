import {Component, Input, DoCheck} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

/**
 * Representation of a payout.
 */
export class Payout {
  /** 1st, 2nd, 3rd, etc... */
  place: string;
  /** .5, .3, etc... */
  fraction: number;
  /** 100, 50, 30, ... */
  amount: number;
}

/**
 * Type of table to use for payouts.
 *
 * Ranked: no ties.
 * Double elim: ties starting at 5/6.
 */
export enum PayoutType {
  Ranked = 1,
  DoubleElim = 2,
}

/**
 * A single entry in a payout table.
 */
export class Table {
  readonly fractions: number[];
  private readonly numTies: number[];

  /** Creates the payout table */
  constructor(fractions: number[]) {
    this.fractions = fractions;
    // Initializing the ties table.
    this.numTies = new Array(fractions.length);
    this.numTies.fill(-1, 0, fractions.length);
    let start = 0;
    let end = start;
    while (start < fractions.length) {
      if (end === fractions.length || fractions[start] !== fractions[end]) {
        this.numTies.fill(end - start, start, end);
        start = end;
      } else {
        ++end;
      }
    }
  }

  /**
   * Gets the number of teams tied for a given place. At least 1, possibly more.
   */
  getNumTies(place: number): number {
    return this.numTies[place];
  }
}

/** Used for iteration order control during payout algorithm. */
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

  /** Strategy for payouts */
  @Input()
  payoutType: PayoutType = PayoutType.Ranked;

  /**
   * Payouts to disable.
   */
  actualPayouts: Payout[] = [];

  /**
   * Payout tables to use.
   */
  TABLES: Map<PayoutType, Table[]> = new Map([
    [PayoutType.Ranked, [
      new Table([.3, .24, .19, .14, .09, .04]),
      new Table([.4, .24, .16, .12, .08]),
      new Table([.5, .25, .15, .1]),
      new Table([.5, .3, .2]),
      new Table([.7, .3]),
      new Table([1.0])
    ]],
    [PayoutType.DoubleElim, [
      new Table([.4, .25, .15, .10, .05, .05]),
      new Table([.5, .25, .15, .1]),
      new Table([.5, .3, .2]),
      new Table([.7, .3]),
      new Table([1.0])
    ]]
  ]);

  constructor() {
  }

  ngDoCheck(): void {
    this.calculatePayouts();
  }

  private validNumber(x): boolean {
    return Number(x) > 0;
  }

  private getPayoutOptions(): Array<Table> {
    return this.TABLES.get(Number(this.payoutType));
  }

  /**
   * Core function that recalculates payouts when values change.
   */
  private calculatePayouts(): void {
    const tableList = this.getPayoutOptions();
    if (!this.validNumber(this.entryFees) || !this.validNumber(this.minimum) ||
        !tableList) {
      this.actualPayouts = [];
      return;
    }
    const round = this.getRoundFactor();
    let ok = false;
    for (const table of tableList) {
      if (this.attemptPayout(table, round)) {
        ok = true;
        break;
      }
    }
    // Fall back to paying 100%
    if (!ok) {
      this.actualPayouts = [{
        place: this.toOrdinal(1),
        fraction: 1.0,
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

  private sum(payouts: number[]): number {
    let total = 0;
    for (const payout of payouts) {
      total += payout;
    }
    return total;
  }

  private makeDecreasing(table: Table, payouts: number[], round: number): void {
    for (let i = 1; i < payouts.length;) {
      const prev = i - 1;
      const numTies = table.getNumTies(i);
      if (payouts[i] === payouts[prev]) {
        for (let j = 0; j < numTies; ++j) {
          payouts[i + j] -= round;
        }
      }
      i += numTies;
    }
  }

  private increaseFromBottom(table: Table, payouts: number[], excess: number, round: number): void {
    this.distribute(table, payouts, excess, round, Direction.Backward);
  }

  private increaseFromTop(table: Table, payouts: number[], excess: number, round: number): void {
    this.distribute(table, payouts, excess, round, Direction.Forward);
  }

  private decreaseFromBottom(table: Table, payouts: number[], excess: number, round: number): void {
    this.distribute(table, payouts, excess, -round, Direction.Backward);
  }

  private decreaseFromTop(table: Table, payouts: number[], excess: number, round: number): void {
    this.distribute(table, payouts, excess, -round, Direction.Forward);
  }

  /**
   * Distributes excess over payouts.
   *
   * @param {Table} payout metadata table
   * @param {number[]} payouts to modify
   * @param {number} excess amount to distribute
   * @param {number} step size of each distribution
   * @param {Direction} direction whether to start at front or back.
   */
  private distribute(table: Table, payouts: number[], excess: number, step: number,
                     direction: Direction) {
    if (excess % step !== 0) {
      throw new Error(`excess ${excess} must be a multiple of ${step}`);
    }
    // Next index
    let next;
    // Handles incrementing the index.
    let increment;
    if (direction === Direction.Forward) {
      // Forward iterator
      next = 0;
      increment = () => {
        next = (next + 1) % payouts.length;
      };
    } else {
      // Backwards iterator.
      next = payouts.length - 1;
      increment = () => {
        --next;
        if (next < 0) {
          next = payouts.length - 1;
        }
      };
    }
    while (excess !== 0) {
      const numTies = table.getNumTies(next);
      if (excess < numTies * step) {
        // Can't distribute to all of the equivalent places, give up.
        break;
      }
      for (let j = 0; j < numTies; ++j) {
        payouts[next] += step;
        excess -= step;
        increment();
      }
    }
  }

  private attemptPayout(table: Table, round: number): boolean {
    const planned: number[] = [];
    // Start by rounding payouts.
    for (const fraction of table.fractions) {
      const amount = this.roundNumber(this.entryFees * fraction, round);
      planned.push(amount);
    }

    // Then make them steadily decreasing.
    this.makeDecreasing(table, planned, round);

    // Then distribute any leftovers.
    let excess: number = this.entryFees - this.sum(planned);
    if (excess > 0) {
      // Rounded down too much. Increase payouts at the low-end.
      this.increaseFromBottom(table, planned, excess, round);
      // Make them steadily decreasing again.
      this.makeDecreasing(table, planned, round);
      // Distribute any leftovers from the top.
      excess = this.entryFees - this.sum(planned);
      this.increaseFromTop(table, planned, excess, round);
    } else if (excess < 0) {
      // Rounded up a bit too much, take payouts from the high-end.
      this.decreaseFromTop(table, planned, excess, round);
      // Make them steadily decreasing again.
      this.makeDecreasing(table, planned, round);
      // Distribute any leftovers from the top.
      excess = this.entryFees - this.sum(planned);
      this.increaseFromTop(table, planned, excess, round);
    }

    // Make sure fair distribution succeeded.
    excess = this.entryFees - this.sum(planned);
    if (excess !== 0) {
      return false;
    }

    // Make sure that all payouts are greater than minimum.
    for (const amount of planned) {
      if (amount < this.minimum) {
        return false;
      }
    }

    // Got it. Create the new payouts to be displayed..
    this.actualPayouts = [];
    let startTie = 0;
    let endTie = 0;
    let ordinal: string;
    for (let i = 0; i < planned.length; ++i) {
      if (i === endTie) {
        startTie = i;
        const numTies = table.getNumTies(i);
        endTie = startTie + numTies;
        if (numTies === 1) {
          ordinal = this.toOrdinal(startTie + 1);
        } else {
          ordinal = this.toOrdinal(startTie + 1) + '/' + this.toOrdinal(endTie);
        }
      }
      this.actualPayouts.push({
        place: ordinal,
        fraction: table.fractions[i],
        amount: planned[i]
      });
    }
    return true;
  }

  private roundNumber(amount: number, round: number): number {
    const multiplier = Math.round(amount / round);
    return multiplier * round;
  }
}
