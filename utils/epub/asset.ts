export const ISCN_LOCALE_CONFIG = {
  'en': {
    TITLE_LABEL: 'Title',
    AUTHOR_LABEL: 'Author',
    RELEASE_DATE_LABEL: 'Release date',
    DEPUB_DISCLAIMER: 'This book is published on decentralized networks',
  },
  'zh': {
    TITLE_LABEL: '書名',
    AUTHOR_LABEL: '作者',
    RELEASE_DATE_LABEL: '發行日期',
    DEPUB_DISCLAIMER: '此書採用分散式出版',
  },
}

export const ISCN_CSS = `body {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: sans-serif;
  text-align: center;
}

#iscn-page-body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
  padding: 0.5em 2vw 4em;
}

#iscn-page-footer {
  border-top: 1px solid #ccc;
  padding: 0.5em;
}

#iscn-qr-code {
  margin-top: 0.5em;
}

#iscn-prefix {
  font-size: 0.75em;
  font-family: monospace;
  word-break: break-all;
}`

export const ISCN_XHTML = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">

<head>
  <title>ISCN on LikeCoin Chain</title>
  <link href="iscn.css" type="text/css" rel="stylesheet" />
</head>

<body>
  <div id="iscn-page-body">
    <div id="iscn-page-book-info" />
    <div id="iscn-qr-code">
      <img src="iscn-qr-code.png" width="180px" height="180px" />
      <br />
      <a id="iscn-prefix" />
    </div>
  </div>
  <div id="iscn-page-footer">
    <p id="depub-disclaimer" />
  </div>
</body>
</html>
`

export const ISCN_LOGO_SVG = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
<path d="M2.76,14.79H3.92V9.34H2.76Zm7.42-2.72a2.76,2.76,0,0,1,2.7-2.82H13a2.52,2.52,0,0,1,2.32,1.33l-1,.49a1.48,1.48,0,0,0-1.32-.8A1.69,1.69,0,0,0,11.37,12v0A1.7,1.7,0,0,0,13,13.81H13A1.49,1.49,0,0,0,14.36,13l1,.48A2.53,2.53,0,0,1,13,14.84a2.75,2.75,0,0,1-2.86-2.62ZM5.53,13.14a2.4,2.4,0,0,0,1.73.73c.64,0,1-.3,1-.61s-.47-.55-1.1-.69c-.89-.21-2-.45-2-1.67,0-.91.79-1.64,2.07-1.64A3,3,0,0,1,9.27,10l-.65.85a2.31,2.31,0,0,0-1.56-.6c-.52,0-.8.23-.8.56s.46.48,1.09.63c.9.2,2,.47,2,1.68,0,1-.71,1.75-2.18,1.75A3.1,3.1,0,0,1,4.9,14Zm12-2V14.8H16.32V9.34h1.19L20,12.87V9.34H21.2v5.45H20.08ZM8.68,8.22c1.3-.81,3-1.71,3.79-2.2A1.13,1.13,0,0,1,13,5.93a1.17,1.17,0,0,1,.45.09c.84.45,2.47,1.35,3.78,2.16h1.42a1.22,1.22,0,0,0-.32-.28c-1.4-.9-3.51-2.08-4.5-2.6a1.8,1.8,0,0,0-.87-.23,1.73,1.73,0,0,0-.86.23c-1,.52-3.1,1.7-4.5,2.6l-.39.28Zm8.38,7.69c-1.28.78-2.82,1.64-3.63,2.07a1.1,1.1,0,0,1-.47.13,1.19,1.19,0,0,1-.49-.13c-.81-.43-2.35-1.29-3.64-2.07H7.32l.27.19c1.4.9,3.51,2.08,4.5,2.6a1.73,1.73,0,0,0,1.73,0c1-.52,3.1-1.7,4.5-2.6a1.24,1.24,0,0,0,.22-.18H17.06Z" fill="white"/>
</svg>
`
