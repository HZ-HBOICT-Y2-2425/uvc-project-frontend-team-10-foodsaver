import { render, fireEvent, screen } from "@testing-library/svelte";
import SearchComponent from "../components/SearchComponent.svelte";

describe("Favourites Button", () => {
  it("should navigate to /favorite page when clicked", async () => {
    render(SearchComponent);

    const favouritesButton = screen.getByRole("button", { name: /favourites/i });

    // Simula el clic en el botón de favoritos
    await fireEvent.click(favouritesButton);

    // Verifica si la navegación redirige a la página de favoritos
    expect(window.location.href).toContain("/favorite");
  });
});
