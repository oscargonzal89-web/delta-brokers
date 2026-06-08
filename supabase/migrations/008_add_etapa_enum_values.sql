-- Step 1: extend etapa_macro enum (must commit before using new values)

ALTER TYPE etapa_macro ADD VALUE IF NOT EXISTS 'estado_cliente';
ALTER TYPE etapa_macro ADD VALUE IF NOT EXISTS 'negados';
