"use client"

import * as React from "react"

const COOKIE_NAME = "overlens_last_system"
const ONE_YEAR = 60 * 60 * 24 * 365

/**
 * Writes a cookie with the slug of the system the user is currently in.
 * The chat layout reads it to keep the user "anchored" to the system they
 * came from (so clicking Diretrizes from chat shows the right docs).
 */
export function SystemTracker({ slug }: { slug: string }) {
  React.useEffect(() => {
    document.cookie = `${COOKIE_NAME}=${slug}; path=/; max-age=${ONE_YEAR}; SameSite=Lax`
  }, [slug])
  return null
}
