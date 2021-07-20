import util from 'util'

if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = util.TextEncoder;
}

if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = util.TextDecoder as typeof TextDecoder;
}
