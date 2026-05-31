ALTER TABLE usuarios
ADD CONSTRAINT chk_usuarios_role
CHECK (role IN ('USER', 'ADMIN'));
