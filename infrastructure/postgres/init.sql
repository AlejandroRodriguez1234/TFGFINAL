-- ============================================================
--  FitForge - Database initialization
--  Run on first startup by Docker entrypoint
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- for LIKE performance

-- ─── Diet service tables ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS food_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255) NOT NULL,
    brand               VARCHAR(255),
    barcode             VARCHAR(100) UNIQUE,
    calories            NUMERIC(8,2)  NOT NULL DEFAULT 0,
    protein             NUMERIC(8,2)  NOT NULL DEFAULT 0,
    carbs               NUMERIC(8,2)  NOT NULL DEFAULT 0,
    fat                 NUMERIC(8,2)  NOT NULL DEFAULT 0,
    fiber               NUMERIC(8,2),
    sugar               NUMERIC(8,2),
    sodium              NUMERIC(8,2),
    serving_size        NUMERIC(8,2)  NOT NULL DEFAULT 100,
    serving_unit        VARCHAR(20)   NOT NULL DEFAULT 'g',
    image_url           VARCHAR(500),
    source              VARCHAR(50)   NOT NULL DEFAULT 'custom',
    created_by_user_id  UUID,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_name    ON food_items USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_food_barcode ON food_items(barcode);

CREATE TABLE IF NOT EXISTS meal_entries (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL,
    food_item_id UUID NOT NULL REFERENCES food_items(id) ON DELETE RESTRICT,
    meal_type    VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
    quantity     NUMERIC(8,2) NOT NULL,
    logged_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_user_date ON meal_entries(user_id, logged_at DESC);

CREATE TABLE IF NOT EXISTS diet_plans (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL,
    name             VARCHAR(255) NOT NULL,
    description      TEXT,
    target_calories  INTEGER NOT NULL,
    target_protein   NUMERIC(6,1) NOT NULL,
    target_carbs     NUMERIC(6,1) NOT NULL,
    target_fat       NUMERIC(6,1) NOT NULL,
    start_date       DATE NOT NULL,
    end_date         DATE,
    is_active        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hydration_logs (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL,
    amount_ml  INTEGER NOT NULL,
    logged_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hydration_user_date ON hydration_logs(user_id, logged_at DESC);

-- ─── Seed basic food items ────────────────────────────────────────────────────
INSERT INTO food_items (name, calories, protein, carbs, fat, serving_size, serving_unit, source) VALUES
    ('Pechuga de pollo (cocida)', 165, 31, 0,   3.6, 100, 'g', 'system'),
    ('Arroz blanco cocido',       130, 2.7, 28, 0.3, 100, 'g', 'system'),
    ('Arroz integral cocido',     111, 2.6, 23, 0.9, 100, 'g', 'system'),
    ('Avena',                     389, 17,  66, 7,   100, 'g', 'system'),
    ('Huevo entero',              155, 13,  1.1,11,  100, 'g', 'system'),
    ('Clara de huevo',             52, 11,  0.7, 0.2,100, 'g', 'system'),
    ('Salmón',                    208, 20,  0,   13, 100, 'g', 'system'),
    ('Atún en agua',              116, 26,  0,   1,  100, 'g', 'system'),
    ('Brócoli',                    34,  2.8, 7,  0.4,100, 'g', 'system'),
    ('Espinacas',                  23,  2.9, 3.6,0.4,100, 'g', 'system'),
    ('Plátano',                    89,  1.1,23,  0.3,100, 'g', 'system'),
    ('Manzana',                    52,  0.3,14,  0.2,100, 'g', 'system'),
    ('Almendras',                 579, 21,  22,  50, 100, 'g', 'system'),
    ('Yogur griego natural',       59,  10,  3.6, 0.4,100,'g', 'system'),
    ('Leche entera',               61,  3.2, 4.8, 3.3,100,'g', 'system'),
    ('Proteína whey (media)',      370, 80,  6,   4,  100, 'g', 'system'),
    ('Aceite de oliva',            884,  0,   0,  100, 100, 'g', 'system'),
    ('Patata cocida',               87,  1.9,20,  0.1,100, 'g', 'system'),
    ('Pan integral',               247,  9,  41,  3.4,100, 'g', 'system'),
    ('Pasta integral cocida',      124,  5,  26,  1.1,100, 'g', 'system')
ON CONFLICT DO NOTHING;
