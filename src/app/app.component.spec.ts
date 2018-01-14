import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [
        BrowserModule,
        FormsModule
      ],
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it('should have all payouts sum to 1.0', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const payouts = fixture.componentInstance.PAYOUTS;
    for (let i = 0; i < payouts.length; ++i) {
      expectSumToOne(payouts[i]);
    }
  }));

  function expectSumToOne(array: number[]): void {
    let sum = 0;
    for (let i = 0; i < array.length; ++i) {
      sum += array[i];
    }
    expect(sum).toBe(1.0);
  }

  it('should have payout tables in descending order', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const payouts = fixture.componentInstance.PAYOUTS;
    let lastLength = payouts[0].length;
    for (let i = 1; i < payouts.length; ++i) {
      expect(payouts[i].length).toBeLessThan(lastLength);
      lastLength = payouts[i].length;
    }
  }));

  it('should have places pay in descending order', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const payouts = fixture.componentInstance.PAYOUTS;
    for (let i = 0; i < payouts.length; ++i) {
      expectDescendingOrder(payouts[i]);
    }
  }));

  function expectDescendingOrder(array: number[]): void {
    let last = array[0];
    for (let i=1; i < array.length; ++i) {
      expect(array[i]).toBeLessThan(last);
      last = array[i];
    }
  }

  it('should get ordinals right', async(() => {
    const instance = TestBed.createComponent(AppComponent).componentInstance;
    expect(instance.toOrdinal(0)).toEqual("0th");
    expect(instance.toOrdinal(1)).toEqual("1st");
    expect(instance.toOrdinal(2)).toEqual("2nd");
    expect(instance.toOrdinal(3)).toEqual("3rd");
    expect(instance.toOrdinal(4)).toEqual("4th");
    expect(instance.toOrdinal(5)).toEqual("5th");
    expect(instance.toOrdinal(6)).toEqual("6th");
    expect(instance.toOrdinal(7)).toEqual("7th");
    expect(instance.toOrdinal(8)).toEqual("8th");
    expect(instance.toOrdinal(9)).toEqual("9th");
    expect(instance.toOrdinal(10)).toEqual("10th");
    expect(instance.toOrdinal(11)).toEqual("11th");
    expect(instance.toOrdinal(12)).toEqual("12th");
    expect(instance.toOrdinal(13)).toEqual("13th");
    expect(instance.toOrdinal(14)).toEqual("14th");
    expect(instance.toOrdinal(15)).toEqual("15th");
    expect(instance.toOrdinal(16)).toEqual("16th");
    expect(instance.toOrdinal(17)).toEqual("17th");
    expect(instance.toOrdinal(18)).toEqual("18th");
    expect(instance.toOrdinal(19)).toEqual("19th");
    expect(instance.toOrdinal(20)).toEqual("20th");
    expect(instance.toOrdinal(21)).toEqual("21st");
    expect(instance.toOrdinal(22)).toEqual("22nd");
    expect(instance.toOrdinal(23)).toEqual("23rd");
    expect(instance.toOrdinal(24)).toEqual("24th");
    expect(instance.toOrdinal(25)).toEqual("25th");
    expect(instance.toOrdinal(101)).toEqual("101st");
    expect(instance.toOrdinal(111)).toEqual("111th");
  }));

  it('should round payouts for fees divisible by 10', async(() => {
    const instance = TestBed.createComponent(AppComponent).componentInstance;
    expectPayout(instance, 20, 20, [20]);
    expectPayout(instance, 40, 10, [30, 10]);
    expectPayout(instance, 100, 20,[50, 30, 20]);
    expectPayout(instance, 200, 20,[100, 50, 30, 20]);

    expectPayout(instance, 40, 5, [25, 10, 5]);
    expectPayout(instance, 40, 10, [30, 10]);
    expectPayout(instance, 40, 20, [40]);
  }));

  it('should round payouts for fees divisible by 5', async(() => {
    const instance = TestBed.createComponent(AppComponent).componentInstance;
    expectPayout(instance, 5, 5, [5]);
    expectPayout(instance, 10, 5, [10]);
    expectPayout(instance, 15, 5, [10, 5]);
    expectPayout(instance, 20, 5, [15, 5]);
    expectPayout(instance, 25, 5, [15, 10]);
    expectPayout(instance, 30, 5, [15, 10, 5]);
    expectPayout(instance, 300, 5, [90, 70, 55, 40, 30, 15]);
  }));

  it('should not round payouts for fees not round numbers', async(() => {
    const instance = TestBed.createComponent(AppComponent).componentInstance;
    expectPayout(instance, 1, 5, [1]);
    expectPayout(instance, 2, 5, [2]);
    expectPayout(instance, 3, 5, [3]);
    expectPayout(instance, 112, 5, [45, 27, 18, 13, 9]);
  }));

  function expectPayout(instance: AppComponent, entryFees: number, minimum: number,
                        output: number[]): void {
   instance.entryFees = entryFees;
   instance.minimum = minimum;
   instance.ngDoCheck();
   let actual = [];
   for (let i = 0; i < instance.actualPayouts.length; ++i) {
     actual.push(instance.actualPayouts[i].amount);
   }
   console.log(`total: ${entryFees}, min: ${minimum}, pay: ${actual}`);
   expect(actual).toEqual(output);
  }

  it('should show no payouts for bad input', async(() => {
    const instance = TestBed.createComponent(AppComponent).componentInstance;
    instance.entryFees = 0;
    instance.ngDoCheck();
    expect(instance.actualPayouts).toEqual([]);

    instance.entryFees = 10;
    instance.minimum = NaN;
    instance.ngDoCheck();
    expect(instance.actualPayouts).toEqual([]);

    expectPayout(instance, 10, 10, [10]);
  }));
});
