// Define user roles
type UserRole = "User" | "Admin" | "ParkingAttendant";

// Common navigation items that might be shared across roles
const COMMON_NAV_ITEMS: NavItem[] = [
];

// Role-specific navigation items
const ROLE_SPECIFIC_NAV_ITEMS: Partial<Record<UserRole, NavItem[]>> = {
  ParkingAttendant: [
  ],
  Admin: [
    {
      name: "Dashboard",
      icon: "mdi:chart-box",
      href: "/dashboard",
    },
  ],
};

// Main function to get navigation items based on role
export function getNavItems(role: UserRole): NavItem[] {
  const commonItems = COMMON_NAV_ITEMS || [];
  const specificItems = ROLE_SPECIFIC_NAV_ITEMS[role] || [];

  return [...commonItems, ...specificItems];
}