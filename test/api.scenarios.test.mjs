import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';
import { signToken } from '../src/security/jwt.js';
import { closePool } from '../src/config/db.js';
import { parsePagination } from '../src/utils/pagination.js';

let server;
let baseUrl;
let adminToken;
let lectorToken;

test.before((_, done) => {
  server = http.createServer(app);
  server.listen(0, '127.0.0.1', () => {
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}/api`;
    adminToken = signToken({
      userId: 1,
      username: 'admin',
      displayName: 'Administrador',
      role: 'admin',
      permissions: [],
    });
    lectorToken = signToken({
      userId: 99,
      username: 'lector_test',
      displayName: 'Gerente Test',
      role: 'lector',
      permissions: [],
    });
    done();
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await closePool();
});

test('Pagination helper: parses page/limit, offset/limit and clamps maxLimit', () => {
  assert.deepEqual(parsePagination({}), { limit: null, offset: 0 });
  assert.deepEqual(parsePagination({ page: '2', limit: '25' }), { limit: 25, offset: 25 });
  assert.deepEqual(parsePagination({ offset: '10', limit: '50' }), { limit: 50, offset: 10 });
  assert.deepEqual(parsePagination({ limit: '9999' }, { maxLimit: 500 }), { limit: 500, offset: 0 });
  assert.deepEqual(parsePagination({ page: '-3', limit: '10' }), { limit: 10, offset: 0 });
});

test('Catalogs endpoint: requires auth and returns dynamic DB catalogs when authenticated', async () => {
  const unauth = await fetch(`${baseUrl}/catalogos`);
  assert.equal(unauth.status, 401);

  const res = await fetch(`${baseUrl}/catalogos`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.roles) && data.roles.length >= 5);
  assert.ok(Array.isArray(data.permissions) && data.permissions.length >= 15);
  assert.ok(data.rolePermissions && Array.isArray(data.rolePermissions.jefe));
  assert.ok(Array.isArray(data.positions) && data.positions.length >= 1);
  assert.ok(Array.isArray(data.unitsOfMeasure) && data.unitsOfMeasure.length >= 10);
  assert.ok(Array.isArray(data.attributeCatalog) && data.attributeCatalog.length >= 5);
  assert.ok(data.enums && Array.isArray(data.enums.preventiveFrequencies));
});

test('Attributes & Units of Measure endpoints: full CRUD with integrity checks', async () => {
  // 1. Listar unidades
  const unitsRes = await fetch(`${baseUrl}/catalogos/unidades`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(unitsRes.status, 200);
  const units = await unitsRes.json();
  assert.ok(Array.isArray(units) && units.length > 0);

  // 2. Crear nueva unidad de prueba
  const createUnitRes = await fetch(`${baseUrl}/catalogos/unidades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ code: 'TEST_U', name: 'Unidad de Prueba' }),
  });
  assert.equal(createUnitRes.status, 201);
  const createdUnit = await createUnitRes.json();
  assert.equal(createdUnit.code, 'TEST_U');

  // 3. Listar atributos
  const attrsRes = await fetch(`${baseUrl}/catalogos/atributos`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(attrsRes.status, 200);
  const attrs = await attrsRes.json();
  assert.ok(Array.isArray(attrs) && attrs.length > 0);

  // 4. Crear nuevo atributo de prueba vinculado a la unidad
  const createAttrRes = await fetch(`${baseUrl}/catalogos/atributos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: 'Atributo Test Automático',
      description: 'Atributo para verificar CRUD',
      defaultUnitId: createdUnit.id,
    }),
  });
  assert.equal(createAttrRes.status, 201);
  const createdAttr = await createAttrRes.json();
  assert.equal(createdAttr.name, 'Atributo Test Automático');

  // 5. Eliminar atributo y unidad de prueba
  const delAttrRes = await fetch(`${baseUrl}/catalogos/atributos/${createdAttr.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(delAttrRes.status, 200);

  const delUnitRes = await fetch(`${baseUrl}/catalogos/unidades/${createdUnit.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(delUnitRes.status, 200);
});

test('Employees endpoint: returns normalized PuestoId & respects pagination', async () => {
  const res = await fetch(`${baseUrl}/empleados?limit=2&offset=0`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(res.status, 200);
  const rows = await res.json();
  assert.ok(Array.isArray(rows));
  assert.ok(rows.length <= 2);
  if (rows.length > 0) {
    assert.ok(rows[0].PuestoId !== undefined, 'Debe incluir PuestoId normalizado');
    assert.ok(rows[0].Puesto, 'Debe incluir Puesto');
  }
});

test('Scalability pagination: work orders, breakdowns, kardex and asset search accept limit & page', async () => {
  const headers = { Authorization: `Bearer ${adminToken}` };

  const [woRes, brRes, kxRes, asRes] = await Promise.all([
    fetch(`${baseUrl}/ordenes-trabajo?limit=3&page=1`, { headers }),
    fetch(`${baseUrl}/reportes-averia?limit=3&page=1`, { headers }),
    fetch(`${baseUrl}/kardex?limit=3&offset=0`, { headers }),
    fetch(`${baseUrl}/activos/buscar?q=&limit=3&offset=0`, { headers }),
  ]);

  assert.equal(woRes.status, 200);
  assert.equal(brRes.status, 200);
  assert.equal(kxRes.status, 200);
  assert.equal(asRes.status, 200);

  const [wos, brs, kxs, assets] = await Promise.all([
    woRes.json(),
    brRes.json(),
    kxRes.json(),
    asRes.json(),
  ]);

  assert.ok(Array.isArray(wos) && wos.length <= 3);
  assert.ok(Array.isArray(brs) && brs.length <= 3);
  assert.ok(Array.isArray(kxs) && kxs.length <= 3);
  assert.ok(Array.isArray(assets) && assets.length <= 3);
});

test('RBAC enforcement: lector cannot create work order or manage employees (403)', async () => {
  const headers = {
    Authorization: `Bearer ${lectorToken}`,
    'Content-Type': 'application/json',
  };

  const woCreate = await fetch(`${baseUrl}/ordenes-trabajo`, {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  });
  assert.equal(woCreate.status, 403);

  const empCreate = await fetch(`${baseUrl}/empleados`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ fullName: 'Test', position: 'Técnico' }),
  });
  assert.equal(empCreate.status, 403);
});

test('Asset Tree Cloning and Templates: clone tree, create template and instantiate', async () => {
  // 1. Crear un equipo raíz para probar con observaciones
  const createRootRes = await fetch(`${baseUrl}/activos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: 'Equipo Prueba Clonacion',
      areaId: 'A005',
      level: 'equipment',
      observations: 'Observacion inicial de prueba',
    }),
  });
  assert.equal(createRootRes.status, 201);
  const rootAsset = await createRootRes.json();
  const rootCode = rootAsset.assetCode || rootAsset.CodigoActivo;

  // 2. Crear un hijo para el equipo
  const createChildRes = await fetch(`${baseUrl}/activos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: 'Sub-equipo Prueba',
      areaId: 'A005',
      level: 'subEquipment',
      parentAssetCode: rootCode,
      observations: 'Motor componente',
    }),
  });
  assert.equal(createChildRes.status, 201);

  // 3. Clonar el árbol a otra área (ej: A006)
  const cloneRes = await fetch(`${baseUrl}/activos/${rootCode}/clonar-arbol`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      targetAreaId: 'A006',
      newRootName: 'Equipo Clonado en A006',
      observations: 'Clonado desde A005',
      copyAttributes: true,
    }),
  });
  assert.equal(cloneRes.status, 201);
  const cloneResult = await cloneRes.json();
  assert.ok(cloneResult.CodigoActivo || cloneResult.assetCode);
  assert.equal(cloneResult.totalNodos, 2);

  // 4. Guardar como plantilla
  const saveTplRes = await fetch(`${baseUrl}/plantillas-activos/desde-activo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      sourceAssetCode: rootCode,
      name: `Plantilla Test ${Date.now()}`,
      description: 'Plantilla creada para tests',
    }),
  });
  assert.equal(saveTplRes.status, 201);
  const tplData = await saveTplRes.json();
  assert.ok(tplData.PlantillaId || tplData.id);
  const tplId = tplData.PlantillaId || tplData.id;

  // 5. Listar plantillas
  const listTplRes = await fetch(`${baseUrl}/plantillas-activos`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(listTplRes.status, 200);
  const tpls = await listTplRes.json();
  assert.ok(Array.isArray(tpls) && tpls.length > 0);

  // 6. Instanciar plantilla en A007
  const instRes = await fetch(`${baseUrl}/plantillas-activos/${tplId}/instanciar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      targetAreaId: 'A007',
      newRootName: 'Equipo desde Plantilla en A007',
      observations: 'Instanciado de prueba',
      copyAttributes: true,
    }),
  });
  assert.equal(instRes.status, 201);
  const instData = await instRes.json();
  assert.ok(instData.CodigoActivo || instData.assetCode);
  assert.equal(instData.totalNodos, 2);

  // 7. Eliminar plantilla
  const delTplRes = await fetch(`${baseUrl}/plantillas-activos/${tplId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(delTplRes.status, 200);
});

test('Asset Status update and Work Order creation from breakdown report', async () => {
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` };

  // 1. Crear activo para prueba
  const createRes = await fetch(`${baseUrl}/activos`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      areaId: 'A005',
      name: 'Activo Test Estado y OT',
      brand: 'TestBrand',
      model: 'TestModel',
      level: 'equipment',
      status: 'active',
      observations: 'Observaciones de prueba',
    }),
  });
  assert.equal(createRes.status, 201);
  const createdAsset = await createRes.json();
  const assetCode = createdAsset.CodigoActivo || createdAsset.assetCode;
  assert.ok(assetCode);

  // 2. Cambiar estado a inactive via PATCH /api/activos/:id/estado
  const patchStatusRes = await fetch(`${baseUrl}/activos/${assetCode}/estado`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      newStatus: 'inactive',
      reason: 'Prueba cambio a inactivo',
    }),
  });
  assert.equal(patchStatusRes.status, 200);

  // 3. Reactivar via PATCH /api/activos/:id/estado
  const patchActiveRes = await fetch(`${baseUrl}/activos/${assetCode}/estado`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      newStatus: 'active',
      reason: 'Prueba reactivacion',
    }),
  });
  assert.equal(patchActiveRes.status, 200);

  // 4. Cambiar estado via PUT /api/activos/:id
  const putRes = await fetch(`${baseUrl}/activos/${assetCode}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      name: 'Activo Test Actualizado',
      status: 'inactive',
      observations: 'Observacion actualizada',
    }),
  });
  assert.equal(putRes.status, 200);

  // 5. Crear reporte de averia sobre este activo
  const repRes = await fetch(`${baseUrl}/reportes-averia`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      assetCode,
      assetName: 'Activo Test Actualizado',
      areaId: 'A005',
      description: 'Falla de prueba para generar OT',
      severity: 'medium',
    }),
  });
  assert.equal(repRes.status, 201);
  const repData = await repRes.json();
  const reportId = repData.reportId || repData.id || repData.ReporteId;

  // 6. Generar OT tras reporte de avería (con areaId vacio para verificar auto-resolucion de area)
  const otRes = await fetch(`${baseUrl}/ordenes-trabajo`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      assetCode,
      assetName: 'Activo Test Actualizado',
      areaId: '', // Cadena vacia para verificar auto-resolución en SP
      description: 'Mantenimiento correctivo por averia',
      priority: 'high',
      reportId: reportId ? Number(reportId) : null,
      workTypes: ['corrective'],
      materials: [{ description: 'Filtro de aire', quantity: 1, unit: 'pz' }],
    }),
  });
  assert.equal(otRes.status, 201);
  const otData = await otRes.json();
  assert.ok(otData.WorkOrderId || otData.workOrderId);
});

