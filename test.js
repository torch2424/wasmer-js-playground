const WASI = require('@wasmer/wasi');
const fs = require('fs');

// Instantiate a new WASI Instance
let wasi = new WASI({ args: ['./asecho.wasm', 'suppp'], env: {} });

// Instantiating the WebAssembly file
const task = async () => {
  const file = './asecho.wasm';
  const wasm_bytes = new Uint8Array(fs.readFileSync(file)).buffer;
  let { instance } = await WebAssembly.instantiate(wasm_bytes, {
    wasi_unstable: wasi.wasiImport
  });

  // Start the WebAssembly WASI instance!
  wasi.start(instance);
}
task();

