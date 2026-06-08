-- Add 'Devuelto' subestado to etapa aprobacion

INSERT INTO catalogo_subestados (etapa_macro, nombre, orden)
VALUES ('aprobacion', 'Devuelto', 4)
ON CONFLICT (etapa_macro, nombre) DO NOTHING;
