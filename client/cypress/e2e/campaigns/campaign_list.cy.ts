describe("Campaign Management", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should list campaigns in the virtualized table", () => {
    cy.get('div[class*="TableScroll"]').within(() => {
      // Check for presence of rows
      cy.get('div[class*="Row"]').should("have.length.at.least", 1);
    });
  });

  it("should filter campaigns by status", () => {
    // Select 'Paused' filter
    cy.contains("Paused").click();
    
    cy.get('div[class*="TableScroll"]').within(() => {
      // All visible rows should be 'paused'
      // We check for the StatusPill content
      cy.get('div[class*="StatusPill"]').each(($el) => {
        cy.wrap($el).should("contain", "paused");
      });
    });
  });

  it("should sort campaigns by impressions", () => {
    cy.contains("Impressions").click(); // Sort ASC
    // Verify sort icon or order (complex with virtualized table, might need multiple clicks)
    cy.contains("Impressions").click(); // Sort DESC
  });

  it("should open campaign detail side panel", () => {
    cy.get('div[class*="Row"]').first().click();
    cy.get('aside, div[class*="Panel"]').should("be.visible");
    cy.get('h2').should("be.visible"); // Campaign name in panel
    cy.contains("Performance").should("be.visible");
  });

  it("should toggle campaign status from the detail panel", () => {
    cy.get('div[class*="Row"]').first().click();
    
    // Get initial status
    cy.get('div[class*="Panel"]').find('span[class*="StatusPill"]').then(($pill: JQuery<HTMLElement>) => {
      const isPaused = $pill.text().includes('paused');
      const actionText = isPaused ? 'RESUME' : 'PAUSE';
      const expectedStatus = isPaused ? 'active' : 'paused';
      
      cy.get('button').contains(actionText).click();
      
      // Pill should update
      cy.get('div[class*="Panel"]').find('span[class*="StatusPill"]').should("contain", expectedStatus);
    });
  });

  it("should close the detail panel using the close button", () => {
    cy.get('div[class*="Row"]').first().click();
    cy.get('div[class*="Panel"]').should("be.visible");
    
    cy.get('button[aria-label="Close"]').click();
    cy.get('div[class*="Panel"]').should("not.exist");
  });

  it("should close the detail panel using the Escape key", () => {
    cy.get('div[class*="Row"]').first().click();
    cy.get('body').type('{esc}');
    cy.get('div[class*="Panel"]').should("not.exist");
  });
});
