CREATE TABLE Proveedor (
    id INT IDENTITY PRIMARY KEY,
    nombre NVARCHAR(200) NOT NULL UNIQUE
);

CREATE TABLE Documento (
    id INT IDENTITY PRIMARY KEY,
    nombre_archivo NVARCHAR(255) NOT NULL,
    tipo_mime VARCHAR(50) NOT NULL,
    tamano_bytes INT NOT NULL,
    fecha_carga DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    respuesta_llm NVARCHAR(MAX) NOT NULL
);

CREATE TABLE Factura (
    id INT IDENTITY PRIMARY KEY,
    proveedor_id INT NOT NULL REFERENCES Proveedor(id),
    documento_id INT NOT NULL UNIQUE REFERENCES Documento(id),
    numero_factura NVARCHAR(100) NOT NULL,
    fecha_emision DATE NOT NULL,
    total DECIMAL(18,2) NOT NULL CHECK (total > 0),
    moneda CHAR(3) NOT NULL,
    fecha_limite_pago DATE NULL,
    numero_cliente NVARCHAR(100) NULL,
    eliminada BIT NOT NULL DEFAULT 0
);

--Indices
CREATE UNIQUE INDEX UX_Factura_proveedor_numero
    ON Factura(proveedor_id, numero_factura) WHERE eliminada = 0;
CREATE INDEX IX_Factura_fecha ON Factura(fecha_emision);