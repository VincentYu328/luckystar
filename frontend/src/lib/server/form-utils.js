// frontend/src/lib/server/form-utils.js (最终完善版本)

export function cleanForm(formDataObject) {
    const cleaned = {};
    for (const key in formDataObject) {
        let value = formDataObject[key];
        if (typeof value === 'string') {
            value = value.trim();

            // ----------------------------------------------------------------------
            // !!! 关键修改：对于允许为空但应为字符串的字段，保持为空字符串而不是 null
            // 例如：email, address, wechat, whatsapp
            // 如果你后端 API 明确接受 null，则可以改回 null。
            // 但如果后端期望空字符串，或者你前端验证要求非空但接收空字符串，这里就应该保持 ""
            if (value === '') {
                // 对于这些字段，保持为空字符串。除非你明确知道后端喜欢 null
                // 也可以根据字段名判断：
                if (['email', 'address', 'wechat', 'whatsapp'].includes(key)) {
                    cleaned[key] = ''; // 保持空字符串
                } else {
                    cleaned[key] = null; // 其他空字符串字段可以转换为 null
                }
            } 
            // ----------------------------------------------------------------------
            else if (['password', 'confirm_password', 'full_name'].includes(key)) {
                // password, confirm_password, full_name 始终保持为字符串
                cleaned[key] = value; 
            }
            else if (key === 'phone') {
                // 电话号码可能包含前导零或特殊字符，通常应保持为字符串
                cleaned[key] = value;
            }
            else if (!isNaN(Number(value)) && !isNaN(parseFloat(value))) {
                // 如果是数字字符串，尝试转换为数字 (仅对那些你明确希望是数字的字段)
                cleaned[key] = Number(value);
            } else {
                cleaned[key] = value;
            }
        } else {
            cleaned[key] = value;
        }
    }
    return cleaned;
}