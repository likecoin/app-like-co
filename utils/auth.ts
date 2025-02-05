import { jwtDecode } from "jwt-decode";
import { SIGN_AUTHORIZATION_PERMISSIONS } from "~/constant";

const AUTH_SESSION_KEY = 'likecoin_nft_book_press_token'

export function checkJwtTokenValidity(token: string) {
  try {
    const decoded = jwtDecode(token)
    if (!decoded) {
      return false
    }
    const isExpired = decoded.exp && decoded.exp * 1000 < Date.now()
    const isMatchPermissions =
      Array.isArray((decoded as any).permissions) &&
      (decoded as any).permissions.length ===
        SIGN_AUTHORIZATION_PERMISSIONS.length &&
      (decoded as any).permissions.every((perm: string) =>
        SIGN_AUTHORIZATION_PERMISSIONS.includes(perm),
      )
    return !isExpired && isMatchPermissions
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return false
  }
}

export function loadAuthSession () {
  try {
    if (window.localStorage) {
      const data = window.localStorage.getItem(AUTH_SESSION_KEY)
      if (data) {
        const { wallet, token } = JSON.parse(data)
        return {
          wallet,
          token,
        }
      }
    }
  } catch {}

  return null
}

export function saveAuthSession (session: { wallet: string, token: string }) {
  try {
    if (!window.localStorage) { return }

    window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
  } catch {}
}

export function clearAuthSession () {
  try {
    if (!window.localStorage) { return }

    window.localStorage.removeItem(AUTH_SESSION_KEY)
  } catch {}
}