describe("Alerts & Thresholds", () => {
  beforeEach(() => {
    cy.visit("/login");
    cy.get('input[type="text"]').type("admin");
    cy.get('input[type="password"]').type("admin123");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/campaigns");
  });

  it("should open the alert creation modal from campaign detail", () => {
    // Open a campaign
    cy.get('[data-cy="campaign-row"]').first().click();
    
    // Click 'New Alert'
    cy.contains("NEW ALERT").click();
    
    // Check if modal is visible
    cy.get('div[class*="Modal"]').should("be.visible");
    cy.contains("Create Campaign Alert").should("be.visible");
  });

  it("should create a new budget alert", () => {
    cy.get('[data-cy="campaign-row"]').first().click();
    cy.contains("NEW ALERT").click();

    cy.get('input[placeholder*="Critical Budget Warning"]').type("E2E Test Alert");
    cy.get('select').first().select("spend_pct");
    cy.get('input[type="number"]').clear().type("85");
    
    cy.contains("Create Alert").click();
    
    // Should see success or alert appearing in the list
    cy.contains("E2E Test Alert").should("be.visible");
    cy.contains("spend pct greater than 85%").should("be.visible");
  });

  it("should edit an existing alert", () => {
    cy.get('[data-cy="campaign-row"]').first().click();
    
    // Click edit icon (✎) on the first alert
    cy.get('button').contains("✎").first().click();
    
    cy.get('input[value*="E2E Test Alert"]').clear().type("Updated Alert Name");
    cy.contains("Update Alert").click();
    
    cy.contains("Updated Alert Name").should("be.visible");
  });

  it("should delete an alert", () => {
    cy.get('[data-cy="campaign-row"]').first().click();
    
    // Click delete icon (✕) on the alert
    cy.get('button').contains("✕").last().click();
    
    cy.contains("Updated Alert Name").should("not.exist");
  });
});
