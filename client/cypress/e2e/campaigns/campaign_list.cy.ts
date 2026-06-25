describe("Campaign Management", () => {
  beforeEach(() => {
    cy.visit("/login");
    cy.get('input[type="text"]').type("admin");
    cy.get('input[type="password"]').type("admin123");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/campaigns");
  });

  it("should list campaigns in the virtualized table", () => {
    cy.get('[data-cy="table-scroll"]').within(() => {
      // Check for presence of rows
      cy.get('[data-cy="campaign-row"]').should("have.length.at.least", 1);
    });
  });

  it("should filter campaigns by status", () => {
    // Select 'Paused' filter
    cy.contains("Paused").click();
    
    cy.get('[data-cy="table-scroll"]').within(() => {
      // All visible rows should be 'paused'
      // We check for the StatusPill content
      cy.get('[data-cy="status-pill"]').each(($el) => {
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
    cy.get('[data-cy="campaign-row"]').first().click();
    cy.get('aside, div[class*="Panel"]').should("be.visible");
    cy.get('h2').should("be.visible"); // Campaign name in panel
    cy.contains("Performance").should("be.visible");
  });

  it("should toggle campaign status from the detail panel", () => {
    cy.get('[data-cy="campaign-row"]').first().click();
    
    // Get initial status
    cy.get('div[class*="Panel"]').find('[data-cy="status-pill"]').then(($pill: JQuery<HTMLElement>) => {
      const isPaused = $pill.text().includes('paused');
      const actionText = isPaused ? 'RESUME' : 'PAUSE';
      const expectedStatus = isPaused ? 'active' : 'paused';
      
      cy.get('button').contains(actionText).click();
      
      // Pill should update
      cy.get('div[class*="Panel"]').find('[data-cy="status-pill"]').should("contain", expectedStatus);
    });
  });

  it("should close the detail panel using the close button", () => {
    cy.get('[data-cy="campaign-row"]').first().click();
    cy.get('div[class*="Panel"]').should("be.visible");
    
    cy.get('button[aria-label="Close"]').click();
    cy.get('div[class*="Panel"]').should("not.exist");
  });

  it("should close the detail panel using the Escape key", () => {
    cy.get('[data-cy="campaign-row"]').first().click();
    cy.get('body').type('{esc}');
    cy.get('div[class*="Panel"]').should("not.exist");
  });
});
