const pool = require("../utils/SqlConfig");

const allData = async (data, table, condition) => {
  try {
    const results = await pool.query(
      `SELECT ${data} FROM ${table} ${condition}`
    );
    return results;
  } catch (err) {
    return err;
  }
};

const Insert = async (table, fields, fieldValues, values) => {
  try {
    const results = await pool.query(
      `INSERT INTO ${table} (${fields}) VALUES (${values})`,
      fieldValues
    );
    return results;
  } catch (err) {
    return err;
  }
};

const Update = async (table, fieldValues, values, condition) => {
  try {
    const results = await pool.query(
      `UPDATE ${table} SET ${values}  ${condition}`,
      fieldValues
    );
    return results;
  } catch (err) {
    return err;
  }
};

const Delete = async (table, condition) => {
  try {
    const results = await pool.query(`DELETE FROM ${table} ${condition}`);
    return results;
  } catch (err) {
    return err;
  }
};

exports.allData = allData;
exports.Insert = Insert;
exports.Update = Update;
exports.Delete = Delete;
