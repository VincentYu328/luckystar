// backend/src/services/sizechartService.js
import SizeChartDAO from '../data/sizechart-dao.js';
import UsersDAO from '../data/users-dao.js';

class SizeChartService {

  // =====================================================
  // 尺码表（主表 size_charts）
  // =====================================================

  static getAllCharts() {
    return SizeChartDAO.getAllCharts();
  }

  static getChartById(chartId) {
    const chart = SizeChartDAO.getChartById(chartId);
    if (!chart) throw new Error('Size chart not found');
    return chart;
  }

  static createChart(adminId, payload) {
    const { name } = payload;
    if (!name) throw new Error('Chart name is required');

    const result = SizeChartDAO.createChart(payload);

    UsersDAO.logAction({
      userId: adminId,
      action: 'size_chart_created',
      targetType: 'size_chart',
      targetId: result.lastInsertRowid,
      details: payload
    });

    return {
      success: true,
      id: result.lastInsertRowid
    };
  }

  static updateChart(adminId, chartId, fields) {
    const exist = SizeChartDAO.getChartById(chartId);
    if (!exist) throw new Error('Size chart not found');

    SizeChartDAO.updateChart(chartId, fields);

    UsersDAO.logAction({
      userId: adminId,
      action: 'size_chart_updated',
      targetType: 'size_chart',
      targetId: chartId,
      details: fields
    });

    return { success: true };
  }

  static deleteChart(adminId, chartId) {
    SizeChartDAO.deleteChart(chartId);

    UsersDAO.logAction({
      userId: adminId,
      action: 'size_chart_deleted',
      targetType: 'size_chart',
      targetId: chartId,
      details: null
    });

    return { success: true };
  }


  // =====================================================
  // 尺码表项目（子表 size_chart_items）
  // =====================================================

  static getItemsByChart(chartId) {
    return SizeChartDAO.getItemsByChart(chartId);
  }

  static getItemById(itemId) {
    const item = SizeChartDAO.getItemById(itemId);
    if (!item) throw new Error('Size chart item not found');
    return item;
  }

  static createItem(adminId, payload) {
    const { chart_id, size_label } = payload;

    if (!chart_id) throw new Error('chart_id is required');
    if (!size_label) throw new Error('size_label is required');

    // 确保尺码表存在
    const chart = SizeChartDAO.getChartById(chart_id);
    if (!chart) throw new Error('Parent size chart not found');

    const result = SizeChartDAO.createItem(payload);

    UsersDAO.logAction({
      userId: adminId,
      action: 'size_chart_item_created',
      targetType: 'size_chart_item',
      targetId: result.lastInsertRowid,
      details: payload
    });

    return {
      success: true,
      id: result.lastInsertRowid
    };
  }

  static updateItem(adminId, itemId, fields) {
    const exist = SizeChartDAO.getItemById(itemId);
    if (!exist) throw new Error('Size chart item not found');

    SizeChartDAO.updateItem(itemId, fields);

    UsersDAO.logAction({
      userId: adminId,
      action: 'size_chart_item_updated',
      targetType: 'size_chart_item',
      targetId: itemId,
      details: fields
    });

    return { success: true };
  }

  static deleteItem(adminId, itemId) {
    SizeChartDAO.deleteItem(itemId);

    UsersDAO.logAction({
      userId: adminId,
      action: 'size_chart_item_deleted',
      targetType: 'size_chart_item',
      targetId: itemId,
      details: null
    });

    return { success: true };
  }
}

export default SizeChartService;
