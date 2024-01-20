// This does mean dev enviroment uses Scrypt whereas prod uses argon2id
// This shouldn't be a problem, it would be strange to import / export dev users to production?
// This contains function that use a wasm worker in CF to speed up hasing and therefore login / logout
import { dev } from "$app/environment";
import { Scrypt } from "lucia";

export const argonHash = async (platform: App.Platform | undefined, password: string): Promise<string | null> => {
  if (dev) {
    return await new Scrypt().hash(password);
  }
  //TODO: Implement error handling, this should probably throw?
  if (!platform) return null;

  const wasmI = platform.env.WASM;
  const data = {
    type: 'hash',
    password: password
  }
  const fetchHash = await wasmI.fetch("https://workerbinding.com", {
    headers: {
      "X-Source": "Cloudflare-Workers",
    },
    body: JSON.stringify(data),
    method: 'POST'
  })

  if (fetchHash.ok) {
    return await fetchHash.text()
  }
  return null;
}


export const argonVerify = async (platform: App.Platform | undefined, hash: string, password: string): Promise<boolean> => {
  if (dev) {
    return await new Scrypt().verify(hash, password);
  }
  if (!platform) return false;

  const wasmI = platform.env.WASM;
  const data = {
    type: 'verify',
    password: password,
    hash: hash
  }
  const fetchHash = await wasmI.fetch("https://workerbinding.com", {
    headers: {
      "X-Source": "Cloudflare-Workers",
    },
    body: JSON.stringify(data),
    method: 'POST'
  })

  if (fetchHash.ok) {
    return true;
  }
  return false
}

