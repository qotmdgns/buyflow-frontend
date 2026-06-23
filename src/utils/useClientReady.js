"use client"

import { useSyncExternalStore } from "react"

const SERVER_SNAPSHOT = "server"
const CLIENT_SNAPSHOT = "client"

function subscribeClientReady() {
  return () => {}
}

function getClientSnapshot() {
  return typeof window === "undefined" ? SERVER_SNAPSHOT : CLIENT_SNAPSHOT
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT
}

export default function useClientReady() {
  return (
    useSyncExternalStore(
      subscribeClientReady,
      getClientSnapshot,
      getServerSnapshot,
    ) === CLIENT_SNAPSHOT
  )
}
