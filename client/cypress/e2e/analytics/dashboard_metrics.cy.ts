describe("Real-time Analytics", () => {
  beforeEach(() => {
    cy.visit("/login");
    cy.get('input[type="text"]').type("admin");
    cy.get('input[type="password"]').type("admin123");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/campaigns");
  });

  it("should display live global metrics in the top bar", () => {
    cy.get('header').within(() => {
      cy.contains("impressions").should("be.visible");
      // Check if number is present
      cy.contains(/\d+ impressions/).should("be.visible");
    });
  });

  it("should display the stats grid with all metrics", () => {
    cy.get('div[class*="StatsGrid"]').within(() => {
      cy.contains("Total impressions").should("be.visible");
      cy.contains("Total clicks").should("be.visible");
      cy.contains("Avg CTR").should("be.visible");
      cy.contains("Conversions").should("be.visible");
    });
  });

  it("should show performance trend chart", () => {
    cy.contains("Performance Trend").should("be.visible");
    cy.get('canvas').should("exist"); // ECharts renders to canvas
  });

  it("should update leaderboard with performer data", () => {
    cy.contains("Top Performers").should("be.visible");
    cy.get('div[class*="PerformerRow"]').should("have.length.at.least", 1);
  });

  it("should allow switching leaderboard metrics", () => {
    cy.get('select').select('clicks');
    cy.contains("Top Performers 🖱️").should("be.visible");
  });

  it("should reflect real-time metric updates in the UI", () => {
    // Get initial impression count
    cy.get('header').contains("impressions").then(($pill: JQuery<HTMLElement>) => {
      const initialText = $pill.text();
      
      // Wait for at least one update (metrics broadcast is every 1000ms)
      cy.wait(2500); 
      
      cy.get('header').contains("impressions").should(($newPill: JQuery<HTMLElement>) => {
        expect($newPill.text()).to.not.equal(initialText);
      });
    });
  });
});
