import {browser, by, element, ElementArrayFinder} from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }

  getEntryFees() {
    return element(by.name('entryFees'));
  }

  getMinimum() {
    return element(by.name('minimum'));
  }

  getPayoutRows(): ElementArrayFinder {
    return element.all(by.id('payouts'));
  }
}
