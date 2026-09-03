export const PERMISSIONS = {
  dashboardView: 'dashboard.view',
  assetView: 'asset.view',
  assetCreate: 'asset.create',
  assetEdit: 'asset.edit',
  assetTransfer: 'asset.transfer',
  assetDeleteRequest: 'asset.delete.request',
  assetDeleteApprove: 'asset.delete.approve',
  workOrderView: 'work_order.view',
  workOrderCreate: 'work_order.create',
  workOrderPrint: 'work_order.print',
  preventiveView: 'preventive.view',
  kardexView: 'kardex.view',
  breakdownReport: 'breakdown.report',
  breakdownView: 'breakdown.view',
  breakdownManage: 'breakdown.manage',
  userManage: 'user.manage',
};

export const VALID_ROLES = ['admin', 'jefe', 'reportador', 'lector'];

export const ASSET_LEVELS = ['equipment', 'subEquipment', 'part', 'subPart'];

export const ASSET_STATUSES = ['active', 'transferredDeactivated', 'inactive', 'deleted'];

export const WORK_ORDER_PRIORITIES = ['low', 'medium', 'high'];

export const WORK_ORDER_STATUSES = ['pending', 'inProgress', 'completed', 'unfulfilled', 'cancelled'];

export const BREAKDOWN_SEVERITIES = ['low', 'medium', 'high', 'critical'];

export const BREAKDOWN_STATUSES = ['pending', 'inProgress', 'resolved', 'rejected'];

export const MAINTENANCE_TYPES = [
  'Mecánico',
  'Eléctrico',
  'Electrónico',
  'Inspección y Lubricación',
  'Otro',
  'mechanical',
  'electrical',
  'electronic',
  'other',
];

export const PREVENTIVE_FREQUENCIES_CATALOG = [
  { value: 'Diaria', code: 'daily', label: 'Diaria', days: 1 },
  { value: 'Semanal', code: 'weekly', label: 'Semanal', days: 7 },
  { value: 'Quincenal', code: 'biweekly', label: 'Quincenal', days: 15 },
  { value: 'Mensual', code: 'monthly', label: 'Mensual', days: 30 },
  { value: 'Bimestral', code: 'bimonthly', label: 'Bimestral', days: 60 },
  { value: 'Trimestral', code: 'quarterly', label: 'Trimestral', days: 90 },
  { value: 'Semestral', code: 'semiannual', label: 'Semestral', days: 180 },
  { value: 'Anual', code: 'annual', label: 'Anual', days: 365 },
  { value: 'Bianual', code: 'biannual', label: 'Bianual', days: 730 },
];

export const PREVENTIVE_FREQUENCIES = [
  'Diaria',
  'Semanal',
  'Quincenal',
  'Mensual',
  'Bimestral',
  'Trimestral',
  'Semestral',
  'Anual',
  'diaria',
  'semanal',
  'quincenal',
  'mensual',
  'bimestral',
  'trimestral',
  'semestral',
  'anual',
  'daily',
  'weekly',
  'biweekly',
  'monthly',
  'bimonthly',
  'quarterly',
  'semiannual',
  'annual',
];

export const PREVENTIVE_STATUSES = ['active', 'paused', 'completed'];

const ROLE_DEFAULT_PERMISSIONS = {
  admin: Object.values(PERMISSIONS),
  jefe: [
    PERMISSIONS.dashboardView,
    PERMISSIONS.assetView,
    PERMISSIONS.workOrderView,
    PERMISSIONS.workOrderCreate,
    PERMISSIONS.workOrderPrint,
    PERMISSIONS.preventiveView,
    PERMISSIONS.kardexView,
    PERMISSIONS.breakdownView,
    PERMISSIONS.breakdownManage,
  ],
  reportador: [PERMISSIONS.breakdownReport, PERMISSIONS.breakdownView],
  lector: [
    PERMISSIONS.dashboardView,
    PERMISSIONS.assetView,
    PERMISSIONS.workOrderView,
    PERMISSIONS.preventiveView,
    PERMISSIONS.kardexView,
    PERMISSIONS.breakdownView,
  ],
};

export function hasPermission(roleCode, permissions, requiredPermission) {
  if (roleCode === 'admin') {
    return true;
  }

  const effective = new Set(ROLE_DEFAULT_PERMISSIONS[roleCode] ?? []);

  for (const permission of permissions ?? []) {
    effective.add(permission);
  }

  return effective.has(requiredPermission);
}

export function rolePermissions(roleCode, extraPermissions = []) {
  const base = new Set(ROLE_DEFAULT_PERMISSIONS[roleCode] ?? []);
  for (const permission of extraPermissions) {
    base.add(permission);
  }
  return [...base];
}
