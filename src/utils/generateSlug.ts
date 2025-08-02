import { nanoid } from 'nanoid'

export function generateSlug(length = 7) {
  return nanoid(length)
}
