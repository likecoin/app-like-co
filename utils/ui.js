export function ellipsis(value) {
  if (value) {
    const len = value?.length;
    const dots = '...';
    if (!value) return '';
    if (value.length > 20) {
      return value.substring(0, 8) + dots + value.substring(len - 3, len);
    }
    return value;
  }
  return value;
}

export function ellipsisDescription(value) {
  if (value) {
    const len = value?.length;
    const dots = '...';
    if (!value) return '';
    if (value.length > 50) {
      return value.substring(0, 40) + dots + value.substring(len - 5, len);
    }
    return value;
  }
  return value;
}
