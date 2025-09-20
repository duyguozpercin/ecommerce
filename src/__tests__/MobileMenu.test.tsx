import { render, screen, fireEvent } from "@testing-library/react";
import MobileMenu from "@/components/MobileMenu";
import { allCategories } from "@/types/product";
import "@testing-library/jest-dom";


jest.mock("next/link", () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

describe("MobileMenu", () => {
  it("should render all categories", () => {
    const mockSetMenuOpen = jest.fn();

    render(<MobileMenu setMenuOpen={mockSetMenuOpen} />);

    allCategories.forEach((category) => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  it("should close the menu when a category is clicked", () => {
    const mockSetMenuOpen = jest.fn();

    render(<MobileMenu setMenuOpen={mockSetMenuOpen} />);

    const firstCategory = screen.getByText(allCategories[0]);
    fireEvent.click(firstCategory);

    expect(mockSetMenuOpen).toHaveBeenCalledWith(false);
  });
});
