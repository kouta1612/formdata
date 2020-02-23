import * as loadImage from "blueimp-load-image";

export function resize(image, max = 1024, min = 100) {
    return new Promise(resolve => {
        loadImage.parseMetaData(image, (data) => {
            const options = {
                maxWidth: max,
                maxHeight: max,
                minWidth: min,
                minHeight: min,
                canvas: true
            };
            if (data.exif) {
                options.orientation = data.exif.get('Orientation');
            }
            loadImage(image, async (canvas) => {
                const base64 = canvas.toDataURL(image.type);
                const binary = atob(base64.replace(/^.*,/, ''));
                const blob = await binaryToBlob(binary, image);
                resolve(blob);
            }, options);
        });
    });
}

function binaryToBlob(binary, image) {
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        buffer[i] = binary.charCodeAt(i);
    }
    return new Blob([buffer.buffer], { type: image.type });
}
