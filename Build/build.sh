node ../../Build/build-js.js --jsm ../Source/core/photon.jsm --add-source-map-directive --formats amd global --error-strategy THROW --configuration debug

java -jar Tools/Closure/compiler.jar --js ../output/photon-debug.js --js_output_file=../output/photon-min.js