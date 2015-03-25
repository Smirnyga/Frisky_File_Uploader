/*
 * Frisky File Uploader Plug-in 1.0
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
function File_uploader(param) {
	param = param || {};
	this.settings = {
		maxSize: 1024 * 1024 * 1024,
		maxFiles: '*',
		extList: 'jpg,rar,png,jpeg,zip,avi,ppt,pptx,docx,doc,mp3,7z,txt,flv,mp4',
		upload_php: '',
		bytes_chunk: 1024 * 1024 * 2
	};
	this.loaded = true;
	this.storage = new Array();
	for (property in param) {
		this.settings[property] = param[property];
	}
	this.settings.extList = String(this.settings.extList).split(',');
	this.error_function = function(code_err, file) {};
	this.status_prepare_function = function(file) {};
	this.status_upload_function = function(file) {};
	this.ajax_error_function = function(file) {};
	this.error_error_function = function(file) {};
	this.success_complete_function = function(data, file) {};
	this.uploading_progress_function = function(percent, percent_text) {};
	this.all_complete_function = function() {};
}
File_uploader.prototype.all_complete = function(anon) {
	this.all_complete_function = anon;
};
File_uploader.prototype.error = function(anon) {
	this.error_function = anon;
};
File_uploader.prototype.success_complete = function(anon) {
	this.success_complete_function = anon;
};
File_uploader.prototype.upload_abort = function() {
	this.self_ajax.abort();
	this.abort_error_function(this.file);
	this.loaded = true;
	if (this.settings.delay != 0) {
		clearTimeout(this.timeoutID);
	}
	if (this.storage.length > 0) {
		this.upload_ajax();
	}
};
File_uploader.prototype.ajax_error = function(anon) {
	this.ajax_error_function = anon;
}
File_uploader.prototype.abort_error = function(anon) {
	this.abort_error_function = anon;
}
File_uploader.prototype.uploading_progress = function(anon) {
	this.uploading_progress_function = anon;
};
File_uploader.prototype.upload_ajax_chunk = function(chunk, part_id) {
	console.log('Загружается часть №: ' + part_id);
	console.log(1024 * 1024 * 2 * Number(part_id));
	percent_blob = 0;
	var percent_chunk = 100 / this.parts;
	var form = new FormData();
	form.append('upload', chunk);
	form.append('part_id', part_id);
	form.append('parts', this.parts);
	form.append('file_name', this.file.name);
	self = this;
	this.self_ajax = $.ajax({
		url: self.settings.upload_php,
		type: 'post',
		data: form,
		dataType: 'json',
		cache: false,
		contentType: false,
		processData: false,
		xhr: function() {
			var req = $.ajaxSettings.xhr();
			if (req.upload) {
				req.upload.addEventListener('progress', function(event) {
					var percent = 0;
					var position = event.loaded || event.position;
					var total = event.total || event.totalSize;
					if (event.lengthComputable) {
						percent = position / total * 100;
						percent_blob = percent_chunk * percent / 100;
						percent_blob = self.percent_all + percent_blob;
						self.uploading_progress_function(percent_blob, (percent_blob - (percent_blob % 1)));
					}
				}, false);
			}
			return req;
		},
		success: function(data, message, xhr) {
			self.percent_all = percent_blob;
			if ('file_loaded' in data) {
				var time_end = Date.now();
				var interval = new Date(time_end - self.time_start);
				console.log(interval.getUTCHours() + ' : ' + interval.getUTCMinutes() + ' : ' + interval.getUTCSeconds() + ' : FILE: ' + self.file.name);
				self.success_complete_function(data, self.file);
				self.loaded = true;
				if (self.storage.length > 0) {
					self.upload_ajax();
				} else {
					self.all_complete_function();
				}
			} else {
				self.set_chunk();
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (textStatus != 'abort') {
				console.log(textStatus); //parsererror error /403 /101 /324
				if (textStatus == 'parsererror') {
					self.upload_ajax_chunk(chunk, part_id);
				}
				//if(errorThrown != 'Internal Server Error') { self.upload_ajax_chunk(chunk, part_id); } else {  self.set_chunk();  }
				self.ajax_error_function(self.file);
			}
		},
		statusCode: {
			403: function() {
				self.upload_ajax_chunk(chunk, part_id);
			},
			101: function() {
				self.set_chunk();
			},
			324: function() {
				self.set_chunk();
			},
			500: function() {
				self.set_chunk();
			},
			404: function() {
				self.upload_ajax_chunk(chunk, part_id);
			},
			400: function() {
				self.set_chunk();
			}
		}
	});
};
File_uploader.prototype.upload_ajax = function() {
	if (this.loaded == true) {
		this.file = this.storage.shift();
		this.status_upload_function(this.file);
		this.loaded = false;
		this.percent_all = 0;
		this.start_bytes = 0;
		this.end_bytes = this.settings.bytes_chunk;
		this.parts = Math.ceil(this.file.size / this.settings.bytes_chunk);
		this.part_id = 1;
		this.set_chunk();
		this.time_start = Date.now();
	}
};
File_uploader.prototype.set_chunk = function() {
	chunk = this.check_slice();
	this.start_bytes = this.end_bytes;
	this.end_bytes = this.start_bytes + this.settings.bytes_chunk;
	this.upload_ajax_chunk(chunk, this.part_id++);
}
File_uploader.prototype.check_slice = function() {
	if (this.file.slice) {
		var chunk = this.file.slice(this.start_bytes, this.end_bytes);
	} else {
		if (this.file.webkitSlice) {
			var chunk = this.file.webkitSlice(this.start_bytes, this.end_bytes);
		} else {
			if (this.file.mozSlice) {
				var chunk = this.file.mozSlice(this.start_bytes, this.end_bytes);
			}
		}
	}
	return chunk;
};
File_uploader.prototype.status_prepare = function(anon) {
	this.status_prepare_function = anon;
};
File_uploader.prototype.status_upload = function(anon) {
	this.status_upload_function = anon;
};
File_uploader.prototype.uploadFile = function(files) {
	for (i = 0, l = files.length; i < l; i++) {
		var ext = files[i].name.toLowerCase().split('.').pop();
		if (files[i].size > this.settings.maxSize) {
			this.error_function(1, files[i]);
			continue;
		}
		if ($.inArray(ext, this.settings.extList) < 0) {
			this.error_function(2, files[i]);
			continue;
		}
		this.storage.push(files[i]);
		this.status_prepare_function(files[i]);
	}
	if (this.storage.length > 0) {
		this.upload_ajax();
	}
};