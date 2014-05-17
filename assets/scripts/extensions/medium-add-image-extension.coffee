(($) ->
  $.fn.mediumAttachment.registerExtension 'images', {
    init: (options) ->
      @$el = options.$el  if options and options.$el
      @options = $.extend(@default, options);

    default:
      supportedExtensions: [
        'image/png',
        'image/jpeg'
      ]
      imagesUploadScript: ""
      dragAndDrop: true
      loadingStatusCallback: ($placeholder) ->
        $placeholder.append "<progress class=\"progress\" min=\"0\" max=\"100\" value=\"0\">0</progress>"
      unSupportedCallback: $.noop
      uploadingError: $.noop
      uploadingSuccess: $.noop
      uploadingComplete: $.noop
      format: (jqxhr) ->
        jqxhr.data.url
      
      formatData: (file) ->
        formData = new FormData()
        formData.append "file", file
        formData

    add: (e, $placeholder) ->
      that = this
      $selectFile = undefined
      files = undefined
      $popOverEL = $('.popover')
      $popOverEL.removeClass 'active'
      $selectFile = $("<input type=\"file\">").click()
      $selectFile.change ->
        files = @files
        that.uploadFiles $placeholder, files
        return
      $popOverEL.find('[data-action="images"]').removeClass 'selected-controller'
      $selectFile

    uploadingComplete: (jqxhr, $placeholder) ->
      @options.uploadingComplete()
      
    uploadingSuccess: (jqxhr, $placeholder) ->
      $placeholder.empty()
        .append("<img src='#{@options.format(jqxhr)}'>")
      @options.uploadingSuccess()
      
    uploadingError: (jqxhr, $placeholder) ->
      $placeholder.detach()
      @options.uploadingError()

    uploadFile: ($placeholder, file) ->
      that = this
      $.ajax
        type: "post"
        url: that.options.imagesUploadScript
        xhr: ->
          xhr = new XMLHttpRequest()
          xhr.upload.onprogress = that.updateProgressBar
          xhr

        cache: false
        contentType: false
        success: (jqxhr) ->
          that.uploadingSuccess jqxhr, $placeholder
        error: (jqxhr) ->
          that.uploadingError jqxhr, $placeholder
        complete: (jqxhr) ->
          that.uploadingComplete jqxhr, $placeholder
          return

        processData: false
        data: that.options.formatData(file)

      return

    uploadFiles: ($placeholder, files) ->
      i = 0
      while i < files.length
        file = files[i]
        if _.contains(this.options.supportedExtensions, file.type)
          @options.loadingStatusCallback($placeholder)
          @uploadFile $placeholder, file
        else
          @options.unSupportedCallback()
        i++
      
  }

  return
) jQuery