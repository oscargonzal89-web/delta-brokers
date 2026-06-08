/** Authorized financing banks shown in dropdowns across the app. */
export const BANCOS = [
  'BANCOLOMBIA S.A.',
  'BANCO DAVIVIENDA S.A.',
  'BANCO BBVA COLOMBIA S.A.',
  'BANCO DE BOGOTA S.A.',
  'BANCO CAJA SOCIAL - BCSC S.A.',
  'BANCO AV VILLAS S.A.',
  'SCOTIABANK COLPATRIA S.A.',
] as const;

export type BancoOption = (typeof BANCOS)[number];

/** Housing types for projects. */
export const TIPOS_VIVIENDA = ['VIS', 'MAYOR A VIS', 'EMPRESARIAL', 'VIP'] as const;

export type TipoVivienda = (typeof TIPOS_VIVIENDA)[number];

export const CIUDADES = [
  'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga',
] as const;
