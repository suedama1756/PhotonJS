if [ "$1" == "dev" ]
then
    node ./grunt/grunt/bin/grunt module closureCompiler lint watch --force
else
    node ./grunt/grunt/bin/grunt
fi

