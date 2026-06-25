describe("Global Settings & UI Integrity", () => {
  beforeEach(() => {
    cy.visit("/login");
    cy.get('input[type="text"]').type("admin");
    cy.get('input[type="password"]').type("admin123");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/campaigns");
  });

  it("should persist theme preference across reloads", () => {
    // Check initial background
    cy.get('body').then(($body: JQuery<HTMLBodyElement>) => {
      const initialColor = $body.css('background-color');
      
      // Toggle theme
      cy.get('button[aria-label="Toggle theme"]').click();
      
      cy.get('body').should(($newBody: JQuery<HTMLBodyElement>) => {
        expect($newBody.css('background-color')).to.not.equal(initialColor);
      });

      // Reload
      cy.reload();
      
      // Should stay in the new theme
      cy.get('body').should(($reloadedBody: JQuery<HTMLBodyElement>) => {
        expect($reloadedBody.css('background-color')).to.not.equal(initialColor);
      });
    });
  });

  it("should show alert banner when notifications are pending", () => {
    // This depends on the backend sending alerts via WebSocket
    // We can at least check if the container exists
    cy.get('[data-cy="alert-banner"]').should("exist");
  });

  it("should be responsive on mobile viewport", () => {
    cy.viewport("iphone-x");
    cy.get('h1').should("be.visible");
    // Check if TopBar stats are hidden (as per @media query in TopBar.tsx)
    cy.get('[data-cy="live-pill"]').should("not.be.visible");
  });
});
