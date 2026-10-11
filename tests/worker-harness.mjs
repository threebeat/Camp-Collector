import {parentPort} from 'node:worker_threads';
globalThis.self={postMessage:message=>parentPort.postMessage(message)};
parentPort.on('message',message=>self.onmessage({data:message}));
await import('../web/expedition-worker.js');
