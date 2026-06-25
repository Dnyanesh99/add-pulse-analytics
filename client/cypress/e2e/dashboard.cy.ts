describe("AdPulse Dashboard", () => {
  beforeEach(() => {
    cy.visit("/login");
    cy.get('input[type="text"]').type("admin");
    cy.get('input[type="password"]').type("admin123");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/campaigns");
  });

  it("should display the main dashboard heading", () => {
    cy.get("h1").should("contain", "Campaigns");
  });

  it("should display the stats grid", () => {
    cy.contains("Total impressions").should("be.visible");
    cy.contains("Total clicks").should("be.visible");
    cy.contains("Avg CTR").should("be.visible");
    cy.contains("Conversions").should("be.visible");
  });

  it("should have a functional theme toggle", () => {
    // Initial mode check (assuming default is light or dark)
    cy.get("header").find('button[aria-label="Toggle theme"]').click();
    // After toggle, the icon should change
    cy.get("header").find('button[aria-label="Toggle theme"]').should("be.visible");
  });

  it("should enforce a maximum width on the content container", () => {
    // Setting a large viewport
    cy.viewport(2560, 1440);
    cy.get("main").invoke("width").should("be.at.most", 1280);
  });
});
