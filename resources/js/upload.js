// ファイルの読み込み
document.getElementById('file').addEventListener('change', (e) => {
    handle(e.target.files[0]).catch((error) => {
        console.log(error);
    });
});

async function handle(image) {
    // シグネチャ作成とリサイズを並列処理
    const [data, resizedImage] = await Promise.all(
        [signature(image), resize(image, 500)]
    );
    // シグネチャとリサイズしたファイルをs3にわたす
    const uploadedImage = await upload(data, resizedImage);
    // s3から受け取ったファイルを表示
    display(uploadedImage);
}

function signature(image) {
    return $.ajax({
        url: '/api/signature',
        type: 'POST',
        data: {
            name: image.name,
            size: image.size,
            type: image.type
        },
        dataType: 'json',
    });
}

async function resize(image, max) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = (e) => {
            let newImage = new Image();
            newImage.onload = async () => {
                let [width, height] = await ratio(newImage, max);
                let canvas = await drawCanvas(newImage, width, height);
                let blob = await canvasToBlob(canvas, newImage);
                resolve(blob);
            }
            newImage.src = e.target.result;
        };
        reader.readAsDataURL(image);
    });
}

function ratio(image, max) {
    if (image.width < max && image.height < max) {
        return [image.width, image.height];
    } else {
        if (image.width > image.height) {
            return [max, (image.height * max) / image.width];
        } else {
            return [max, (image.width * max) / image.height];
        }
    }
}

function drawCanvas(image, width, height) {
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    [canvas.width, canvas.height] = [width, height];
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
    return canvas;
}

async function canvasToBlob(canvas, image) {
    let base64 = canvas.toDataURL(image.type);
    let binary = atob(base64.replace(/^.*,/, ''));
    let blob = await binaryToBlob(binary, image);
    return blob;
}

function binaryToBlob(binary, image) {
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        buffer[i] = binary.charCodeAt(i);
    }
    return new Blob([buffer.buffer], { type: image.type });
}

function upload(signature, image) {
    let formData = setFormData(signature, image);
    return $.ajax({
        url: signature.url,
        type: 'POST',
        data: formData,
        dataType: 'xml',
        processData: false,
        contentType: false,
    });
}

function setFormData(signature, image) {
    let formData = new FormData();
    for (let key in signature.data) {
        if (signature.data.hasOwnProperty(key)) {
            formData.append(key, signature.data[key]);
        }
    }
    formData.append('file', image);
    return formData;
}

function display(image) {
    let body = document.querySelector('body');
    let element = document.createElement('img');
    element.src = image.querySelector('Location').innerHTML;
    body.appendChild(element);
}
