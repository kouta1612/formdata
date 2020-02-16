// ファイルの読み込み
$('#file').on('change', (e) => {
    handle(e.target.files[0]);
});

async function handle(file) {
    // シグネチャ作成とリサイズを並列処理
    const [data, resizedFile] = await Promise.all(
        [signature(file), resize(file)]
    );
    // シグネチャとリサイズしたファイルをs3にわたす
    const uploadedFile = await upload(data, resizedFile);
    // s3から受け取ったファイルを表示
    display(uploadedFile);
}

function signature(file) {
    return $.ajax({
        url: '/api/signature',
        type: 'POST',
        data: {
            name: file.name,
            size: file.size,
            type: file.type
        },
        dataType: 'json',
    });
}

function resize(file) {
    const reader = new FileReader();
    let image = new Image();
    reader.onload = (e) => {
        image.src = e.target.result;
    };
    reader.readAsDataURL(file);

    return new Promise(resolve => {
        image.onload = () => {
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            [canvas.width, canvas.height] = [image.width, image.height];
            ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width * 0.5, image.height * 0.5);
            let base64 = canvas.toDataURL(file.type);
            let binary = atob(base64.replace(/^.*,/, ''));
            const buffer = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                buffer[i] = binary.charCodeAt(i);
            }
            let blob = new Blob([buffer.buffer], { type: file.type });
            resolve(blob);
        };
    });
}

function upload(signature, resizedFile) {
    let key;
    let formData = new FormData();
    for (key in signature.data) {
        if (signature.data.hasOwnProperty(key)) {
            formData.append(key, signature.data[key]);
        }
    }
    formData.append('file', resizedFile);
    return $.ajax({
        url: signature.url,
        type: 'POST',
        data: formData,
        dataType: 'xml',
        processData: false,
        contentType: false,
    });
}

function display(uploadedFile) {
    let body = $('body');
    let img = document.createElement('img');
    img.src = $(uploadedFile).find('Location').first().text();
    body.append(img);
}
