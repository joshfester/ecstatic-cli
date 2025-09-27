# Constructor

## Sharp

[Section titled “Sharp”](#sharp)

> Sharp

**Emits**: 
```
Sharp#event:info
```
, 
```
Sharp#event:warning
```
  

> new Sharp(\[input\], \[options\])

Constructor factory to create an instance of 
```
sharp
```
, to which further methods are chained.

JPEG, PNG, WebP, GIF, AVIF or TIFF format image data can be streamed out from this object. When using Stream based output, derived attributes are available from the 
```
info
```
 event.

Non-critical problems encountered during processing are emitted as 
```
warning
```
 events.

Implements the [stream.Duplex](http://nodejs.org/api/stream.html#stream_class_stream_duplex) class.

When loading more than one page/frame of an animated image, these are combined as a vertically-stacked “toilet roll” image where the overall height is the 
```
pageHeight
```
 multiplied by the number of 
```
pages
```
.

**Throws**:

-   ```
    Error
    ```
     Invalid parameters

 Param | Type | Default | Description |
| --- | --- | --- | --- |
 \[input\] | 
```
Buffer
```
 \| 
```
ArrayBuffer
```
 \| 
```
Uint8Array
```
 \| 
```
Uint8ClampedArray
```
 \| 
```
Int8Array
```
 \| 
```
Uint16Array
```
 \| 
```
Int16Array
```
 \| 
```
Uint32Array
```
 \| 
```
Int32Array
```
 \| 
```
Float32Array
```
 \| 
```
Float64Array
```
 \| 
```
string
```
 \| 
```
Array
```
 |  | if present, can be a Buffer / ArrayBuffer / Uint8Array / Uint8ClampedArray containing JPEG, PNG, WebP, AVIF, GIF, SVG or TIFF image data, or a TypedArray containing raw pixel image data, or a String containing the filesystem path to an JPEG, PNG, WebP, AVIF, GIF, SVG or TIFF image file. An array of inputs can be provided, and these will be joined together. JPEG, PNG, WebP, AVIF, GIF, SVG, TIFF or raw pixel image data can be streamed into the object when not present. |
 \[options\] | 
```
Object
```
 |  | if present, is an Object with optional attributes. |
 \[options.failOn\] | 
```
string
```
 | 
```
“‘warning‘“
```
 | When to abort processing of invalid pixel data, one of (in order of sensitivity, least to most): ‘none’, ‘truncated’, ‘error’, ‘warning’. Higher levels imply lower levels. Invalid metadata will always abort. |
 \[options.limitInputPixels\] | 
```
number
```
 \| 
```
boolean
```
 | 
```
268402689
```
 | Do not process input images where the number of pixels (width x height) exceeds this limit. Assumes image dimensions contained in the input metadata can be trusted. An integral Number of pixels, zero or false to remove limit, true to use default limit of 268402689 (0x3FFF x 0x3FFF). |
 \[options.unlimited\] | 
```
boolean
```
 | 
```
false
```
 | Set this to 
```
true
```
 to remove safety features that help prevent memory exhaustion (JPEG, PNG, SVG, HEIF). |
 \[options.autoOrient\] | 
```
boolean
```
 | 
```
false
```
 | Set this to 
```
true
```
 to rotate/flip the image to match EXIF 
```
Orientation
```
, if any. |
 \[options.sequentialRead\] | 
```
boolean
```
 | 
```
true
```
 | Set this to 
```
false
```
 to use random access rather than sequential read. Some operations will do this automatically. |
 \[options.density\] | 
```
number
```
 | 
```
72
```
 | number representing the DPI for vector images in the range 1 to 100000. |
 \[options.ignoreIcc\] | 
```
number
```
 | 
```
false
```
 | should the embedded ICC profile, if any, be ignored. |
 \[options.pages\] | 
```
number
```
 | 
```
1
```
 | Number of pages to extract for multi-page input (GIF, WebP, TIFF), use -1 for all pages. |
 \[options.page\] | 
```
number
```
 | 
```
0
```
 | Page number to start extracting from for multi-page input (GIF, WebP, TIFF), zero based. |
 \[options.animated\] | 
```
boolean
```
 | 
```
false
```
 | Set to 
```
true
```
 to read all frames/pages of an animated image (GIF, WebP, TIFF), equivalent of setting 
```
pages
```
 to 
```
-1
```
. |
 \[options.raw\] | 
```
Object
```
 |  | describes raw pixel input image data. See 
```
raw()
```
 for pixel ordering. |
 \[options.raw.width\] | 
```
number
```
 |  | integral number of pixels wide. |
 \[options.raw.height\] | 
```
number
```
 |  | integral number of pixels high. |
 \[options.raw.channels\] | 
```
number
```
 |  | integral number of channels, between 1 and 4. |
 \[options.raw.premultiplied\] | 
```
boolean
```
 |  | specifies that the raw input has already been premultiplied, set to 
```
true
```
 to avoid sharp premultiplying the image. (optional, default 
```
false
```
) |
 \[options.raw.pageHeight\] | 
```
number
```
 |  | The pixel height of each page/frame for animated images, must be an integral factor of 
```
raw.height
```
. |
 \[options.create\] | 
```
Object
```
 |  | describes a new image to be created. |
 \[options.create.width\] | 
```
number
```
 |  | integral number of pixels wide. |
 \[options.create.height\] | 
```
number
```
 |  | integral number of pixels high. |
 \[options.create.channels\] | 
```
number
```
 |  | integral number of channels, either 3 (RGB) or 4 (RGBA). |
 \[options.create.background\] | 
```
string
```
 \| 
```
Object
```
 |  | parsed by the [color](https://www.npmjs.org/package/color) module to extract values for red, green, blue and alpha. |
 \[options.create.pageHeight\] | 
```
number
```
 |  | The pixel height of each page/frame for animated images, must be an integral factor of 
```
create.height
```
. |
 \[options.create.noise\] | 
```
Object
```
 |  | describes a noise to be created. |
 \[options.create.noise.type\] | 
```
string
```
 |  | type of generated noise, currently only 
```
gaussian
```
 is supported. |
 \[options.create.noise.mean\] | 
```
number
```
 | 
```
128
```
 | Mean value of pixels in the generated noise. |
 \[options.create.noise.sigma\] | 
```
number
```
 | 
```
30
```
 | Standard deviation of pixel values in the generated noise. |
 \[options.text\] | 
```
Object
```
 |  | describes a new text image to be created. |
 \[options.text.text\] | 
```
string
```
 |  | text to render as a UTF-8 string. It can contain Pango markup, for example 
```
<i>Le</i>Monde
```
. |
 \[options.text.font\] | 
```
string
```
 |  | font name to render with. |
 \[options.text.fontfile\] | 
```
string
```
 |  | absolute filesystem path to a font file that can be used by 
```
font
```
. |
 \[options.text.width\] | 
```
number
```
 | 
```
0
```
 | Integral number of pixels to word-wrap at. Lines of text wider than this will be broken at word boundaries. |
 \[options.text.height\] | 
```
number
```
 | 
```
0
```
 | Maximum integral number of pixels high. When defined, 
```
dpi
```
 will be ignored and the text will automatically fit the pixel resolution defined by 
```
width
```
 and 
```
height
```
. Will be ignored if 
```
width
```
 is not specified or set to 0. |
 \[options.text.align\] | 
```
string
```
 | 
```
“‘left‘“
```
 | Alignment style for multi-line text (
```
'left'
```
, 
```
'centre'
```
, 
```
'center'
```
, 
```
'right'
```
). |
 \[options.text.justify\] | 
```
boolean
```
 | 
```
false
```
 | set this to true to apply justification to the text. |
 \[options.text.dpi\] | 
```
number
```
 | 
```
72
```
 | the resolution (size) at which to render the text. Does not take effect if 
```
height
```
 is specified. |
 \[options.text.rgba\] | 
```
boolean
```
 | 
```
false
```
 | set this to true to enable RGBA output. This is useful for colour emoji rendering, or support for pango markup features like 
```
<span foreground="red">Red!</span>
```
. |
 \[options.text.spacing\] | 
```
number
```
 | 
```
0
```
 | text line height in points. Will use the font line height if none is specified. |
 \[options.text.wrap\] | 
```
string
```
 | 
```
“‘word‘“
```
 | word wrapping style when width is provided, one of: ‘word’, ‘char’, ‘word-char’ (prefer word, fallback to char) or ‘none’. |
 \[options.join\] | 
```
Object
```
 |  | describes how an array of input images should be joined. |
 \[options.join.across\] | 
```
number
```
 | 
```
1
```
 | number of images to join horizontally. |
 \[options.join.animated\] | 
```
boolean
```
 | 
```
false
```
 | set this to 
```
true
```
 to join the images as an animated image. |
 \[options.join.shim\] | 
```
number
```
 | 
```
0
```
 | number of pixels to insert between joined images. |
 \[options.join.background\] | 
```
string
```
 \| 
```
Object
```
 |  | parsed by the [color](https://www.npmjs.org/package/color) module to extract values for red, green, blue and alpha. |
 \[options.join.halign\] | 
```
string
```
 | 
```
“‘left‘“
```
 | horizontal alignment style for images joined horizontally (
```
'left'
```
, 
```
'centre'
```
, 
```
'center'
```
, 
```
'right'
```
). |
 \[options.join.valign\] | 
```
string
```
 | 
```
“‘top‘“
```
 | vertical alignment style for images joined vertically (
```
'top'
```
, 
```
'centre'
```
, 
```
'center'
```
, 
```
'bottom'
```
). |
 \[options.tiff\] | 
```
Object
```
 |  | Describes TIFF specific options. |
 \[options.tiff.subifd\] | 
```
number
```
 | 
```
-1
```
 | Sub Image File Directory to extract for OME-TIFF, defaults to main image. |
 \[options.svg\] | 
```
Object
```
 |  | Describes SVG specific options. |
 \[options.svg.stylesheet\] | 
```
string
```
 |  | Custom CSS for SVG input, applied with a User Origin during the CSS cascade. |
 \[options.svg.highBitdepth\] | 
```
boolean
```
 | 
```
false
```
 | Set to 
```
true
```
 to render SVG input at 32-bits per channel (128-bit) instead of 8-bits per channel (32-bit) RGBA. |
 \[options.pdf\] | 
```
Object
```
 |  | Describes PDF specific options. Requires the use of a globally-installed libvips compiled with support for PDFium, Poppler, ImageMagick or GraphicsMagick. |
 \[options.pdf.background\] | 
```
string
```
 \| 
```
Object
```
 |  | Background colour to use when PDF is partially transparent. Parsed by the [color](https://www.npmjs.org/package/color) module to extract values for red, green, blue and alpha. |
 \[options.openSlide\] | 
```
Object
```
 |  | Describes OpenSlide specific options. Requires the use of a globally-installed libvips compiled with support for OpenSlide. |
 \[options.openSlide.level\] | 
```
number
```
 | 
```
0
```
 | Level to extract from a multi-level input, zero based. |
 \[options.jp2\] | 
```
Object
```
 |  | Describes JPEG 2000 specific options. Requires the use of a globally-installed libvips compiled with support for OpenJPEG. |
 \[options.jp2.oneshot\] | 
```
boolean
```
 | 
```
false
```
 | Set to 
```
true
```
 to decode tiled JPEG 2000 images in a single operation, improving compatibility. |

**Example**

```


sharp('input.jpg')

.resize(300, 200)

.toFile('output.jpg', function(err) {

// output.jpg is a 300 pixels wide and 200 pixels high image

// containing a scaled and cropped version of input.jpg

});




```

**Example**

```


// Read image data from remote URL,

// resize to 300 pixels wide,

// emit an 'info' event with calculated dimensions

// and finally write image data to writableStream

const { body } = fetch('https://...');

const readableStream = Readable.fromWeb(body);

const transformer = sharp()

.resize(300)

.on('info', ({ height })=> {

console.log(`Image height is ${height}`);

});

readableStream.pipe(transformer).pipe(writableStream);




```

**Example**

```


// Create a blank 300x200 PNG image of semi-translucent red pixels

sharp({

create: {

width: 300,

height: 200,

channels: 4,

background: { r: 255, g: 0, b: 0, alpha: 0.5 }

}

})

.png()

.toBuffer()

.then( ... );




```

**Example**

```


// Convert an animated GIF to an animated WebP

awaitsharp('in.gif', { animated: true }).toFile('out.webp');




```

**Example**

```


// Read a raw array of pixels and save it to a png

const input = Uint8Array.from([255, 255, 255, 0, 0, 0]); // or Uint8ClampedArray

const image = sharp(input, {

// because the input does not contain its dimensions or how many channels it has

// we need to specify it in the constructor options

raw: {

width: 2,

height: 1,

channels: 3

}

});

awaitimage.toFile('my-two-pixels.png');




```

**Example**

```


// Generate RGB Gaussian noise

awaitsharp({

create: {

width: 300,

height: 200,

channels: 3,

noise: {

type: 'gaussian',

mean: 128,

sigma: 30

}

}

}).toFile('noise.png');




```

**Example**

```


// Generate an image from text

awaitsharp({

text: {

text: 'Hello, world!',

width: 400, // max width

height: 300// max height

}

}).toFile('text_bw.png');




```

**Example**

```


// Generate an rgba image from text using pango markup and font

awaitsharp({

text: {

text: '<span foreground="red">Red!</span><span background="cyan">blue</span>',

font: 'sans',

rgba: true,

dpi: 300

}

}).toFile('text_rgba.png');




```

**Example**

```


// Join four input images as a 2x2 grid with a 4 pixel gutter

const data = await sharp(

[image1, image2, image3, image4],

{ join: { across: 2, shim: 4 } }

).toBuffer();




```

**Example**

```


// Generate a two-frame animated image from emoji

const images = ['😀', '😛'].map(text => ({

text: { text, width: 64, height: 64, channels: 4, rgba: true }

}));

awaitsharp(images, { join: { animated: true } }).toFile('out.gif');




```

## clone

[Section titled “clone”](#clone)

> clone() ⇒ [
> ```
> Sharp
> ```
> ](#Sharp)

Take a “snapshot” of the Sharp instance, returning a new instance. Cloned instances inherit the input of their parent instance. This allows multiple output Streams and therefore multiple processing pipelines to share a single input Stream.

**Example**

```


const pipeline = sharp().rotate();

pipeline.clone().resize(800, 600).pipe(firstWritableStream);

pipeline.clone().extract({ left: 20, top: 20, width: 100, height: 100 }).pipe(secondWritableStream);

readableStream.pipe(pipeline);

// firstWritableStream receives auto-rotated, resized readableStream

// secondWritableStream receives auto-rotated, extracted region of readableStream




```

**Example**

```


// Create a pipeline that will download an image, resize it and format it to different files

// Using Promises to know when the pipeline is complete

const fs = require("fs");

const got = require("got");

const sharpStream = sharp({ failOn: 'none' });

const promises = [];

promises.push(

sharpStream

.clone()

.jpeg({ quality: 100 })

.toFile("originalFile.jpg")

);

promises.push(

sharpStream

.clone()

.resize({ width: 500 })

.jpeg({ quality: 80 })

.toFile("optimized-500.jpg")

);

promises.push(

sharpStream

.clone()

.resize({ width: 500 })

.webp({ quality: 80 })

.toFile("optimized-500.webp")

);

// https://github.com/sindresorhus/got/blob/main/documentation/3-streams.md

got.stream("https://www.example.com/some-file.jpg").pipe(sharpStream);

Promise.all(promises)

.then(res=> { console.log("Done!", res); })

.catch(err=> {

console.error("Error processing files, let's clean it up", err);

try {

fs.unlinkSync("originalFile.jpg");

fs.unlinkSync("optimized-500.jpg");

fs.unlinkSync("optimized-500.webp");

} catch (e) {}

});




```


# Input metadata

[Section titled “metadata”](#metadata)

> metadata(\[callback\]) ⇒ 
> ```
> Promise.<Object>
> ```
>  | 
> ```
> Sharp
> ```

Fast access to (uncached) image metadata without decoding any compressed pixel data.

This is read from the header of the input image. It does not take into consideration any operations to be applied to the output image, such as resize or rotate.

Dimensions in the response will respect the 
```
page
```
 and 
```
pages
```
 properties of the [constructor parameters](https://sharp.pixelplumbing.com/api-constructor#parameters).

A 
```
Promise
```
 is returned when 
```
callback
```
 is not provided.

-   ```
    format
    ```
    : Name of decoder used to decompress image data e.g. 
    ```
    jpeg
    ```
    , 
    ```
    png
    ```
    , 
    ```
    webp
    ```
    , 
    ```
    gif
    ```
    , 
    ```
    svg
    ```
    
-   ```
    size
    ```
    : Total size of image in bytes, for Stream and Buffer input only
-   ```
    width
    ```
    : Number of pixels wide (EXIF orientation is not taken into consideration, see example below)
-   ```
    height
    ```
    : Number of pixels high (EXIF orientation is not taken into consideration, see example below)
-   ```
    space
    ```
    : Name of colour space interpretation e.g. 
    ```
    srgb
    ```
    , 
    ```
    rgb
    ```
    , 
    ```
    cmyk
    ```
    , 
    ```
    lab
    ```
    , 
    ```
    b-w
    ```
     […](https://www.libvips.org/API/current/VipsImage.html#VipsInterpretation)
-   ```
    channels
    ```
    : Number of bands e.g. 
    ```
    3
    ```
     for sRGB, 
    ```
    4
    ```
     for CMYK
-   ```
    depth
    ```
    : Name of pixel depth format e.g. 
    ```
    uchar
    ```
    , 
    ```
    char
    ```
    , 
    ```
    ushort
    ```
    , 
    ```
    float
    ```
     […](https://www.libvips.org/API/current/VipsImage.html#VipsBandFormat)
-   ```
    density
    ```
    : Number of pixels per inch (DPI), if present
-   ```
    chromaSubsampling
    ```
    : String containing JPEG chroma subsampling, 
    ```
    4:2:0
    ```
     or 
    ```
    4:4:4
    ```
     for RGB, 
    ```
    4:2:0:4
    ```
     or 
    ```
    4:4:4:4
    ```
     for CMYK
-   ```
    isProgressive
    ```
    : Boolean indicating whether the image is interlaced using a progressive scan
-   ```
    isPalette
    ```
    : Boolean indicating whether the image is palette-based (GIF, PNG).
-   ```
    bitsPerSample
    ```
    : Number of bits per sample for each channel (GIF, PNG, HEIF).
-   ```
    pages
    ```
    : Number of pages/frames contained within the image, with support for TIFF, HEIF, PDF, animated GIF and animated WebP
-   ```
    pageHeight
    ```
    : Number of pixels high each page in a multi-page image will be.
-   ```
    loop
    ```
    : Number of times to loop an animated image, zero refers to a continuous loop.
-   ```
    delay
    ```
    : Delay in ms between each page in an animated image, provided as an array of integers.
-   ```
    pagePrimary
    ```
    : Number of the primary page in a HEIF image
-   ```
    levels
    ```
    : Details of each level in a multi-level image provided as an array of objects, requires libvips compiled with support for OpenSlide
-   ```
    subifds
    ```
    : Number of Sub Image File Directories in an OME-TIFF image
-   ```
    background
    ```
    : Default background colour, if present, for PNG (bKGD) and GIF images
-   ```
    compression
    ```
    : The encoder used to compress an HEIF file, 
    ```
    av1
    ```
     (AVIF) or 
    ```
    hevc
    ```
     (HEIC)
-   ```
    resolutionUnit
    ```
    : The unit of resolution (density), either 
    ```
    inch
    ```
     or 
    ```
    cm
    ```
    , if present
-   ```
    hasProfile
    ```
    : Boolean indicating the presence of an embedded ICC profile
-   ```
    hasAlpha
    ```
    : Boolean indicating the presence of an alpha transparency channel
-   ```
    orientation
    ```
    : Number value of the EXIF Orientation header, if present
-   ```
    exif
    ```
    : Buffer containing raw EXIF data, if present
-   ```
    icc
    ```
    : Buffer containing raw [ICC](https://www.npmjs.com/package/icc) profile data, if present
-   ```
    iptc
    ```
    : Buffer containing raw IPTC data, if present
-   ```
    xmp
    ```
    : Buffer containing raw XMP data, if present
-   ```
    xmpAsString
    ```
    : String containing XMP data, if valid UTF-8.
-   ```
    tifftagPhotoshop
    ```
    : Buffer containing raw TIFFTAG\_PHOTOSHOP data, if present
-   ```
    formatMagick
    ```
    : String containing format for images loaded via \*magick
-   ```
    comments
    ```
    : Array of keyword/text pairs representing PNG text blocks, if present.

 Param | Type | Description |
| --- | --- | --- |
 \[callback\] | 
```
function
```
 | called with the arguments 
```
(err, metadata)
```
 |

**Example**

```


const metadata = await sharp(input).metadata();




```

**Example**

```


const image = sharp(inputJpg);

image

.metadata()

.then(function(metadata) {

returnimage

.resize(Math.round(metadata.width/2))

.webp()

.toBuffer();

})

.then(function(data) {

// data contains a WebP image half the width and height of the original JPEG

});




```

**Example**

```


// Get dimensions taking EXIF Orientation into account.

const { autoOrient } = await sharp(input).metadata();

const { width, height } = autoOrient;




```

## stats

[Section titled “stats”](#stats)

> stats(\[callback\]) ⇒ 
> ```
> Promise.<Object>
> ```

Access to pixel-derived image statistics for every channel in the image. A 
```
Promise
```
 is returned when 
```
callback
```
 is not provided.

-   ```
    channels
    ```
    : Array of channel statistics for each channel in the image. Each channel statistic contains  -   ```
          min
          ```
           (minimum value in the channel)
      -   ```
          max
          ```
           (maximum value in the channel)
      -   ```
          sum
          ```
           (sum of all values in a channel)
      -   ```
          squaresSum
          ```
           (sum of squared values in a channel)
      -   ```
          mean
          ```
           (mean of the values in a channel)
      -   ```
          stdev
          ```
           (standard deviation for the values in a channel)
      -   ```
          minX
          ```
           (x-coordinate of one of the pixel where the minimum lies)
      -   ```
          minY
          ```
           (y-coordinate of one of the pixel where the minimum lies)
      -   ```
          maxX
          ```
           (x-coordinate of one of the pixel where the maximum lies)
      -   ```
          maxY
          ```
           (y-coordinate of one of the pixel where the maximum lies)
    
-   ```
    isOpaque
    ```
    : Is the image fully opaque? Will be 
    ```
    true
    ```
     if the image has no alpha channel or if every pixel is fully opaque.
-   ```
    entropy
    ```
    : Histogram-based estimation of greyscale entropy, discarding alpha channel if any.
-   ```
    sharpness
    ```
    : Estimation of greyscale sharpness based on the standard deviation of a Laplacian convolution, discarding alpha channel if any.
-   ```
    dominant
    ```
    : Object containing most dominant sRGB colour based on a 4096-bin 3D histogram.

**Note**: Statistics are derived from the original input image. Any operations performed on the image must first be written to a buffer in order to run 
```
stats
```
 on the result (see third example).

 Param | Type | Description |
| --- | --- | --- |
 \[callback\] | 
```
function
```
 | called with the arguments 
```
(err, stats)
```
 |

**Example**

```


const image = sharp(inputJpg);

image

.stats()

.then(function(stats) {

// stats contains the channel-wise statistics array and the isOpaque value

});




```

**Example**

```


const { entropy, sharpness, dominant } = await sharp(input).stats();

const { r, g, b } = dominant;




```

**Example**

```


const image = sharp(input);

// store intermediate result

const part = await image.extract(region).toBuffer();

// create new instance to obtain statistics of extracted region

const stats = await sharp(part).stats();




```


# Output option

## toFile

[Section titled “toFile”](#tofile)

> toFile(fileOut, \[callback\]) ⇒ 
> ```
> Promise.<Object>
> ```

Write output image data to a file.

If an explicit output format is not selected, it will be inferred from the extension, with JPEG, PNG, WebP, AVIF, TIFF, GIF, DZI, and libvips’ V format supported. Note that raw pixel data is only supported for buffer output.

By default all metadata will be removed, which includes EXIF-based orientation. See [withMetadata](#withmetadata) for control over this.

The caller is responsible for ensuring directory structures and permissions exist.

A 
```
Promise
```
 is returned when 
```
callback
```
 is not provided.

**Returns**: 
```
Promise.<Object>
```
 - - when no callback is provided  
**Throws**:

-   ```
    Error
    ```
     Invalid parameters

 Param | Type | Description |
| --- | --- | --- |
 fileOut | 
```
string
```
 | the path to write the image data to. |
 \[callback\] | 
```
function
```
 | called on completion with two arguments 
```
(err, info)
```
. 
```
info
```
 contains the output image 
```
format
```
, 
```
size
```
 (bytes), 
```
width
```
, 
```
height
```
, 
```
channels
```
 and 
```
premultiplied
```
 (indicating if premultiplication was used). When using a crop strategy also contains 
```
cropOffsetLeft
```
 and 
```
cropOffsetTop
```
. When using the attention crop strategy also contains 
```
attentionX
```
 and 
```
attentionY
```
, the focal point of the cropped region. Animated output will also contain 
```
pageHeight
```
 and 
```
pages
```
. May also contain 
```
textAutofitDpi
```
 (dpi the font was rendered at) if image was created from text. |

**Example**

```


sharp(input)

.toFile('output.png', (err, info)=> { ... });




```

**Example**

```


sharp(input)

.toFile('output.png')

.then(info=> { ... })

.catch(err=> { ... });




```

## toBuffer

[Section titled “toBuffer”](#tobuffer)

> toBuffer(\[options\], \[callback\]) ⇒ 
> ```
> Promise.<Buffer>
> ```

Write output to a Buffer. JPEG, PNG, WebP, AVIF, TIFF, GIF and raw pixel data output are supported.

Use [toFormat](#toformat) or one of the format-specific functions such as [jpeg](#jpeg), [png](#png) etc. to set the output format.

If no explicit format is set, the output format will match the input image, except SVG input which becomes PNG output.

By default all metadata will be removed, which includes EXIF-based orientation. See [withMetadata](#withmetadata) for control over this.

```
callback
```
, if present, gets three arguments 
```
(err, data, info)
```
 where:

-   ```
    err
    ```
     is an error, if any.
-   ```
    data
    ```
     is the output image data.
-   ```
    info
    ```
     contains the output image 
    ```
    format
    ```
    , 
    ```
    size
    ```
     (bytes), 
    ```
    width
    ```
    , 
    ```
    height
    ```
    , 
    ```
    channels
    ```
     and 
    ```
    premultiplied
    ```
     (indicating if premultiplication was used). When using a crop strategy also contains 
    ```
    cropOffsetLeft
    ```
     and 
    ```
    cropOffsetTop
    ```
    . Animated output will also contain 
    ```
    pageHeight
    ```
     and 
    ```
    pages
    ```
    . May also contain 
    ```
    textAutofitDpi
    ```
     (dpi the font was rendered at) if image was created from text.

A 
```
Promise
```
 is returned when 
```
callback
```
 is not provided.

**Returns**: 
```
Promise.<Buffer>
```
 - - when no callback is provided

 Param | Type | Description |
| --- | --- | --- |
 \[options\] | 
```
Object
```
 |  |
 \[options.resolveWithObject\] | 
```
boolean
```
 | Resolve the Promise with an Object containing 
```
data
```
 and 
```
info
```
 properties instead of resolving only with 
```
data
```
. |
 \[callback\] | 
```
function
```
 |  |

**Example**

```


sharp(input)

.toBuffer((err, data, info)=> { ... });




```

**Example**

```


sharp(input)

.toBuffer()

.then(data=> { ... })

.catch(err=> { ... });




```

**Example**

```


sharp(input)

.png()

.toBuffer({ resolveWithObject: true })

.then(({ data, info })=> { ... })

.catch(err=> { ... });




```

**Example**

```


const { data, info } = await sharp('my-image.jpg')

// output the raw pixels

.raw()

.toBuffer({ resolveWithObject: true });

// create a more type safe way to work with the raw pixel data

// this will not copy the data, instead it will change `data`s underlying ArrayBuffer

// so `data` and `pixelArray` point to the same memory location

const pixelArray = newUint8ClampedArray(data.buffer);

// When you are done changing the pixelArray, sharp takes the `pixelArray` as an input

const { width, height, channels } = info;

awaitsharp(pixelArray, { raw: { width, height, channels } })

.toFile('my-changed-image.jpg');




```

## keepExif

[Section titled “keepExif”](#keepexif)

> keepExif() ⇒ 
> ```
> Sharp
> ```

Keep all EXIF metadata from the input image in the output image.

EXIF metadata is unsupported for TIFF output.

**Since**: 0.33.0  
**Example**

```


const outputWithExif = await sharp(inputWithExif)

.keepExif()

.toBuffer();




```

## withExif

[Section titled “withExif”](#withexif)

> withExif(exif) ⇒ 
> ```
> Sharp
> ```

Set EXIF metadata in the output image, ignoring any EXIF in the input image.

**Throws**:

-   ```
    Error
    ```
     Invalid parameters

**Since**: 0.33.0

 Param | Type | Description |
| --- | --- | --- |
 exif | 
```
Object.<string, Object.<string, string>>
```
 | Object keyed by IFD0, IFD1 etc. of key/value string pairs to write as EXIF data. |

**Example**

```


const dataWithExif = await sharp(input)

.withExif({

IFD0: {

Copyright: 'The National Gallery'

},

IFD3: {

GPSLatitudeRef: 'N',

GPSLatitude: '51/1 30/1 3230/100',

GPSLongitudeRef: 'W',

GPSLongitude: '0/1 7/1 4366/100'

}

})

.toBuffer();




```

## withExifMerge

[Section titled “withExifMerge”](#withexifmerge)

> withExifMerge(exif) ⇒ 
> ```
> Sharp
> ```

Update EXIF metadata from the input image in the output image.

**Throws**:

-   ```
    Error
    ```
     Invalid parameters

**Since**: 0.33.0

 Param | Type | Description |
| --- | --- | --- |
 exif | 
```
Object.<string, Object.<string, string>>
```
 | Object keyed by IFD0, IFD1 etc. of key/value string pairs to write as EXIF data. |

**Example**

```


const dataWithMergedExif = await sharp(inputWithExif)

.withExifMerge({

IFD0: {

Copyright: 'The National Gallery'

}

})

.toBuffer();




```

## keepIccProfile

[Section titled “keepIccProfile”](#keepiccprofile)

> keepIccProfile() ⇒ 
> ```
> Sharp
> ```

Keep ICC profile from the input image in the output image.

Where necessary, will attempt to convert the output colour space to match the profile.

**Since**: 0.33.0  
**Example**

```


const outputWithIccProfile = await sharp(inputWithIccProfile)

.keepIccProfile()

.toBuffer();




```

## withIccProfile

[Section titled “withIccProfile”](#withiccprofile)

> withIccProfile(icc, \[options\]) ⇒ 
> ```
> Sharp
> ```

Transform using an ICC profile and attach to the output image.

This can either be an absolute filesystem path or built-in profile name (
```
srgb
```
, 
```
p3
```
, 
```
cmyk
```
).

**Throws**:

-   ```
    Error
    ```
     Invalid parameters

**Since**: 0.33.0

 Param | Type | Default | Description |
| --- | --- | --- | --- |
 icc | 
```
string
```
 |  | Absolute filesystem path to output ICC profile or built-in profile name (srgb, p3, cmyk). |
 \[options\] | 
```
Object
```
 |  |  |
 \[options.attach\] | 
```
number
```
 | 
```
true
```
 | Should the ICC profile be included in the output image metadata? |

**Example**

```


const outputWithP3 = await sharp(input)

.withIccProfile('p3')

.toBuffer();




```

## keepXmp

[Section titled “keepXmp”](#keepxmp)

> keepXmp() ⇒ 
> ```
> Sharp
> ```

Keep XMP metadata from the input image in the output image.

**Since**: 0.34.3  
**Example**

```


const outputWithXmp = await sharp(inputWithXmp)

.keepXmp()

.toBuffer();




```

## withXmp

[Section titled “withXmp”](#withxmp)

> withXmp(xmp) ⇒ 
> ```
> Sharp
> ```

Set XMP metadata in the output image.

Supported by PNG, JPEG, WebP, and TIFF output.

**Throws**:

-   ```
    Error
    ```
     Invalid parameters

**Since**: 0.34.3

 Param | Type | Description |
| --- | --- | --- |
 xmp | 
```
string
```
 | String containing XMP metadata to be embedded in the output image. |

**Example**

```


const xmpString = `

<?xml version="1.0"?>

<x:xmpmeta xmlns:x="adobe:ns:meta/">

<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">

<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">

<dc:creator><rdf:Seq><rdf:li>John Doe</rdf:li></rdf:Seq></dc:creator>

</rdf:Description>

</rdf:RDF>

</x:xmpmeta>`;

const data = await sharp(input)

.withXmp(xmpString)

.toBuffer();




```

[Section titled “keepMetadata”](#keepmetadata)

> keepMetadata() ⇒ 
> ```
> Sharp
> ```

Keep all metadata (EXIF, ICC, XMP, IPTC) from the input image in the output image.

The default behaviour, when 
```
keepMetadata
```
 is not used, is to convert to the device-independent sRGB colour space and strip all metadata, including the removal of any ICC profile.

**Since**: 0.33.0  
**Example**

```


const outputWithMetadata = await sharp(inputWithMetadata)

.keepMetadata()

.toBuffer();




```

[Section titled “withMetadata”](#withmetadata)

> withMetadata(\[options\]) ⇒ 
> ```
> Sharp
> ```

Keep most metadata (EXIF, XMP, IPTC) from the input image in the output image.

This will also convert to and add a web-friendly sRGB ICC profile if appropriate.

Allows orientation and density to be set or updated.

**Throws**:

-   ```
    Error
    ```
     Invalid parameters

 Param | Type | Description |
| --- | --- | --- |
 \[options\] | 
```
Object
```
 |  |
 \[options.orientation\] | 
```
number
```
 | Used to update the EXIF 
```
Orientation
```
 tag, integer between 1 and 8. |
 \[options.density\] | 
```
number
```
 | Number of pixels per inch (DPI). |

**Example**

```


const outputSrgbWithMetadata = await sharp(inputRgbWithMetadata)

.withMetadata()

.toBuffer();




```

**Example**

```


// Set output metadata to 96 DPI

const data = await sharp(input)

.withMetadata({ density: 96 })

.toBuffer();




```

## toFormat

[Section titled “toFormat”](#toformat)

> toFormat(format, options) ⇒ 
> ```
> Sharp
> ```

Force output to a given format.

**Throws**:

-   ```
    Error
    ```
     unsupported format or options

 Param | Type | Description |
| --- | --- | --- |
 format | 
```
string
```
 \| 
```
Object
```
 | as a string or an Object with an ‘id’ attribute |
 options | 
```
Object
```
 | output options |

**Example**

```


// Convert any input to PNG output

const data = await sharp(input)

.toFormat('png')

.toBuffer();




```

## jpeg

[Section titled “jpeg”](#jpeg)

> jpeg(\[options\]) ⇒ 
> ```
> Sharp
> ```

Use these JPEG options for output image.

**Throws**:

-   ```
    Error
    ```
     Invalid options

 Param | Type | Default | Description |
| --- | --- | --- | --- |
 \[options\] | 
```
Object
```
 |  | output options |
 \[options.quality\] | 
```
number
```
 | 
```
80
```
 | quality, integer 1-100 |
 \[options.progressive\] | 
```
boolean
```
 | 
```
false
```
 | use progressive (interlace) scan |
 \[options.chromaSubsampling\] | 
```
string
```
 | 
```
“‘4:2:0‘“
```
 | set to ‘4:4:4’ to prevent chroma subsampling otherwise defaults to ‘4:2:0’ chroma subsampling |
 \[options.optimiseCoding\] | 
```
boolean
```
 | 
```
true
```
 | optimise Huffman coding tables |
 \[options.optimizeCoding\] | 
```
boolean
```
 | 
```
true
```
 | alternative spelling of optimiseCoding |
 \[options.mozjpeg\] | 
```
boolean
```
 | 
```
false
```
 | use mozjpeg defaults, equivalent to 
```
{ trellisQuantisation: true, overshootDeringing: true, optimiseScans: true, quantisationTable: 3 }
```
 |
 \[options.trellisQuantisation\] | 
```
boolean
```
 | 
```
false
```
 | apply trellis quantisation |
 \[options.overshootDeringing\] | 
```
boolean
```
 | 
```
false
```
 | apply overshoot deringing |
 \[options.optimiseScans\] | 
```
boolean
```
 | 
```
false
```
 | optimise progressive scans, forces progressive |
 \[options.optimizeScans\] | 
```
boolean
```
 | 
```
false
```
 | alternative spelling of optimiseScans |
 \[options.quantisationTable\] | 
```
number
```
 | 
```
0
```
 | quantization table to use, integer 0-8 |
 \[options.quantizationTable\] | 
```
number
```
 | 
```
0
```
 | alternative spelling of quantisationTable |
 \[options.force\] | 
```
boolean
```
 | 
```
true
```
 | force JPEG output, otherwise attempt to use input format |

**Example**

```


// Convert any input to very high quality JPEG output

const data = await sharp(input)

.jpeg({

quality: 100,

chromaSubsampling: '4:4:4'

})

.toBuffer();




```

**Example**

```


// Use mozjpeg to reduce output JPEG file size (slower)

const data = await sharp(input)

.jpeg({ mozjpeg: true })

.toBuffer();




```

> png(\[options\]) ⇒ 
> ```
> Sharp
> ```

Use these PNG options for output image.

By default, PNG output is full colour at 8 bits per pixel.

Indexed PNG input at 1, 2 or 4 bits per pixel is converted to 8 bits per pixel. Set 
```
palette
```
 to 
```
true
```
 for slower, indexed PNG output.

For 16 bits per pixel output, convert to 
```
rgb16
```
 via [toColourspace](https://sharp.pixelplumbing.com/api-colour#tocolourspace).

**Throws**:

-   ```
    Error
    ```
     Invalid options

 Param | Type | Default | Description |
| --- | --- | --- | --- |
 \[options\] | 
```
Object
```
 |  |  |
 \[options.progressive\] | 
```
boolean
```
 | 
```
false
```
 | use progressive (interlace) scan |
 \[options.compressionLevel\] | 
```
number
```
 | 
```
6
```
 | zlib compression level, 0 (fastest, largest) to 9 (slowest, smallest) |
 \[options.adaptiveFiltering\] | 
```
boolean
```
 | 
```
false
```
 | use adaptive row filtering |
 \[options.palette\] | 
```
boolean
```
 | 
```
false
```
 | quantise to a palette-based image with alpha transparency support |
 \[options.quality\] | 
```
number
```
 | 
```
100
```
 | use the lowest number of colours needed to achieve given quality, sets 
```
palette
```
 to 
```
true
```
 |
 \[options.effort\] | 
```
number
```
 | 
```
7
```
 | CPU effort, between 1 (fastest) and 10 (slowest), sets 
```
palette
```
 to 
```
true
```
 |
 \[options.colours\] | 
```
number
```
 | 
```
256
```
 | maximum number of palette entries, sets 
```
palette
```
 to 
```
true
```
 |
 \[options.colors\] | 
```
number
```
 | 
```
256
```
 | alternative spelling of 
```
options.colours
```
, sets 
```
palette
```
 to 
```
true
```
 |
 \[options.dither\] | 
```
number
```
 | 
```
1.0
```
 | level of Floyd-Steinberg error diffusion, sets 
```
palette
```
 to 
```
true
```
 |
 \[options.force\] | 
```
boolean
```
 | 
```
true
```
 | force PNG output, otherwise attempt to use input format |

**Example**

```


// Convert any input to full colour PNG output

const data = await sharp(input)

.png()

.toBuffer();




```

**Example**

```


// Convert any input to indexed PNG output (slower)

const data = await sharp(input)

.png({ palette: true })

.toBuffer();




```

**Example**

```


// Output 16 bits per pixel RGB(A)

const data = await sharp(input)

.toColourspace('rgb16')

.png()

.toBuffer();




```

## webp

[Section titled “webp”](#webp)

> webp(\[options\]) ⇒ 
> ```
> Sharp
> ```

Use these WebP options for output image.

**Throws**:

-   ```
    Error
    ```
     Invalid options

 Param | Type | Default | Description |
| --- | --- | --- | --- |
 \[options\] | 
```
Object
```
 |  | output options |
 \[options.quality\] | 
```
number
```
 | 
```
80
```
 | quality, integer 1-100 |
 \[options.alphaQuality\] | 
```
number
```
 | 
```
100
```
 | quality of alpha layer, integer 0-100 |
 \[options.lossless\] | 
```
boolean
```
 | 
```
false
```
 | use lossless compression mode |
 \[options.nearLossless\] | 
```
boolean
```
 | 
```
false
```
 | use near\_lossless compression mode |
 \[options.smartSubsample\] | 
```
boolean
```
 | 
```
false
```
 | use high quality chroma subsampling |
 \[options.smartDeblock\] | 
```
boolean
```
 | 
```
false
```
 | auto-adjust the deblocking filter, can improve low contrast edges (slow) |
 \[options.preset\] | 
```
string
```
 | 
```
“‘default‘“
```
 | named preset for preprocessing/filtering, one of: default, photo, picture, drawing, icon, text |
 \[options.effort\] | 
```
number
```
 | 
```
4
```
 | CPU effort, between 0 (fastest) and 6 (slowest) |
 \[options.loop\] | 
```
number
```
 | 
```
0
```
 | number of animation iterations, use 0 for infinite animation |
 \[options.delay\] | 
```
number
```
 \| 
```
Array.<number>
```
 |  | delay(s) between animation frames (in milliseconds) |
 \[options.minSize\] | 
```
boolean
```
 | 
```
false
```
 | prevent use of animation key frames to minimise file size (slow) |
 \[options.mixed\] | 
```
boolean
```
 | 
```
false
```
 | allow mixture of lossy and lossless animation frames (slow) |
 \[options.force\] | 
```
boolean
```
 | 
```
true
```
 | force WebP output, otherwise attempt to use input format |

**Example**

```


// Convert any input to lossless WebP output

const data = await sharp(input)

.webp({ lossless: true })

.toBuffer();




```

**Example**

```


// Optimise the file size of an animated WebP

const outputWebp = await sharp(inputWebp, { animated: true })

.webp({ effort: 6 })

.toBuffer();




```

> gif(\[options\]) ⇒ 
> ```
> Sharp
> ```

Use these GIF options for the output image.

The first entry in the palette is reserved for transparency.

The palette of the input image will be re-used if possible.

**Throws**:

-   ```
    Error
    ```
     Invalid options

**Since**: 0.30.0

 Param | Type | Default | Description |
| --- | --- | --- | --- |
 \[options\] | 
```
Object
```
 |  | output options |
 \[options.reuse\] | 
```
boolean
```
 | 
```
true
```
 | re-use existing palette, otherwise generate new (slow) |
 \[options.progressive\] | 
```
boolean
```
 | 
```
false
```
 | use progressive (interlace) scan |
 \[options.colours\] | 
```
number
```
 | 
```
256
```
 | maximum number of palette entries, including transparency, between 2 and 256 |
 \[options.colors\] | 
```
number
```
 | 
```
256
```
 | alternative spelling of 
```
options.colours
```
 |
 \[options.effort\] | 
```
number
```
 | 
```
7
```
 | CPU effort, between 1 (fastest) and 10 (slowest) |
 \[options.dither\] | 
```
number
```
 | 
```
1.0
```
 | level of Floyd-Steinberg error diffusion, between 0 (least) and 1 (most) |
 \[options.interFrameMaxError\] | 
```
number
```
 | 
```
0
```
 | maximum inter-frame error for transparency, between 0 (lossless) and 32 |
 \[options.interPaletteMaxError\] | 
```
number
```
 | 
```
3
```
 | maximum inter-palette error for palette reuse, between 0 and 256 |
 \[options.keepDuplicateFrames\] | 
```
boolean
```
 | 
```
false
```
 | keep duplicate frames in the output instead of combining them |
 \[options.loop\] | 
```
number
```
 | 
```
0
```
 | number of animation iterations, use 0 for infinite animation |
 \[options.delay\] | 
```
number
```
 \| 
```
Array.<number>
```
 |  | delay(s) between animation frames (in milliseconds) |
 \[options.force\] | 
```
boolean
```
 | 
```
true
```
 | force GIF output, otherwise attempt to use input format |

**Example**

```


// Convert PNG to GIF

awaitsharp(pngBuffer)

.gif()

.toBuffer();




```

**Example**

```


// Convert animated WebP to animated GIF

awaitsharp('animated.webp', { animated: true })

.toFile('animated.gif');




```

**Example**

```


// Create a 128x128, cropped, non-dithered, animated thumbnail of an animated GIF

const out = await sharp('in.gif', { animated: true })

.resize({ width: 128, height: 128 })

.gif({ dither: 0 })

.toBuffer();




```

**Example**

```


// Lossy file size reduction of animated GIF

awaitsharp('in.gif', { animated: true })

.gif({ interFrameMaxError: 8 })

.toFile('optim.gif');




```

> jp2(\[options\]) ⇒ 
> ```
> Sharp
> ```

Use these JP2 options for output image.

Requires libvips compiled with support for OpenJPEG. The prebuilt binaries do not include this - see [installing a custom libvips](https://sharp.pixelplumbing.com/install#custom-libvips).

**Throws**:

-   ```
    Error
    ```
     Invalid options

**Since**: 0.29.1

 Param | Type | Default | Description |
| --- | --- | --- | --- |
 \[options\] | 
```
Object
```
 |  | output options |
 \[options.quality\] | 
```
number
```
 | 
```
80
```
 | quality, integer 1-100 |
 \[options.lossless\] | 
```
boolean
```
 | 
```
false
```
 | use lossless compression mode |
 \[options.tileWidth\] | 
```
number
```
 | 
```
512
```
 | horizontal tile size |
 \[options.tileHeight\] | 
```
number
```
 | 
```
512
```
 | vertical tile size |
 \[options.chromaSubsampling\] | 
```
string
```
 | 
```
“‘4:4:4‘“
```
 | set to ‘4:2:0’ to use chroma subsampling |

**Example**

```


// Convert any input to lossless JP2 output

const data = await sharp(input)

.jp2({ lossless: true })

.toBuffer();




```

**Example**

```


// Convert any input to very high quality JP2 output

const data = await sharp(input)

.jp2({

quality: 100,

chromaSubsampling: '4:4:4'

})

.toBuffer();




```

## tiff

[Section titled “tiff”](#tiff)

> tiff(\[options\]) ⇒ 
> ```
> Sharp
> ```

Use these TIFF options for output image.

The 
```
density
```
 can be set in pixels/inch via [withMetadata](#withmetadata) instead of providing 
```
xres
```
 and 
```
yres
```
 in pixels/mm.

**Throws**:

-   ```
    Error
    ```
     Invalid options

 Param | Type | Default | Description |
| --- | --- | --- | --- |
 \[options\] | 
```
Object
```
 |  | output options |
 \[options.quality\] | 
```
number
```
 | 
```
80
```
 | quality, integer 1-100 |
 \[options.force\] | 
```
boolean
```
 | 
```
true
```
 | force TIFF output, otherwise attempt to use input format |
 \[options.compression\] | 
```
string
```
 | 
```
“‘jpeg‘“
```
 | compression options: none, jpeg, deflate, packbits, ccittfax4, lzw, webp, zstd, jp2k |
 \[options.predictor\] | 
```
string
```
 | 
```
“‘horizontal‘“
```
 | compression predictor options: none, horizontal, float |
 \[options.pyramid\] | 
```
boolean
```
 | 
```
false
```
 | write an image pyramid |
 \[options.tile\] | 
```
boolean
```
 | 
```
false
```
 | write a tiled tiff |
 \[options.tileWidth\] | 
```
number
```
 | 
```
256
```
 | horizontal tile size |
 \[options.tileHeight\] | 
```
number
```
 | 
```
256
```
 | vertical tile size |
 \[options.xres\] | 
```
number
```
 | 
```
1.0
```
 | horizontal resolution in pixels/mm |
 \[options.yres\] | 
```
number
```
 | 
```
1.0
```
 | vertical resolution in pixels/mm |
 \[options.resolutionUnit\] | 
```
string
```
 | 
```
“‘inch‘“
```
 | resolution unit options: inch, cm |
 \[options.bitdepth\] | 
```
number
```
 | 
```
8
```
 | reduce bitdepth to 1, 2 or 4 bit |
 \[options.miniswhite\] | 
```
boolean
```
 | 
```
false
```
 | write 1-bit images as miniswhite |

**Example**

```


// Convert SVG input to LZW-compressed, 1 bit per pixel TIFF output

sharp('input.svg')

.tiff({

compression: 'lzw',

bitdepth: 1

})

.toFile('1-bpp-output.tiff')

.then(info=> { ... });




```

## avif

[Section titled “avif”](#avif)

> avif(\[options\]) ⇒ 
> ```
> Sharp
> ```

Use these AVIF options for output image.

AVIF image sequences are not supported. Prebuilt binaries support a bitdepth of 8 only.

This feature is experimental on the Windows ARM64 platform and requires a CPU with ARM64v8.4 or later.

**Throws**:

-   ```
    Error
    ```
     Invalid options

**Since**: 0.27.0

 Param | Type | Default | Description |
| --- | --- | --- | --- |
 \[options\] | 
```
Object
```
 |  | output options |
 \[options.quality\] | 
```
number
```
 | 
```
50
```
 | quality, integer 1-100 |
 \[options.lossless\] | 
```
boolean
```
 | 
```
false
```
 | use lossless compression |
 \[options.effort\] | 
```
number
```
 | 
```
4
```
 | CPU effort, between 0 (fastest) and 9 (slowest) |
 \[options.chromaSubsampling\] | 
```
string
```
 | 
```
“‘4:4:4‘“
```
 | set to ‘4:2:0’ to use chroma subsampling |
 \[options.bitdepth\] | 
```
number
```
 | 
```
8
```
 | set bitdepth to 8, 10 or 12 bit |

**Example**

```


const data = await sharp(input)

.avif({ effort: 2 })

.toBuffer();




```

**Example**

```


const data = await sharp(input)

.avif({ lossless: true })

.toBuffer();




```

## heif

[Section titled “heif”](#heif)

> heif(options) ⇒ 
> ```
> Sharp
> ```

Use these HEIF options for output image.

Support for patent-encumbered HEIC images using 
```
hevc
```
 compression requires the use of a globally-installed libvips compiled with support for libheif, libde265 and x265.

**Throws**:

-   ```
    Error
    ```
     Invalid options

**Since**: 0.23.0

 Param | Type | Default | Description |
| --- | --- | --- | --- |
 options | 
```
Object
```
 |  | output options |
 options.compression | 
```
string
```
 |  | compression format: av1, hevc |
 \[options.quality\] | 
```
number
```
 | 
```
50
```
 | quality, integer 1-100 |
 \[options.lossless\] | 
```
boolean
```
 | 
```
false
```
 | use lossless compression |
 \[options.effort\] | 
```
number
```
 | 
```
4
```
 | CPU effort, between 0 (fastest) and 9 (slowest) |
 \[options.chromaSubsampling\] | 
```
string
```
 | 
```
“‘4:4:4‘“
```
 | set to ‘4:2:0’ to use chroma subsampling |
 \[options.bitdepth\] | 
```
number
```
 | 
```
8
```
 | set bitdepth to 8, 10 or 12 bit |

**Example**

```


const data = await sharp(input)

.heif({ compression: 'hevc' })

.toBuffer();




```

> jxl(\[options\]) ⇒ 
> ```
> Sharp
> ```

Use these JPEG-XL (JXL) options for output image.

This feature is experimental, please do not use in production systems.

Requires libvips compiled with support for libjxl. The prebuilt binaries do not include this - see [installing a custom libvips](https://sharp.pixelplumbing.com/install#custom-libvips).

**Throws**:

-   ```
    Error
    ```
     Invalid options

**Since**: 0.31.3

 Param | Type | Default | Description |
| --- | --- | --- | --- |
 \[options\] | 
```
Object
```
 |  | output options |
 \[options.distance\] | 
```
number
```
 | 
```
1.0
```
 | maximum encoding error, between 0 (highest quality) and 15 (lowest quality) |
 \[options.quality\] | 
```
number
```
 |  | calculate 
```
distance
```
 based on JPEG-like quality, between 1 and 100, overrides distance if specified |
 \[options.decodingTier\] | 
```
number
```
 | 
```
0
```
 | target decode speed tier, between 0 (highest quality) and 4 (lowest quality) |
 \[options.lossless\] | 
```
boolean
```
 | 
```
false
```
 | use lossless compression |
 \[options.effort\] | 
```
number
```
 | 
```
7
```
 | CPU effort, between 1 (fastest) and 9 (slowest) |
 \[options.loop\] | 
```
number
```
 | 
```
0
```
 | number of animation iterations, use 0 for infinite animation |
 \[options.delay\] | 
```
number
```
 \| 
```
Array.<number>
```
 |  | delay(s) between animation frames (in milliseconds) |

> raw(\[options\]) ⇒ 
> ```
> Sharp
> ```

Force output to be raw, uncompressed pixel data. Pixel ordering is left-to-right, top-to-bottom, without padding. Channel ordering will be RGB or RGBA for non-greyscale colourspaces.

**Throws**:

-   ```
    Error
    ```
     Invalid options

 Param | Type | Default | Description |
| --- | --- | --- | --- |
 \[options\] | 
```
Object
```
 |  | output options |
 \[options.depth\] | 
```
string
```
 | 
```
“‘uchar‘“
```
 | bit depth, one of: char, uchar (default), short, ushort, int, uint, float, complex, double, dpcomplex |

**Example**

```


// Extract raw, unsigned 8-bit RGB pixel data from JPEG input

const { data, info } = await sharp('input.jpg')

.raw()

.toBuffer({ resolveWithObject: true });




```

**Example**

```


// Extract alpha channel as raw, unsigned 16-bit pixel data from PNG input

const data = await sharp('input.png')

.ensureAlpha()

.extractChannel(3)

.toColourspace('b-w')

.raw({ depth: 'ushort' })

.toBuffer();




```

## tile

[Section titled “tile”](#tile)

> tile(\[options\]) ⇒ 
> ```
> Sharp
> ```

Use tile-based deep zoom (image pyramid) output.

Set the format and options for tile images via the 
```
toFormat
```
, 
```
jpeg
```
, 
```
png
```
 or 
```
webp
```
 functions. Use a 
```
.zip
```
 or 
```
.szi
```
 file extension with 
```
toFile
```
 to write to a compressed archive file format.

The container will be set to 
```
zip
```
 when the output is a Buffer or Stream, otherwise it will default to 
```
fs
```
.

**Throws**:

-   ```
    Error
    ```
     Invalid parameters

 Param | Type | Default | Description |
| --- | --- | --- | --- |
 \[options\] | 
```
Object
```
 |  |  |
 \[options.size\] | 
```
number
```
 | 
```
256
```
 | tile size in pixels, a value between 1 and 8192. |
 \[options.overlap\] | 
```
number
```
 | 
```
0
```
 | tile overlap in pixels, a value between 0 and 8192. |
 \[options.angle\] | 
```
number
```
 | 
```
0
```
 | tile angle of rotation, must be a multiple of 90. |
 \[options.background\] | 
```
string
```
 \| 
```
Object
```
 | 
```
”{r: 255, g: 255, b: 255, alpha: 1}“
```
 | background colour, parsed by the [color](https://www.npmjs.org/package/color) module, defaults to white without transparency. |
 \[options.depth\] | 
```
string
```
 |  | how deep to make the pyramid, possible values are 
```
onepixel
```
, 
```
onetile
```
 or 
```
one
```
, default based on layout. |
 \[options.skipBlanks\] | 
```
number
```
 | 
```
-1
```
 | Threshold to skip tile generation. Range is 0-255 for 8-bit images, 0-65535 for 16-bit images. Default is 5 for 
```
google
```
 layout, -1 (no skip) otherwise. |
 \[options.container\] | 
```
string
```
 | 
```
“‘fs‘“
```
 | tile container, with value 
```
fs
```
 (filesystem) or 
```
zip
```
 (compressed file). |
 \[options.layout\] | 
```
string
```
 | 
```
“‘dz‘“
```
 | filesystem layout, possible values are 
```
dz
```
, 
```
iiif
```
, 
```
iiif3
```
, 
```
zoomify
```
 or 
```
google
```
. |
 \[options.centre\] | 
```
boolean
```
 | 
```
false
```
 | centre image in tile. |
 \[options.center\] | 
```
boolean
```
 | 
```
false
```
 | alternative spelling of centre. |
 \[options.id\] | 
```
string
```
 | 
```
“‘[https://example.com/iiif&#x27](https://example.com/iiif&#x27);“
```
 | when 
```
layout
```
 is 
```
iiif
```
/
```
iiif3
```
, sets the 
```
@id
```
/
```
id
```
 attribute of 
```
info.json
```
 |
 \[options.basename\] | 
```
string
```
 |  | the name of the directory within the zip file when container is 
```
zip
```
. |

**Example**

```


sharp('input.tiff')

.png()

.tile({

size: 512

})

.toFile('output.dz', function(err, info) {

// output.dzi is the Deep Zoom XML definition

// output_files contains 512x512 tiles grouped by zoom level

});




```

**Example**

```


const zipFileWithTiles = await sharp(input)

.tile({ basename: "tiles" })

.toBuffer();




```

**Example**

```


const iiififier = sharp().tile({ layout: "iiif" });

readableStream

.pipe(iiififier)

.pipe(writeableStream);




```

## timeout

[Section titled “timeout”](#timeout)

> timeout(options) ⇒ 
> ```
> Sharp
> ```

Set a timeout for processing, in seconds. Use a value of zero to continue processing indefinitely, the default behaviour.

The clock starts when libvips opens an input image for processing. Time spent waiting for a libuv thread to become available is not included.

**Since**: 0.29.2

 Param | Type | Description |
| --- | --- | --- |
 options | 
```
Object
```
 |  |
 options.seconds | 
```
number
```
 | Number of seconds after which processing will be stopped |

**Example**

```


// Ensure processing takes no longer than 3 seconds

try {

const data = await sharp(input)

.blur(1000)

.timeout({ seconds: 3 })

.toBuffer();

} catch (err) {

if (err.message.includes('timeout')) { ... }

}




```