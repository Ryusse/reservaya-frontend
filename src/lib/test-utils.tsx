import { render as rtlRender } from "@testing-library/react";
import { Provider } from "#/components/ui/provider";

export function render(ui: React.ReactElement, options = {}) {
	return rtlRender(ui, { wrapper: Provider, ...options });
}
export * from "@testing-library/react";
