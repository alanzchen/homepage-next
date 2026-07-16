export default async function Fetcher(...args) {
  const res = await fetch(...args)

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`)
  }

  return res.json()
}
