/*
 * Example JS with custom settings for Frisky File Uploader Plug-in 1.0
 *
 * The MIT License (MIT)
 *
 * Copyright 2015, Ruslan “Smirnyga” Smirnov, https://smirnyga.ru
 * 
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
$(document).ready(function() {
    uploader = new File_uploader({
        upload_php: '../sources/php/upload.php'
    });
    uploader.error(function(code_err, file) {
        switch (code_err) {
            case 1:
				$('#err').append('<div role="alert" class="alert alert-warning alert-dismissible fade in"><button aria-label="Close" data-dismiss="alert" class="close" type="button"><span aria-hidden="true">×</span></button><strong><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> Error loading file:</strong> This file  <b>' + file.name + '</b> is too large!</div>');
                break;
            case 2:
                $('#err').append('<div role="alert" class="alert alert-warning alert-dismissible fade in"><button aria-label="Close" data-dismiss="alert" class="close" type="button"><span aria-hidden="true">×</span></button><strong><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> Error loading file:</strong> This file <b>' + file.name + '</b> have unacceptable MIME-Type!</div>');
				break;
        }
    });
    uploader.status_prepare(function(file) {
        $('#status').append('<div class="panel panel-default prepare_upload"><div class="panel-heading"><h3 class="panel-title">Preparing <b>' + file.name + '</b> to upload.</h3></div><div class="panel-body"><div class="progress"><div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">0%</div></div></div>');
    });
    uploader.status_upload(function(file) {
        $('.prepare_upload').filter(':first').remove();
        $('#status').append('<div class="panel panel-default panel_load"><div class="panel-heading"><h3 class="panel-title">File <b>' + file.name + '</b> is uploading.</h3></div><div class="panel-body"><div class="progress"><div class="progress-bar uploaded" role="progressbar" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">0%</div></div><button class="btn btn-danger" id="abort_upload">Cancel</button></div>');
    });
    uploader.all_complete(function() {
        alert('All done!');
    });
    $('body').delegate('#abort_upload', 'click', function() {
        $('.uploaded').removeClass("uploaded").addClass("loaded");
        uploader.upload_abort();
        $(this).remove();
    });
    uploader.ajax_error(function(file) {
        $('#err').append('<div role="alert" class="alert alert-warning alert-dismissible fade in"><button aria-label="Close" data-dismiss="alert" class="close" type="button"><span aria-hidden="true">×</span></button><strong><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> Error loading file:</strong> Connection has beeng refused!</div>');
    });

    uploader.abort_error(function(file) {
        $('.panel_load').remove();
        $('#err').append('<div role="alert" class="alert alert-warning alert-dismissible fade in"><button aria-label="Close" data-dismiss="alert" class="close" type="button"><span aria-hidden="true">×</span></button><strong><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> Error loading file:</strong> Uploading of file <b>' + file.name + '</b> was cancelled.</div>');
    });
    uploader.uploading_progress(function(percent, percent_text) {
        $('.uploaded').width(percent + '%');
        $('.uploaded').text(percent_text + '%');
    });
    uploader.success_complete(function(data, file) {
        $('#abort_upload').remove();
        $('.uploaded').removeClass("uploaded").addClass("loaded");
        $('.panel_load').removeClass('panel-default').addClass('panel-success').removeClass('panel_load');
        var prew = '';
        var insert_to = '';
        if (data.is_img == 1) {
            prew = "<a href='uploads/" + data.file_name + "' data-gallery><img src='uploads/" + data.file_name + "' class='img-thumbnail' style='width: 140px; height: 140px;' /></a>";
            insert_to = prew;
        } else {
            prew = "<img src='images/no_img.png' class='img-thumbnail' style='width: 140px; height: 140px;' />";
            insert_to = "<a href='uploads/" + data.file_name + "'>" + data.true_file_name + "</a>";
        }
        $('#uploaing_list').append('<tr><td>' + prew + '</td><td>' + data.true_file_name + '</td><td>' + data.file_type + '</td><td>' + data.file_size + ' Bytes</td><td>' + data.file_date + '</td></tr>');
    });
    $('#uploader').click(function(e) {
        $('#page_form').click();
    });
    $('#page_form').change(function() {
        uploader.uploadFile(this.files);
        $(this).val('');
    });
});