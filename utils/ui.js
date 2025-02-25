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
export function copyToClipboard(text){
  const copyText = document.createElement('p');
  copyText.textContent = text;
  document.body.appendChild(copyText);
  const selection = document.getSelection();
  const range = document.createRange();
  range.selectNode(copyText);
  selection.removeAllRanges();
  selection.addRange(range);
  document.execCommand('copy');
  selection.removeAllRanges();
  document.body.removeChild(copyText);
}

export function extractIscnIdPrefix(iscnId) {
  const regex = /^(iscn:\/\/likecoin-chain\/[^/]+)/;
  const match = iscnId.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

export function formatIpfs(ipfsHash) {
  return `ipfs://${ipfsHash}`
}

export function formatArweave(arweaveId, key) {
  if (key) {
    const url = new URL(`ar://${arweaveId}`);
    url.searchParams.append('key', key);
    return url.toString();
  }
  return `ar://${arweaveId}`
}
