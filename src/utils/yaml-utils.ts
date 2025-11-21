import yaml from 'js-yaml';

// 递归处理对象中的所有字符串，将 \r\n 转换为 \n
function normalizeLineEndings(value: any): any {
  if (typeof value === 'string') {
    return value.replace(/\r\n/g, '\n');
  } else if (Array.isArray(value)) {
    return value.map(normalizeLineEndings);
  } else if (value && typeof value === 'object') {
    const result: any = {};
    for (const key in value) {
      result[key] = normalizeLineEndings(value[key]);
    }
    return result;
  }
  return value;
}

export const toYaml = (obj: any): string => {
  try {
    // 先规范化换行符
    const normalized = normalizeLineEndings(obj);

    return yaml.dump(normalized, {
      lineWidth: -1,        // 禁用自动换行，让 js-yaml 自动选择最佳格式
      noRefs: true,         // 禁用引用
      noCompatMode: false,  // 保持兼容模式
      condenseFlow: false,  // 不压缩 flow 格式
      quotingType: '"',     // 使用双引号
      forceQuotes: false    // 不强制所有字符串加引号
    });
  } catch (e) {
    console.error('YAML Dump Error', e);
    return '';
  }
};

export const parseYaml = (str: string): any => {
  try {
    return yaml.load(str);
  } catch (e) {
    console.error('YAML Parse Error', e);
    return null;
  }
};
