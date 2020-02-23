@extends('app')
@section('content')
    <input type="file" id="file" accept="image/*" style="display: none">
    <input name="content" type="hidden" value="{{ old('content') }}">
    <div id="editor">{!! old('content') !!}</div>
    <p class="upload__error-text"></p>
@endsection
@section('script')
    <script src="/js/quill.js"></script>
@endsection
