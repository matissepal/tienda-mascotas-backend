import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";
import { fileURLToPath } from "url";

// __dirname FIX para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar config.json SIN import (Node 22 ya exige assert)
const configPath = path.join(__dirname, "../config/config.json");
const rawConfig = fs.readFileSync(configPath, "utf8");
const configFile = JSON.parse(rawConfig);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = configFile[env];

export const db = {};
export let sequelize;

// Crear conexión
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Cargar modelos automáticamente
const modelFiles = fs.readdirSync(__dirname).filter((file) => {
  return (
    file.indexOf(".") !== 0 &&
    file !== basename &&
    file.endsWith(".js") &&
    !file.endsWith(".test.js")
  );
});

for (const file of modelFiles) {
  const modelPath = path.join(__dirname, file);
  const module = await import(modelPath);
  const model = module.default(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

// Ejecutar asociaciones
Object.values(db).forEach((model) => {
  if (model.associate) model.associate(db);
});

// Exportar
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;

