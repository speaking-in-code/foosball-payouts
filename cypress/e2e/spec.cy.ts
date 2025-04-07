
const entryFees = () => {
  return cy.get('input[name="entryFees"]');
};

const minimum = () => {
  return cy.get('input[name="minimum"]');
};

const expectPayouts = (payouts) => {
  for (let i = 0; i < payouts.length; ++i) {
    cy.get('[id="payouts"]').eq(i).then((x) => {
      expect(x.get(0).innerText).to.eq(payouts[i]);
    });
  }
  if (payouts.length > 0) {
    cy.get('[id="payouts"]').should('have.length', payouts.length);
  } else {
    cy.get('[id="payouts"]').should('not.exist');
  }
};

describe('Payouts App', () => {
  it('should have default settings', () => {
    cy.visit('/');
    entryFees().should('have.value', '160');
    minimum().should('have.value', '20');
    expectPayouts([
      '1st\t%50\t$80',
      '2nd\t%30\t$50',
      '3rd\t%20\t$30',
    ]);
  });

  it('should react to changes', () => {
    cy.visit('/');
    entryFees().clear();
    entryFees().type('40');
    minimum().clear();
    minimum().type('10');
    expectPayouts([
      '1st\t%70\t$30',
      '2nd\t%30\t$10',
    ]);
  });

  it('hides payout without entry fees', () => {
    cy.visit('/');
    entryFees().clear();
    expectPayouts([]);
  });

  it('hides payout without minimum', () => {
    cy.visit('/');
    minimum().clear();
    expectPayouts([]);
  });
})
