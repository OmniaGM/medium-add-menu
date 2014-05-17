(($) ->
  extensions = {}
  CONSTANTS =
    ICONS:
      'images-icon': 'fa-cloud-upload'
      'embed-icon': 'fa-code' 
    KEYBOARD:
      BACKSPACE: 8
      DELETE: 46
      ENTER: 13
      UP: 38
      DOWN: 40

  ###
    SELECTION HELPERS
  ###
  selectText = ($el) =>
    doc = document
    element = $el[0]
    if doc.body.createTextRange
      range = document.body.createTextRange()
      range.moveToElementText element
      range.select()
    else if window.getSelection
      selection = window.getSelection()
      range = document.createRange()
      range.selectNodeContents element
      selection.removeAllRanges()
      selection.addRange range
    return

  setCaretCharacterOffsetWithin = (element, startNode, startOffset) =>
    doc = element.ownerDocument or element.document
    win = doc.defaultView or doc.parentWindow
    sel = undefined
    
    unless typeof win.getSelection is "undefined"
      sel = win.getSelection()
      range = win.getSelection().getRangeAt(0)
      preCaretRange =  document.createRange()
      preCaretRange.setStart startNode.childNodes[0], startOffset
      sel.removeAllRanges()
      sel.addRange preCaretRange
    else if (sel = doc.selection) and sel.type isnt "Control"
      textRange = sel.createRange()
      textRange.moveToElementText startNode
      textRange.setStart startOffset
      textRange.select()
            
  getCaretCharacterOffsetWithin = (element) =>
    caretOffset = 0
    doc = element.ownerDocument or element.document
    win = doc.defaultView or doc.parentWindow
    sel = undefined
    unless typeof win.getSelection is "undefined"
      range = win.getSelection().getRangeAt(0)
      preCaretRange = range.cloneRange()
      container = win.getSelection().anchorNode.parentNode
      preCaretRange.selectNodeContents container
      preCaretRange.setEnd range.endContainer, range.endOffset
      caretOffset = preCaretRange.toString().length
    else if (sel = doc.selection) and sel.type isnt "Control"
      textRange = sel.createRange()
      preCaretTextRange = doc.body.createTextRange()
      container = preCaretTextRange.parentElement()
      preCaretTextRange.moveToElementText container
      preCaretTextRange.setEndPoint "EndToEnd", textRange
      caretOffset = preCaretTextRange.text.length
    [caretOffset, container]

  deleteObject = (e, $object, $container) =>
    if $object.is 'figure'
      e.preventDefault()
      if $object.hasClass 'is-focused'
        $object.detach()
        return
      _focusObject $object
    else
      _remveFocusClass $.fn.mediumAttachment.insert.$el


  ###
    HELPERS
  ###
  _setCaretInFigcaption = ($figcaption)->
    $el = $.fn.mediumAttachment.insert.$el
    isEmptyCaption = $figcaption.html().replace('<br>', '').length is 0
    $figcaption.append(" ") if isEmptyCaption
    startNode = $figcaption[0]
    startOffset = 0
    setCaretCharacterOffsetWithin $el[0], startNode, startOffset    
    $figcaption.removeClass 'medium-editor-placeholder'
    $figcaption.html("") if isEmptyCaption          

  _selectedParagraph = ($p) ->
    _removeClassSelected()
    _selectElement $p
    
  _selectElement = ($element) ->
    $element.addClass 'is-selected'

  _focusObject = ($object) ->
    _remveFocusClass()
    _selectElement $object
    $object.addClass 'is-focused'

  _removeClassSelected = ->
    $.fn.mediumAttachment.insert.$el.find('p').removeClass 'is-selected'

  _remveFocusClass = ->
    $.fn.mediumAttachment.insert.$el.find('.is-focused').removeClass('is-focused')
      .removeClass('is-selected')
    _removeSelectedClassonSpan()

  _removeSelectedClassonSpan = ->
    $span = $.fn.mediumAttachment.insert.$el.find('figcaption')
    $span.removeClass('is-selected')
    if $span.html()?.trim().length is 0
      $span.empty()
      $span.addClass('medium-editor-placeholder')  
  ###
  Medium Editor Insert Plugin
  ###
  $.fn.mediumAttachment = (options) ->
    $.fn.mediumAttachment.settings = $.extend($.fn.mediumAttachment.settings, options)
    $.fn.mediumAttachment.insert.init $(this)
    _.each _.keys($.fn.mediumAttachment.settings.extensions), (extension) ->
      extensionOptions = $.fn.mediumAttachment.settings.extensions[extension]
      extensionOptions.$el = $.fn.mediumAttachment.insert.$el
      extensions[extension].init extensionOptions
      return


  
  ###
  Settings
  ###
  $.fn.mediumAttachment.settings =
    enabled: true
    extensions:
      images: {}
      embed: {}

  
  ###
  Register new extension
  ###
  $.fn.mediumAttachment.registerExtension = (name, extension) ->
    extensions[name] = extension
    
  
  ###
  Get registered extension
  ###
  $.fn.mediumAttachment.getExtensions = (name) ->
    $.fn.mediumAttachment.settings.extensions[name]

  
  ###
  extensions Initialization
  ###
  $.fn.mediumAttachment.insert =
    
    ###
    Insert initial function
    ###
    init: ($el) ->
      @$el = $el
      @createTooltip()
      @createExtentionsMenu()
      @setEvents()
      return

    #TODO disable , enable plugin

    createObjectPlaceholder: ($el, $currentP)-> 
      $figure = $('<figure contenteditable=false></div></figure>')
      $placeholder = $('<div class="object-placeholder"></div>')
      $figcaption = $("
        <figcaption contenteditable='true'  data-placeholder='Type caption' class='medium-editor-placeholder caption'>
        </figcaption>
        ")
      $figure.append($placeholder).append($figcaption)
      $currentP.after $figure
      $figure.after('<p><br></p>') if $el.children().last().is 'figure'
      options = 
        top: $currentP.offset().top + $currentP.outerHeight()
        left: $currentP.offset().left - $figcaption.outerWidth()
      $figcaption.css options
      $placeholder

    createTooltip: ->
      html = '<div class="tooltip" style="top=0;left=0">
                <span class="tooltip-control" data-action="inline-menu">
                    <span class="fa fa-plus"></span>
                </span>
              </div>'
      @$toolTip = $(html)
      @$el.parent().append(@$toolTip)
      @$tooltipControl = $(".tooltip-control")

    createExtentionsMenu: ->
      popoverHtml = '
        <div class="popover">
          <div class="popover-inner">
            <ul class="extensions-menu">
            </ul>
          </div>
        <div class="popover-arrow"></div></div>
      '
      @$popoverEl = $(popoverHtml)
      _.each _.keys($.fn.mediumAttachment.settings.extensions), (extension) =>
        icon = CONSTANTS.ICONS["#{extension}-icon"]
        extensionItemHTML = "
          <li class='extensions-menu-item'>
            <button class='btn btn-light' data-action='#{extension}'>
              <span class='fa #{icon}'></span> #{extension}
            </button>
          </li>"
        @$popoverEl.find('ul').append $(extensionItemHTML)
      @$el.parent().append(@$popoverEl)

    hideTooltipAndPop: ->
      @$toolTip.removeClass 'active'
      @$popoverEl.removeClass 'active'
    
    setToolTipPostion: ($field) ->
      fieldPostion = $field.offset().top + $field.outerHeight()
      @postion = 
        top: fieldPostion
        left: @$el.offset().left - 30
      unless @$popoverEl.hasClass 'active'
        @$toolTip.css(@postion)
    
    
    selectAllBehavior: (e, $el, $container) ->
      if (e.ctrlKey or e.metaKey) and e.which is 65
        e.preventDefault()
        if $container.is('figure') or
           $container.is('figcaption')
          container = if $container.is('figcaption') then $container else $container.find 'figcaption'
          selectText container
          return
        selectText $el

    deleteBehavior: (e, $el) ->
      $selectedP = $el.find('.is-selected')
      [caretIndex, container] = getCaretCharacterOffsetWithin $el[0]
      if e.which is CONSTANTS.KEYBOARD.BACKSPACE
        if $(container).is('figure') or $(container).is('figcaption')
          containerEl = if $(container).is('figure') then $(container).find('figcaption') else $(container)
          if caretIndex is 0 or containerEl.html().replace('<br>','').length is 0
            e.preventDefault()
            container = if caretIndex is 0 and $(container).is('figcaption') then $(container).parent()[0] else $(container)[0]
            startNode = container.previousElementSibling
            startOffset = startNode.innerHTML.length
            $(container).detach()
            setCaretCharacterOffsetWithin $el[0], startNode, startOffset    
            return
        
        if caretIndex is 0 and $(container).is 'p'
          $selectedP.removeClass 'is-selected'
          $(container).prev().addClass('is-selected')
          $(container).removeClass('is-selected')
          deleteObject e, $(container).prev(), $(container)
          return

        unless _.isEmpty $el.find('.is-focused') 
          unless $el.find('.is-focused figcaption').hasClass 'is-selected'            
            $el.find('.is-focused').detach()

      if e.which is CONSTANTS.KEYBOARD.DELETE
        if $(container).is('figure') or $(container).is('figcaption')
          containerEl = if $(container).is('figure') then $(container).find('figcaption') else $(container)
          
          if caretIndex is containerEl.html().length or containerEl.html().replace('<br>','').length is 0
            e.preventDefault()
            container = $(container).parent()[0] if caretIndex is containerEl.html().length
            startNode = container.nextElementSibling
            $(container).detach()
            setCaretCharacterOffsetWithin $el[0], startNode, 0    
            return
        
        if caretIndex is $selectedP.html().length and $(container).is 'p'
          $selectedP.removeClass 'is-selected'
          $(container).addClass 'is-selected'
          deleteObject e, $(container).next(), $(container)
          return

        unless _.isEmpty $el.find('.is-focused')
          unless $el.find('.is-focused figcaption').hasClass 'is-selected'             
            $el.find('.is-focused').detach()

    upDownArrowKeyupBehavior: (e, $container) ->
      unless $container.hasClass 'is-selected'
        $el = $.fn.mediumAttachment.insert.$el
        if e.keyCode is CONSTANTS.KEYBOARD.UP
          _removeClassSelected()
          if @$nextContiner.is 'figure'
            e.preventDefault()
            $figcaption = @$nextContiner.find('figcaption')
            _setCaretInFigcaption $figcaption
            $container = @$nextContiner

          $container.next().removeClass 'is-selected'
          $container.addClass 'is-selected'
          _remveFocusClass()

          if $container.is('figure')
            $container.find('figcaption').addClass 'is-selected'
            $container.addClass 'is-focused'

        if e.keyCode is CONSTANTS.KEYBOARD.DOWN
          _removeClassSelected()
          if @$nextContiner.is 'figure'
            e.preventDefault()
            $figcaption = @$nextContiner.find('figcaption')
            _setCaretInFigcaption $figcaption
            $container = @$nextContiner
          
          $container.prev().removeClass 'is-selected'
          $container.addClass 'is-selected'
          _remveFocusClass()

          if $container.is('figure')
            $container.find('figcaption').addClass 'is-selected'
            $container.addClass 'is-focused'
            
    enterKeyupBehavior: (e, $container) ->
      if e.which is CONSTANTS.KEYBOARD.ENTER and $container.is 'p'
        $el = $.fn.mediumAttachment.insert.$el
        $selectedP = $el.find('.is-selected')
        $selectedP.removeClass 'is-selected'
        $container.addClass 'is-selected'
        _remveFocusClass()

    setEvents: ->
      $el = $.fn.mediumAttachment.insert.$el
      
      $el.on "click", (e) => @hideTooltipAndPop()
        
      $el.on "click", "p", (e) => 
        @hideTooltipAndPop()
        _selectedParagraph $(e.currentTarget)
        _remveFocusClass()

      $el.on "keyup", (e) =>
        @hideTooltipAndPop()
        [container] = getCaretCharacterOffsetWithin($el[0])[-1..]
        @enterKeyupBehavior e, $(container)
        @upDownArrowKeyupBehavior e, $(container)
      
      $el.on "keypress", (e) =>
        [caretIndex, container] = getCaretCharacterOffsetWithin $el[0]
        @selectAllBehavior e, $el, $(container)
        @deleteBehavior e, $el
        if $(container).is($el.parent()) and not _.isEmpty $el.find '.is-focused'
          unless e.ctrlKey or 
                 e.metaKey or
                 _.contains _.values(CONSTANTS.KEYBOARD) , e.keyCode 
            $figcaption = $(container).find('.is-focused figcaption')
            _setCaretInFigcaption $figcaption

      $el.on "keydown", (e) =>
        [caretIndex, container] = getCaretCharacterOffsetWithin $el[0]
        @selectAllBehavior e, $el, $(container)
        @deleteBehavior e, $el
        if e.keyCode is CONSTANTS.KEYBOARD.UP
          @$nextContiner = $(container).prev()
        if e.keyCode is CONSTANTS.KEYBOARD.DOWN
          @$nextContiner = $(container).next()

        if $(container).is('figure')
          $(container).find('figcaption').addClass 'is-selected'
          $(container).find('figcaption').removeClass 'medium-editor-placeholder'
        
      $el.on "mousemove", "p", (e) =>
        unless @$popoverEl.find('button').hasClass 'selected-controller'
          @$currentHoverP = $(e.currentTarget)
          @setToolTipPostion(@$currentHoverP)
          @$toolTip.addClass 'active'
        
      @$tooltipControl.on "click", (e) =>
        e.preventDefault()
        _remveFocusClass()
        @$tooltipControl.addClass 'tooltip-control-active'
        postions = 
          top: @postion.top - @$toolTip.outerHeight()
          left: @postion.left + (@$toolTip.width()*2)
        @$popoverEl.css postions
        @$popoverEl.toggleClass 'active'

      @$popoverEl.on "click", ".extensions-menu-item button", (e) =>       
        _remveFocusClass()
        extension = $(e.currentTarget).attr("data-action")
        $placeholder = @createObjectPlaceholder $el, @$currentHoverP
        @$tooltipControl.removeClass 'tooltip-control-active'
        $(e.currentTarget).addClass 'selected-controller'
        extensions[extension]['add'](e, $placeholder)
        @setPlaceholderEvents()
        return

      return

    setPlaceholderEvents: ->
      $el = $.fn.mediumAttachment.insert.$el
      $el.on 'click', 'figure', (e) =>
        _focusObject $(e.currentTarget)
      $el.on "mousemove", "figure", (e) =>
        @$toolTip.removeClass 'active'
        $currentFigure = $(e.currentTarget)
        $currentFigure.find('figcaption').css top: $currentFigure.offset().top

  return
) jQuery