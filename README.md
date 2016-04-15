# An Example how to use Amazon lambda to watermark your image

### Why choose Lambda ?
I recently approach with Lamba and I see much potential when using it at least when I need to run some tasks need many resource such as CPU, memory. I can consider to use lambda instead of a strong server. It can save your money but the performance is better if there are many tasks running at the same time.

**Overload issue ?**

It never happen on Lambda. Each request to Lambda, Amazon will create separate instance, So if a lambda instance is fail, other instances will not affected. If you process many tasks on your own server and if it get overload. whole uncompleted tasks can be suspended.

**Support Environment**

For now, Lambda only support Java 8, Python 2.7, Nodesjs ( 0.10 and 4.3.2 ), beside that it also installed imageMagic to let you can process image on it. It is really useful and I'll use it to do my work is watermark an image. [Link](http://docs.aws.amazon.com/lambda/latest/dg/current-supported-versions.html)

## Programming language used:
Nodejs v 4.3.2

## Here is the scenario:

1. User upload an image to my server .
2. My server upload it to Amazon S3 and get a key and a bucket information.
3. My server send the key and bucket information to my function on Lamda.
4. From the function on lambda,  it download file from S3.
5. My function  use ImageMagic to get a dimension of the image. If the image has width larger than 1024px, It will resize it to width 1024px.
6. My function also use ImageMagic to watermark it, the watermark file will upload to amazon S3 have the same bucket but the file name is different with the original image.


## Better scenario:
User can upload direct Amazon S3 but we need care for security issue.


## Config code

The main file for running function is "watermark.js". You should change some information about s3 params to make it can handle writing, reading with S3.

```
/** BEGIN USER DEFINE **/
AWS.config.update({
    accessKeyId: 'YOUR-S3-ACCESS-KEY',
    secretAccessKey: 'YOUR-S3-SECRET-KEY'
});

// Set your region for future requests.
AWS.config.region = 'YOUR-S3-REGION';
/** BEGIN USER DEFINE **/
```

## Method USE:
POST

### POST DATA:
```
{
 "key": fileKey ,
 "bucket": yourBucket
}
```

**Example**
```
{
 "key":"test4k.jpg",
 "bucket":"musiczone"
}
```

## Long  task:
This task can be completed nearly 2 seconds, it is quite fast. However, when you need to run a long task, It can task over 1 or 2 minutes. You can setup web hook on server , when the task in lambda function is finished,  it can post the result to your web hook.

### RESPONSE DATA:

**SUCCESSFUL**

```
{
"ETag": ""ETAG_CODE"",
"Location": "fileForWaterMarkFile",
"key": "waterMarkFileKey",
"Key": "waterMarkFileKey",
"Bucket": "yourBucket"
}

```