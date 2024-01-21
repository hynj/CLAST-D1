// This does mean dev enviroment uses Scrypt whereas prod uses argon2id
// This shouldn't be a problem, it would be strange to import / export dev users to production?
import { dev } from "$app/environment";
import { Scrypt } from "lucia";

export const argonHash = async (platform: App.Platform | undefined, password: string): Promise<string | null> => {
  if (dev) {
    return await new Scrypt().hash(password);
  }
  //TODO: Implement error handling, this should probably throw?
  if (!platform) return null;

  const Argon2Binding = platform.env.WASM;
  const data = {
    password: password
  }

  const fetchHash = await Argon2Binding.fetch("https://internal/hash", {
    body: JSON.stringify(data),
    method: 'POST'
  })

  if (fetchHash.ok) {
    const { hash } = await fetchHash.json();
    return hash;
  }
  return null;
}


export const argonVerify = async (platform: App.Platform | undefined, hash: string, password: string): Promise<boolean> => {
  if (dev) {
    return await new Scrypt().verify(hash, password);
  }
  if (!platform) return false;

  const Argon2Binding = platform.env.WASM;
  const data = {
    password: password,
    hash: hash
  }
  const fetchHash = await Argon2Binding.fetch("https://internal/verify", {
    body: JSON.stringify(data),
    method: 'POST'
  })

  if (fetchHash.ok) {
    const { matches } = await fetchHash.json();
    if (matches) return true
  }
  return false
}

