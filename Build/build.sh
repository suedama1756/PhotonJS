#Get current script path
script_path=$(cd "$(dirname "$0")"; pwd)

#Get default build path
build_path=$script_path/../../Build/build-js.js
echo 'Build Path Is' $build_path

#Get source path
source_path=$script_path/../source

#Get output path
output_path=$script_path/../output

#Generate module file
node $build_path --jsm $source_path/core/photon.jsm --add-source-map-directive --formats amd global --error-strategy THROW --configuration debug

#Minify
java -jar $script_path/Tools/Closure/compiler.jar --js $output_path/photon-debug.js --js_output_file=$output_path/photon-min.js