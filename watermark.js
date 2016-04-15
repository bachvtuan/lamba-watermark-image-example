/*
 * An example to demonstrate use Amazon lambda to resize image and add watermark on it
 */

var AWS = require('aws-sdk');
var Childprocess = require('child_process');
var Path  = require("path");
var fs = require('fs');
var helpers = require("./helpers");
var opts = {
  timeout: 0,
  killSignal: 'SIGTERM'
};

/** BEGIN USER DEFINE **/
AWS.config.update({
    accessKeyId: 'YOUR-S3-ACCESS-KEY',
    secretAccessKey: 'YOUR-S3-SECRET-KEY'
});

// Set your region for future requests.
AWS.config.region = 'YOUR-S3-REGION';
/** BEGIN USER DEFINE **/

function doesExist( file_path ) {
  try {
    fs.statSync( file_path )
    return true
  } catch(err) {
    return false;
  }
}
            
exports.handler = function(event, context) {

  var bucket =  event.bucket;
  var key = event.key;


  var s3 = new AWS.S3();
  var params = {Bucket: bucket, Key: key};
  var downloadPath = '/tmp/' + key;

  var file = fs.createWriteStream( downloadPath );


  s3.getObject(params).
  on('httpData', function(chunk) { file.write(chunk); }).
  on('httpDone', function( result ) { 
    console.log("result",result);
    file.end();

    if ( !result ){
      return context.done(error, 'can not get file');
    }

    if ( !doesExist( downloadPath ) ){
     return context.done(error, 'can not get file'); 
    }

    var watermarkDate = new Date().toLocaleDateString();
    console.log("Key", key);
    var watermark_name  = "water_mark_" + key;
    var watermark_file  = "/tmp/" + watermark_name;

    helpers.processPhoto( key, downloadPath , watermark_file, watermarkDate, function( result, error ){
      if ( result === false ){
        return context.done(error, error);
      }
      console.log("result", result);

      var body = fs.createReadStream( watermark_file );
      var s3obj = new AWS.S3({params: {Bucket: params.Bucket, Key: watermark_name, ACL: 'public-read'}});
      s3obj.upload({Body: body})
        .on('httpUploadProgress', function(evt) { console.log(evt); })
        .send(function(err, data) { 
          console.log(err, data) 
          if ( err ){
            return context.done(err, err);
          }
          else{
            context.done(null, data); // SUCCESS with message
          }

        });

    });

    console.log("done1");
  }).send();


};