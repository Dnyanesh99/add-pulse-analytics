import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusPill } from "../StatusPill";
import { lightTheme } from "../../Theme";
import { ThemeProvider } from "@emotion/react";

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={lightTheme}>
      {ui}
    </ThemeProvider>
  );
};

describe("StatusPill", () => {
  it("renders active status correctly", () => {
    renderWithTheme(
      <StatusPill status="active">
        Active Campaign
      </StatusPill>
    );
    
    const pill = screen.getByText("Active Campaign");
    expect(pill).toBeInTheDocument();
    // Check if it has the correct color (green for active)
    expect(pill).toHaveStyle({ color: lightTheme.green });
  });

  it("renders paused status correctly", () => {
    renderWithTheme(
      <StatusPill status="paused">
        Paused
      </StatusPill>
    );
    
    const pill = screen.getByText("Paused");
    expect(pill).toBeInTheDocument();
    expect(pill).toHaveStyle({ color: lightTheme.amber });
  });

  it("renders ended status correctly", () => {
    renderWithTheme(
      <StatusPill status="ended">
        Ended
      </StatusPill>
    );
    
    const pill = screen.getByText("Ended");
    expect(pill).toBeInTheDocument();
    expect(pill).toHaveStyle({ color: lightTheme.red });
  });
});
