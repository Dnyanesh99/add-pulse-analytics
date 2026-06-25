describe("Authentication", () => {
  it("should redirect unauthenticated users to login", () => {
    cy.visit("/campaigns");
    cy.url().should("include", "/login");
    cy.get("h1").should("contain", "AdPulse");
    cy.contains("Sign in to your dashboard").should("be.visible");
  });

  it("should allow a user to login with valid credentials", () => {
    cy.visit("/login");
    
    // Fill in the login form
    cy.get('input[type="text"]').type("admin");
    cy.get('input[type="password"]').type("admin123");
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Should be redirected to campaigns dashboard
    cy.url().should("include", "/campaigns");
    
    // Verify dashboard loaded
    cy.get("h1").should("contain", "Campaigns");
  });
});
