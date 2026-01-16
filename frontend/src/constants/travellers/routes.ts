export const TRAVELLER_ROUTES = {
  root: '/travellers',
  dashboard: '/travellers/dashboard',
  trips: '/travellers/trips',
  groupPlanning: '/travellers/group-planning',
  groupDetail: (groupId: string) => `/travellers/group/${groupId}`,
  expenses: '/travellers/expenses',
  profile: '/travellers/profile',
  nearby: '/travellers/nearby',
} as const;

export const TRAVELLER_NAV_ITEMS = [
  { path: TRAVELLER_ROUTES.dashboard, label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: TRAVELLER_ROUTES.trips, label: 'My Trips', icon: 'Plane' },
  { path: TRAVELLER_ROUTES.groupPlanning, label: 'Group Planning', icon: 'Users' },
  { path: TRAVELLER_ROUTES.expenses, label: 'Expenses', icon: 'Wallet' },
  { path: TRAVELLER_ROUTES.profile, label: 'Profile', icon: 'User' },
  { path: TRAVELLER_ROUTES.nearby, label: 'Nearby', icon: 'MapPin' },
] as const;
