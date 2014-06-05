(function() {
  (function($) {
    $.fn.mediumAttachment.registerExtension('images', {
      init: function(options) {
        if (options && options.$el) {
          this.$el = options.$el;
        }
        return this.options = $.extend(this["default"], options);
      },
      "default": {
        supportedExtensions: ['image/png', 'image/jpeg'],
        imagesUploadScript: "",
        dragAndDrop: true,
        loadingStatusCallback: function($placeholder) {
          return $placeholder.append("<progress class=\"progress\" min=\"0\" max=\"100\" value=\"0\">0</progress>");
        },
        unSupportedCallback: $.noop,
        uploadingError: $.noop,
        uploadingSuccess: $.noop,
        uploadingComplete: $.noop,
        format: function(jqxhr) {
          return "images/1.jpg";
        },
        formatData: function(file) {
          var formData;
          formData = new FormData();
          formData.append("file", file);
          return formData;
        }
      },
      add: function(e, $placeholder) {
        var $popOverEL, $selectFile, files, that;
        that = this;
        $selectFile = void 0;
        files = void 0;
        $popOverEL = $('.popover');
        $popOverEL.removeClass('active');
        $selectFile = $("<input type=\"file\">").click();
        $selectFile.change(function() {
          files = this.files;
          that.uploadFiles($placeholder, files);
        });
        $popOverEL.find('[data-action="images"]').removeClass('selected-controller');
        return $selectFile;
      },
      uploadingComplete: function(jqxhr, $placeholder) {
        $placeholder.empty().append("<img src='" + (this.options.format(jqxhr)) + "'>");
        return this.options.uploadingComplete();
      },
      uploadingSuccess: function(jqxhr, $placeholder) {
        $placeholder.empty().append("<img src='" + (this.options.format(jqxhr)) + "'>");
        return this.options.uploadingSuccess();
      },
      uploadingError: function(jqxhr, $placeholder) {
        // $placeholder.detach();
        return this.options.uploadingError();
      },
      uploadFile: function($placeholder, file) {
        var that;
        that = this;
        $.ajax({
          type: "post",
          url: that.options.imagesUploadScript,
          xhr: function() {
            var xhr;
            xhr = new XMLHttpRequest();
            xhr.upload.onprogress = that.updateProgressBar;
            return xhr;
          },
          cache: false,
          contentType: false,
          success: function(jqxhr) {
            return that.uploadingSuccess(jqxhr, $placeholder);
          },
          error: function(jqxhr) {
            return that.uploadingError(jqxhr, $placeholder);
          },
          complete: function(jqxhr) {
            that.uploadingComplete(jqxhr, $placeholder);
          },
          processData: false,
          data: that.options.formatData(file)
        });
      },
      uploadFiles: function($placeholder, files) {
        var file, i, _results;
        i = 0;
        _results = [];
        while (i < files.length) {
          file = files[i];
          if (_.contains(this.options.supportedExtensions, file.type)) {
            this.options.loadingStatusCallback($placeholder);
            this.uploadFile($placeholder, file);
          } else {
            this.options.unSupportedCallback();
          }
          _results.push(i++);
        }
        return _results;
      }
    });
  })(jQuery);

}).call(this);