

  // TESTING WASI

import WASI from '@wasmer/wasi';
import WasmFs from '@wasmer/wasmfs';

// Instantiate a new WASI Instance
const wasmFsForWasi = new WasmFs();
console.log(wasmFsForWasi);
console.log(WASI.defaultBindings);
const bindings = {
  ...WASI.defaultBindings,
  fs: wasmFsForWasi.fs,
};
console.log(bindings);
let wasi = new WASI({ 
  args: ['./asecho.wasm', 'suppp'], 
  env: {},
  bindings: {
    ...WASI.defaultBindings,
    fs: wasmFsForWasi.fs
  }
});
console.log(wasi.bindings);

// Instantiating the WebAssembly file
const task = async () => {
  const file = './asecho.wasm';
  const response = await fetch(file);
  const arrayBuffer = await response.arrayBuffer();
  console.log('ayyeee');
  const wasm_bytes = new Uint8Array(arrayBuffer).buffer;
  console.log('Yooasjaskldo', wasm_bytes);
  let { instance } = await WebAssembly.instantiate(wasm_bytes, {
    wasi_unstable: wasi.wasiImport
  });

  // Start the WebAssembly WASI instance!
  wasi.start(instance);

  console.log('Hello!');

  console.log('Wasi result!', await wasmFsForWasi.getStdOut());
}
task();



// TESTING WASMFS


const wasmFs = new WasmFs();

wasmFs.fs.writeFileSync("/dev/stdout", "Quick Start!");

wasmFs.getStdOut().then(response => {
  console.log('WasmFs Test!', response); // Would log: 'Quick Start!'
});




  // TESTING WASM TERMINAL AND WASM TRANSFORMER

import WasmTerminal, { fetchCommandFromWAPM } from "@wasmer/wasm-terminal";
import wasmInit, { lowerI64Imports } from "@wasmer/wasm-transformer";

// URL for where the wasm-transformer wasm file is located. This is probably different depending on your bundler.
const wasmTransformerWasmUrl = "./node_modules/@wasmer/wasm-transformer/wasm_transformer_bg.wasm";

// Let's write handler for the fetchCommand property of the WasmTerminal Config.
const fetchCommandHandler = async (commandName) => {

  // Let's return a "CallbackCommand" if our command matches a special name
  if (commandName === 'callback-command') {
    const callbackCommand = async (args, stdin) => {
      return `Callback Command Working! Args: ${args}, stdin: ${stdin}`
    }
    return callbackCommand;
  }

  // Let's fetch a wasm Binary from WAPM for the command name.
  const wasmBinary = await fetchCommandFromWAPM(commandName);

  // Initialize the Wasm Transformer, and use it to lower
  // i64 imports from Wasi Modules, so that most Wasi modules
  // Can run in a Javascript context.
  await wasmInit(wasmTransformerWasmUrl);
  return lowerI64Imports(wasmBinary);
};

// Let's create our Wasm Terminal
const wasmTerminal = new WasmTerminal({
  // Function that is run whenever a command is fetched
  fetchCommand: fetchCommandHandler,
  // IMPORTANT: This is wherever your process.worker.js file URL is hosted
  processWorkerUrl: "./node_modules/wasm-terminal/workers/process.worker.js",
});

// Let's print out our initial message
wasmTerminal.print("Hello World!");

// Let's bind our Wasm terminal to it's container
const containerElement = document.querySelector("#root");
wasmTerminal.open(containerElement);
wasmTerminal.fit();
wasmTerminal.focus();

// Later, when we are done with the terminal, let's destroy it
// wasmTerminal.destroy();
