// backend/src/data/sizechart-dao.js
import db from '../database/db.js';

class SizeChartDAO {

  // =====================================================
  // size_charts 主表
  // =====================================================

  static getAllCharts() {
    return db.prepare(`
      SELECT sc.*, pc.name AS category_name
      FROM size_charts sc
      LEFT JOIN product_categories pc ON pc.id = sc.category_id
      ORDER BY sc.id DESC
    `).all();
  }

  static getChartById(id) {
    return db.prepare(`
      SELECT sc.*, pc.name AS category_name
      FROM size_charts sc
      LEFT JOIN product_categories pc ON pc.id = sc.category_id
      WHERE sc.id = ?
    `).get(id);
  }

  static createChart(data) {
    const stmt = db.prepare(`
      INSERT INTO size_charts (
        name, gender, category_id, notes
      )
      VALUES (?, ?, ?, ?)
    `);

    return stmt.run(
      data.name,
      data.gender || null,
      data.category_id || null,
      data.notes || null
    );
  }

  static updateChart(id, fields) {
    const allowed = ['name', 'gender', 'category_id', 'notes'];
    const keys = Object.keys(fields).filter(k => allowed.includes(k));
    if (!keys.length) return;

    const clause = keys.map(k => `${k} = ?`).join(', ');
    const params = keys.map(k => fields[k]);
    params.push(id);

    return db.prepare(`
      UPDATE size_charts
      SET ${clause}
      WHERE id = ?
    `).run(...params);
  }

  static deleteChart(id) {
    return db.prepare(`
      DELETE FROM size_charts WHERE id = ?
    `).run(id);
  }


  // =====================================================
  // size_chart_items 子表
  // =====================================================

  static getItemsByChart(chartId) {
    return db.prepare(`
      SELECT *
      FROM size_chart_items
      WHERE chart_id = ?
      ORDER BY id ASC
    `).all(chartId);
  }

  static getItemById(id) {
    return db.prepare(`
      SELECT *
      FROM size_chart_items
      WHERE id = ?
    `).get(id);
  }

  static createItem(data) {
    const stmt = db.prepare(`
      INSERT INTO size_chart_items (
        chart_id, size_label,
        chest, waist, hip, height,
        shoulder, sleeve, inseam,
        length, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      data.chart_id,
      data.size_label,
      data.chest || null,
      data.waist || null,
      data.hip || null,
      data.height || null,
      data.shoulder || null,
      data.sleeve || null,
      data.inseam || null,
      data.length || null,
      data.notes || null
    );
  }

  static updateItem(id, fields) {
    const allowed = [
      'size_label', 'chest', 'waist', 'hip', 'height',
      'shoulder', 'sleeve', 'inseam', 'length', 'notes'
    ];

    const keys = Object.keys(fields).filter(k => allowed.includes(k));
    if (!keys.length) return;

    const clause = keys.map(k => `${k} = ?`).join(', ');
    const params = keys.map(k => fields[k]);
    params.push(id);

    return db.prepare(`
      UPDATE size_chart_items
      SET ${clause}
      WHERE id = ?
    `).run(...params);
  }

  static deleteItem(id) {
    return db.prepare(`
      DELETE FROM size_chart_items WHERE id = ?
    `).run(id);
  }
}

export default SizeChartDAO;
