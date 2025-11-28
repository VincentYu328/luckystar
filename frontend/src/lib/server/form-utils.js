// frontend/src/lib/server/form-utils.js
export function cleanForm(data) {
    const out = {};
    for (const [k, v] of Object.entries(data)) {
        if (v === '' || v === undefined) {
            out[k] = null;
        } else if (!isNaN(v) && v !== null && v !== '') {
            // 确保只有纯数字字符串才转换为数字，避免 " " 或其他非数字字符串被转为 NaN
            out[k] = Number(v);
        } else {
            out[k] = v;
        }
    }
    return out;
}