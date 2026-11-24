import http from "node:http";
const BASE = "http://127.0.0.1:4173";
const alive = await new Promise((res) => {
  const req = http.get(BASE + "/index.html", (r) => { r.resume(); res(r.statusCode === 200); });
  req.on("error", (e) => { console.log("ERR", e.message); res(false); });
  req.setTimeout(1200, () => { console.log("TIMEOUT"); req.destroy(); res(false); });
});
console.log("alive =", alive);
