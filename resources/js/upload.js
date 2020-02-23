import Quill from "quill";
import { resize } from "./resize";

const quill = new Quill('#editor', {
    placeholder: 'please input here...',
    theme: 'snow',
    modules: {
        toolbar: {
            container: [['image']],
            handlers: {
                image: handler
            }
        }
    },
});

function handler() {
    const input = document.getElementById('file');
    input.click();
    listener(input);
}

function listener(input) {
    input.onchange = async () => {
        const image = input.files[0];
        // シグネチャ作成とリサイズを並列処理
        const [data, resizedImage] = await Promise.all([signature(image), resize(image)]);
        // シグネチャとリサイズしたファイルをs3にわたす
        const uploadedImage = await upload(data, resizedImage);
        // s3から受け取ったファイルを表示
        display(uploadedImage);
    }
}

function signature(image) {
    return $.ajax({
        url: '/api/signature',
        type: 'POST',
        data: {
            size: image.size,
            type: image.type
        },
        dataType: 'json',
    }).catch((error) => {
        const errors = error.responseJSON.errors;
        const message = errors[Object.keys(errors)][0];
        $('.upload__error-text').text(message);
    });
}

function upload(signature, image) {
    const formData = setFormData(signature, image);
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
    const formData = new FormData();
    for (const key in signature.data) {
        if (signature.data.hasOwnProperty(key)) {
            formData.append(key, signature.data[key]);
        }
    }
    formData.append('file', image);
    return formData;
}

function display(image) {
    const range = quill.getSelection();
    const url = image.querySelector('Location').innerHTML;
    quill.insertEmbed(range.index, 'image', url);
    quill.setSelection(range.index + 1, Quill.sources.USER);
}

quill.on('editor-change', () => {
    const content = document.querySelector('input[name=content]');
    content.value = quill.root.innerHTML;
    $('.upload__error-text').text('');
});
