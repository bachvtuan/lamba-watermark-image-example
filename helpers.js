/**
 * Helper functions for watermark process
 */
var Childprocess = require('child_process');
var opts = {
    timeout: 0,
    killSignal: 'SIGTERM'
};

/**
 * Given image_path and return dimension of image ( width, height )
 * How :Usage imagemagic command to get image information
 * @Author: bachvtuan@gmail.com
 */
var getImageSize = function(image_path, func_callback) {
    var command = "identify " + image_path;

    console.log("command is ", command);

    Childprocess.exec(command, opts, function(error, stdout) {

        if (error !== null) {
            console.log("can't get photo dimension when process command");
            return func_callback(null,"can't get dimension of photo");
        }

        //Get the first line in case it's git will generate multiple line
        stdout = stdout.split('\n')[0];

        
        console.log("stdout", stdout);

        var arr = stdout.split(" ");
        
        var size = arr[2].split("x");

        return func_callback({
            width: size[0],
            height: size[1]
        });
    });
};

var isGifPhoto = function(file_name) {
    var temp = file_name.split(".");
    return temp.length > 1 && temp[temp.length - 1] == "gif";
}



var processPhoto = function(source_name, source_file, watermark_file, copyright, func_callback) {
    
    //scale to smaller size 
    getImageSize(source_file, function(dimension, error) {
        console.log("dimension", dimension);
        if (dimension === null) {
            return func_callback(false, error);
        }

        //image dimension must greater than 350px X 100px
        if (dimension.width < 350 || dimension.height < 100) {
            return func_callback(false, "select_image_with_better_dimension");
        }

        if (dimension.width > 1024) {
            console.log("resize to width 1024");
            var append = isGifPhoto(source_file) ? "[0]" : "";
            pre_command = "convert " + source_file + append + "    -resize 1024x1024  " + watermark_file + " && ";


            console.log("pre_command1", pre_command);
            doWaterMark(pre_command, source_file, watermark_file, copyright, func_callback);
        } else {
            doWaterMark(pre_command, source_file, watermark_file, copyright, func_callback);
        }

    });
};


/**
 * Execute commmand to watermark photo by using imagemagic
 */
var doWaterMark = function(pre_command, source_file, watermark_file, copyright, func_callback) {
    var command = pre_command;

    if (pre_command === "") {
        var append = isGifPhoto(source_file) ? "[0]" : "";
        command = "composite -gravity SouthWest -geometry +10+30  assets/logo.png " + source_file + append + " " + watermark_file;
    } else {
        //watermark file is resized before and add logo from pre_command
        command += "composite -gravity SouthWest -geometry +10+30  assets/logo.png " + watermark_file + " " + watermark_file;
    }

    command += " && convert " + watermark_file + " -pointsize 16 -font assets/Roboto-Medium.ttf  -draw \"gravity SouthWest fill #9ADF8F  text 65,5 '" + copyright + "' \"  " + watermark_file;
    
    console.log("command ", command);

    Childprocess.exec(command, opts, function(error) {
        if (error !== null) {
            console.log("can not create watermark photo", error);
            return func_callback(false);
        }

        console.log("create watermark_file is ok", watermark_file, "source_file ", source_file);        

        func_callback(watermark_file);
    });
};

module.exports = {
    processPhoto: processPhoto
}