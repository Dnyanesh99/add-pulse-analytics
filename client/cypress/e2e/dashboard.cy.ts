describe("AdPulse Dashboard", () => {
  beforeEach(() => {
    // We assume the app is running on localhost:3000
    cy.visit("/");
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
