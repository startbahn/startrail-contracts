import { createHash } from 'crypto'

/**
 * Return the hash of a given string or object.
 *
 * Objects are converted to strings using JSON.stringify which is spec'd
 * here: https://tc39.es/ecma262/#sec-json.stringify We assume that different
 * implementions - node, browsers, etc. return identical strings for a given
 * object but if this is not the case the hashes will break.
 *
 * @param message string or object to hash
 * @return sha256 hash of the message
 */
const sha256 = (message: string | object): string => {
  const messageStr =
    typeof message === 'object' ? JSON.stringify(message) : message
  return createHash(`sha256`).update(messageStr).digest('hex')
}

export { sha256 }
