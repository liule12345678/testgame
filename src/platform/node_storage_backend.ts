import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { register_storage_backend } from "../core/storage_backend"

register_storage_backend({
  exists: key => existsSync(resolve(process.cwd(), key)),
  read: key => readFileSync(resolve(process.cwd(), key), "utf-8"),
  write: (key, data) => writeFileSync(resolve(process.cwd(), key), data, "utf-8")
})
