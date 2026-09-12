import type { LucideIcon } from "lucide-react";
import { Building2, House } from "lucide-react";

import { Role } from "#/models/role";

export type NavItem = {
	label: string;
	to: string;
	icon: LucideIcon;
	roles: Role[];
};

export const navItems: NavItem[] = [
	{ label: "Inicio", to: "/", icon: House, roles: [Role.User] },
	{ label: "Espacios", to: "/admin", icon: Building2, roles: [Role.Admin] },
];

export function navItemsForRole(role: Role | null): NavItem[] {
	if (!role) return [];
	return navItems.filter((item) => item.roles.includes(role));
}
