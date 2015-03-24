# File_uploader
uploader = new File_upload();  
Методы:

1.  Error – принимает в аргументе анонимную функцию, которая в свою очередь принимает 2 аргумента. Вызывается при выявлении ошибки перед загрузкой файла: 

1) код ошибки (принимает значения 1 и 2). 
2) объект файла
Пример:
uploader.error(function(code_err, file) {
                switch (code_err) {
                    case 1:
	alert(‘Превышен максимально допустимый размер файла’);
                    break;
                    case 2:
alert(‘Файл:’ + file.name +‘Имеет недопустимо расширение’);
                    break;
                }

            });
2. Status_prepare - принимает в аргументе анонимную функцию, которая в свою очередь принимает аргумент  в виде объекта файла. Вызывается при добавлении файла в очередь загрузки.
Пример:
uploader.status_prepare(function(file) {
                $('#status').append('<div class="panel panel-default prepare_upload"><div class="panel-heading"><h3 class="panel-title">Подготовка к загрузке: ' + file.name + '</h3></div><div class="panel-body"><div class="progress"><div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">0%</div></div></div>');
            });
3. Status_upload - принимает в аргументе анонимную функцию, которая в свою очередь принимает аргумент  в виде объекта файла. Вызывается перед загрузкой файла.
Пример: 
uploader.status_upload(function(file) {
                $('.prepare_upload').filter(':first').remove();
                $('#status').append('<div class="panel panel-default panel_load"><div class="panel-heading"><h3 class="panel-title">Загрузка файла: ' + file.name + '</h3></div><div class="panel-body"><div class="progress"><div class="progress-bar uploaded" role="progressbar" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">0%</div></div><button class="btn btn-danger" id="abort_upload">Отмена</button></div>');
            });
4. All_complete - принимает в аргументе анонимную функцию. Вызывается при завершении загрузки всех файлов.
Пример:
uploader.all_complete(function() {
                alert('Все загрузки завершены!');
            });
5. Upload_abort –Предотвращает загрузку текущего файла и вызывает функцию загрузки следующего файла из очереди (если такой имеется)
Пример:
$('body').delegate('#abort_upload', 'click', function() {
                $('.uploaded').removeClass("uploaded").addClass("loaded");
                uploader.upload_abort();
                $(this).remove();
            });
6. Ajax_error - принимает в аргументе анонимную функцию, которая в свою очередь принимает аргумент  в виде объекта файла. Вызывается при возникновении серверной ошибки или при отмены загрузки файла.
Пример:
uploader.ajax_error(function(file) {
                $('.panel_load').remove();
                $('#err').append('<div class="panel panel-danger"><div class="panel-heading"><h3 class="panel-title">Ошибка при загрузке файла</h3></div><div class="panel-body">Загрузка файла прервана: ' + file.name + '</div></div>');
            });
7. Uploading_progress – принимает в аргументе анонимную функцию, которая в свою очередь принимает 2 аргумента. Вызывается во время загрузки файла.
1) процент загрузки не округленный
2) процент загрузки округленный 
Пример:
uploader.uploading_progress(function(percent, percent_text) {
                $('.uploaded').width(percent + '%');
                $('.uploaded').text(percent_text + '%');
            });

8. Success_complete – принимает в аргументе анонимную функцию, которая в свою очередь принимает 2 аргумента. Вызывается при успешном завершении загрузки файла.
1) возвращает объект с данными, возвращенными сервером.
2) Объект файла
Пример:
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


                $('#uploaing_list').append('<tr><td>' + prew + '</td><td>' + data.true_file_name + '</td><td>' + data.file_type + '</td><td>' + data.file_size + ' Bytes</td><td>' + data.file_date + '</td><td id="' + data.id + '" class="tablecells"><a href="" title="Скачать" class="glyphicon glyphicon-cloud-download"></a><a href="#" title="Удалить" class="glyphicon glyphicon-trash del_fl"></a></td></tr>');
            });
Сервер возвращает объект в формате JSON.

Список всех возвращаемых свойств:

1)	File_name – зашифрованное имя файла (под этим именем файл сохранен на сервере)
2)	True_file_name – настоящее имя файла, которое было до отправки на север
3)	File_size – размер файла
4)	File_type – расширение файла
5)	File_date – дата загрузки файла
   






