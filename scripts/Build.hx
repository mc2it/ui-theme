import Sys.*;
import Tools.captureCommand;
import sys.io.File.*;

/** Runs the script. **/
function main() {
	final bsDir = captureCommand("lix run bootstrap_bundle libpath");
	copy('$bsDir/fonts/bootstrap-icons.woff2', "www/fonts/bootstrap_icons.woff2");
	command('npx sass --load-path=$bsDir --no-source-map --style=compressed src/mc2it_theme/ui:www/css');
}
