
describe('Payouts App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should have default settings', () => {
    cy.visit('/')
    cy.get('value').should('equal', '160');
/*
    page.navigateTo();
    expect(await page.getEntryFees().getAttribute('value')).toEqual('160');
    expect(await page.getMinimum().getAttribute('value')).toEqual('20');
    const rows = page.getPayoutRows();
    expect(await rows.get(0).getText()).toEqual('1st %50 $80');
    expect(await rows.get(1).getText()).toEqual('2nd %30 $50');
    expect(await rows.get(2).getText()).toEqual('3rd %20 $30');
*/
  });

/*
  it('should react to changes', async() => {
    await page.navigateTo();
    await page.getEntryFees().clear();
    await page.getEntryFees().sendKeys('40');
    await page.getMinimum().clear();
    await page.getMinimum().sendKeys('10');
    const rows = page.getPayoutRows();
    expect(await rows.get(0).getText()).toEqual('1st %70 $30');
    expect(await rows.get(1).getText()).toEqual('2nd %30 $10');
  });

  it('should show no payout for no entry fee', async() => {
    await page.navigateTo();
    await page.getEntryFees().clear();
    expect(await page.getPayoutRows().count()).toEqual(0);
  });

  it('should show no payout for no minimum', async () => {
    await page.navigateTo();
    await page.getMinimum().clear();
    expect(await page.getPayoutRows().count()).toEqual(0);
  });
*/
});
