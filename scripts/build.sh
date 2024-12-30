#!/usr/bin/env bash

rm -rf dist
mkdir dist
npx tsc
# cp \
#     node_modules/@ricky0123/vad-web/dist/*.onnx \
#     node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js \
#     node_modules/onnxruntime-web/dist/*.wasm \
#     dist


make -C node_modules/whisper-node-ts/lib/whisper.cpp

# cp \
#     node_modules/whisper-node-ts/lib/whisper.cpp/models/ggml-base.en.bin \
#     node_modules/whisper-node-ts/lib/whisper.cpp/models/openvino-conversion-requirements.txt \
#     node_modules/onnxruntime-web/dist/*.wasm \
#     dist