test('Brands catalog CRUD & Maintenance by Cost Center analytics', async () => {
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` };

  // 1. Listar marcas iniciales
  const listRes = await fetch(`${baseUrl}/catalogos/marcas`, { headers });
  assert.equal(listRes.status, 200);
  const brands = await listRes.json();
  assert.ok(Array.isArray(brands) && brands.length > 0);

  // 2. Crear nueva marca
  const brandName = `MarcaTest_${Date.now()}`;
  const createRes = await fetch(`${baseUrl}/catalogos/marcas`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: brandName, description: 'Marca de prueba unitaria' }),
  });
  assert.equal(createRes.status, 201);
  const createdBrand = await createRes.json();
  assert.equal(createdBrand.name, brandName);
  const brandId = createdBrand.id;

  // 3. Actualizar marca
  const updateRes = await fetch(`${baseUrl}/catalogos/marcas/${brandId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ name: `${brandName}_Updated`, description: 'Descripcion editada' }),
  });
  assert.equal(updateRes.status, 200);
  const updatedBrand = await updateRes.json();
  assert.equal(updatedBrand.name, `${brandName}_Updated`);

  // 4. Eliminar marca
  const delRes = await fetch(`${baseUrl}/catalogos/marcas/${brandId}`, {
    method: 'DELETE',
    headers,
  });
  assert.equal(delRes.status, 200);

  // 5. Verificar métricas de mantenimiento por centro de costo
  const costCenterRes = await fetch(`${baseUrl}/dashboard/mantenimientos-centro-costo`, { headers });
  assert.equal(costCenterRes.status, 200);
  const ccRows = await costCenterRes.json();
  assert.ok(Array.isArray(ccRows) && ccRows.length > 0);
  const firstCC = ccRows[0];
  assert.ok(firstCC.costCenter || firstCC.CentroCosto);
  assert.ok('totalMaintenance' in firstCC || 'TotalMantenimientos' in firstCC);

  // 6. Verificar detalle de mantenimientos por centro de costo
  const ccDetailRes = await fetch(`${baseUrl}/dashboard/mantenimientos-centro-costo/detalle?costCenter=${firstCC.costCenter || firstCC.CentroCosto}`, { headers });
  assert.equal(ccDetailRes.status, 200);
  const details = await ccDetailRes.json();
  assert.ok(Array.isArray(details));
});
