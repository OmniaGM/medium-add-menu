(function() {
  (function($) {
    var CONSTANTS, deleteObject, extensions, getCaretCharacterOffsetWithin, selectText, setCaretCharacterOffsetWithin, _focusObject, _removeClassSelected, _removeSelectedClassonSpan, _remveFocusClass, _selectElement, _selectedParagraph, _setCaretInFigcaption,
      _this = this;
    extensions = {};
    CONSTANTS = {
      ICONS: {
        'images-icon': 'fa-cloud-upload',
        'embed-icon': 'fa-code'
      },
      KEYBOARD: {
        BACKSPACE: 8,
        DELETE: 46,
        ENTER: 13,
        UP: 38,
        DOWN: 40
      }
    };
    /*
      SELECTION HELPERS
    */

    selectText = function($el) {
      var doc, element, range, selection;
      doc = document;
      element = $el[0];
      if (doc.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
      } else if (window.getSelection) {
        selection = window.getSelection();
        range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    };
    setCaretCharacterOffsetWithin = function(element, startNode, startOffset) {
      var doc, preCaretRange, range, sel, textRange, win;
      doc = element.ownerDocument || element.document;
      win = doc.defaultView || doc.parentWindow;
      sel = void 0;
      if (typeof win.getSelection !== "undefined") {
        sel = win.getSelection();
        range = win.getSelection().getRangeAt(0);
        preCaretRange = document.createRange();
        preCaretRange.setStart(startNode.childNodes[0], startOffset);
        sel.removeAllRanges();
        return sel.addRange(preCaretRange);
      } else if ((sel = doc.selection) && sel.type !== "Control") {
        textRange = sel.createRange();
        textRange.moveToElementText(startNode);
        textRange.setStart(startOffset);
        return textRange.select();
      }
    };
    getCaretCharacterOffsetWithin = function(element) {
      var caretOffset, container, doc, preCaretRange, preCaretTextRange, range, sel, textRange, win;
      caretOffset = 0;
      doc = element.ownerDocument || element.document;
      win = doc.defaultView || doc.parentWindow;
      sel = void 0;
      if (typeof win.getSelection !== "undefined") {
        range = win.getSelection().getRangeAt(0);
        preCaretRange = range.cloneRange();
        container = win.getSelection().anchorNode.parentNode;
        preCaretRange.selectNodeContents(container);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
      } else if ((sel = doc.selection) && sel.type !== "Control") {
        textRange = sel.createRange();
        preCaretTextRange = doc.body.createTextRange();
        container = preCaretTextRange.parentElement();
        preCaretTextRange.moveToElementText(container);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
      }
      return [caretOffset, container];
    };
    deleteObject = function(e, $object, $container) {
      if ($object.is('figure')) {
        e.preventDefault();
        if ($object.hasClass('is-focused')) {
          $object.detach();
          return;
        }
        return _focusObject($object);
      } else {
        return _remveFocusClass($.fn.mediumAttachment.insert.$el);
      }
    };
    /*
      HELPERS
    */

    _setCaretInFigcaption = function($figcaption) {
      var $el, isEmptyCaption, startNode, startOffset;
      $el = $.fn.mediumAttachment.insert.$el;
      isEmptyCaption = $figcaption.html().replace('<br>', '').length === 0;
      if (isEmptyCaption) {
        $figcaption.append(" ");
      }
      startNode = $figcaption[0];
      startOffset = 0;
      setCaretCharacterOffsetWithin($el[0], startNode, startOffset);
      $figcaption.removeClass('medium-editor-placeholder');
      if (isEmptyCaption) {
        return $figcaption.html("");
      }
    };
    _selectedParagraph = function($p) {
      _removeClassSelected();
      return _selectElement($p);
    };
    _selectElement = function($element) {
      return $element.addClass('is-selected');
    };
    _focusObject = function($object) {
      _remveFocusClass();
      _selectElement($object);
      return $object.addClass('is-focused');
    };
    _removeClassSelected = function() {
      return $.fn.mediumAttachment.insert.$el.find('p').removeClass('is-selected');
    };
    _remveFocusClass = function() {
      $.fn.mediumAttachment.insert.$el.find('.is-focused').removeClass('is-focused').removeClass('is-selected');
      return _removeSelectedClassonSpan();
    };
    _removeSelectedClassonSpan = function() {
      var $span, _ref;
      $span = $.fn.mediumAttachment.insert.$el.find('figcaption');
      $span.removeClass('is-selected');
      if (((_ref = $span.html()) != null ? _ref.trim().length : void 0) === 0) {
        $span.empty();
        return $span.addClass('medium-editor-placeholder');
      }
    };
    /*
    Medium Editor Insert Plugin
    */

    $.fn.mediumAttachment = function(options) {
      $.fn.mediumAttachment.settings = $.extend($.fn.mediumAttachment.settings, options);
      $.fn.mediumAttachment.insert.init($(this));
      return _.each(_.keys($.fn.mediumAttachment.settings.extensions), function(extension) {
        var extensionOptions;
        extensionOptions = $.fn.mediumAttachment.settings.extensions[extension];
        extensionOptions.$el = $.fn.mediumAttachment.insert.$el;
        extensions[extension].init(extensionOptions);
      });
    };
    /*
    Settings
    */

    $.fn.mediumAttachment.settings = {
      enabled: true,
      extensions: {
        images: {},
        embed: {}
      }
    };
    /*
    Register new extension
    */

    $.fn.mediumAttachment.registerExtension = function(name, extension) {
      return extensions[name] = extension;
    };
    /*
    Get registered extension
    */

    $.fn.mediumAttachment.getExtensions = function(name) {
      return $.fn.mediumAttachment.settings.extensions[name];
    };
    /*
    extensions Initialization
    */

    $.fn.mediumAttachment.insert = {
      /*
      Insert initial function
      */

      init: function($el) {
        this.$el = $el;
        this.createTooltip();
        this.createExtentionsMenu();
        this.setEvents();
      },
      createObjectPlaceholder: function($el, $currentP) {
        var $figcaption, $figure, $placeholder, options;
        $figure = $('<figure contenteditable=false></div></figure>');
        $placeholder = $('<div class="object-placeholder"></div>');
        $figcaption = $("        <figcaption contenteditable='true'  data-placeholder='Type caption' class='medium-editor-placeholder caption'>        </figcaption>        ");
        $figure.append($placeholder).append($figcaption);
        $currentP.after($figure);
        if ($el.children().last().is('figure')) {
          $figure.after('<p><br></p>');
        }
        options = {
          top: $currentP.offset().top + $currentP.outerHeight(),
          left: $currentP.offset().left - $figcaption.outerWidth()
        };
        $figcaption.css(options);
        return $placeholder;
      },
      createTooltip: function() {
        var html;
        html = '<div class="tooltip" style="top=0;left=0">\
                <span class="tooltip-control" data-action="inline-menu">\
                    <span class="fa fa-plus"></span>\
                </span>\
              </div>';
        this.$toolTip = $(html);
        this.$el.parent().append(this.$toolTip);
        return this.$tooltipControl = $(".tooltip-control");
      },
      createExtentionsMenu: function() {
        var popoverHtml,
          _this = this;
        popoverHtml = '\
        <div class="popover">\
          <div class="popover-inner">\
            <ul class="extensions-menu">\
            </ul>\
          </div>\
        <div class="popover-arrow"></div></div>\
      ';
        this.$popoverEl = $(popoverHtml);
        _.each(_.keys($.fn.mediumAttachment.settings.extensions), function(extension) {
          var extensionItemHTML, icon;
          icon = CONSTANTS.ICONS["" + extension + "-icon"];
          extensionItemHTML = "          <li class='extensions-menu-item'>            <button class='btn btn-light' data-action='" + extension + "'>              <span class='fa " + icon + "'></span> " + extension + "            </button>          </li>";
          return _this.$popoverEl.find('ul').append($(extensionItemHTML));
        });
        return this.$el.parent().append(this.$popoverEl);
      },
      hideTooltipAndPop: function() {
        this.$toolTip.removeClass('active');
        return this.$popoverEl.removeClass('active');
      },
      setToolTipPostion: function($field) {
        var fieldPostion;
        fieldPostion = $field.offset().top + $field.outerHeight();
        this.postion = {
          top: fieldPostion,
          left: this.$el.offset().left - 30
        };
        if (!this.$popoverEl.hasClass('active')) {
          return this.$toolTip.css(this.postion);
        }
      },
      selectAllBehavior: function(e, $el, $container) {
        var container;
        if ((e.ctrlKey || e.metaKey) && e.which === 65) {
          e.preventDefault();
          if ($container.is('figure') || $container.is('figcaption')) {
            container = $container.is('figcaption') ? $container : $container.find('figcaption');
            selectText(container);
            return;
          }
          return selectText($el);
        }
      },
      deleteBehavior: function(e, $el) {
        var $selectedP, caretIndex, container, containerEl, startNode, startOffset, _ref;
        $selectedP = $el.find('.is-selected');
        _ref = getCaretCharacterOffsetWithin($el[0]), caretIndex = _ref[0], container = _ref[1];
        if (e.which === CONSTANTS.KEYBOARD.BACKSPACE) {
          if ($(container).is('figure') || $(container).is('figcaption')) {
            containerEl = $(container).is('figure') ? $(container).find('figcaption') : $(container);
            if (caretIndex === 0 || containerEl.html().replace('<br>', '').length === 0) {
              e.preventDefault();
              container = caretIndex === 0 && $(container).is('figcaption') ? $(container).parent()[0] : $(container)[0];
              startNode = container.previousElementSibling;
              startOffset = startNode.innerHTML.length;
              $(container).detach();
              setCaretCharacterOffsetWithin($el[0], startNode, startOffset);
              return;
            }
          }
          if (caretIndex === 0 && $(container).is('p')) {
            $selectedP.removeClass('is-selected');
            $(container).prev().addClass('is-selected');
            $(container).removeClass('is-selected');
            deleteObject(e, $(container).prev(), $(container));
            return;
          }
          if (!_.isEmpty($el.find('.is-focused'))) {
            if (!$el.find('.is-focused figcaption').hasClass('is-selected')) {
              $el.find('.is-focused').detach();
            }
          }
        }
        if (e.which === CONSTANTS.KEYBOARD.DELETE) {
          if ($(container).is('figure') || $(container).is('figcaption')) {
            containerEl = $(container).is('figure') ? $(container).find('figcaption') : $(container);
            if (caretIndex === containerEl.html().length || containerEl.html().replace('<br>', '').length === 0) {
              e.preventDefault();
              if (caretIndex === containerEl.html().length) {
                container = $(container).parent()[0];
              }
              startNode = container.nextElementSibling;
              $(container).detach();
              setCaretCharacterOffsetWithin($el[0], startNode, 0);
              return;
            }
          }
          if (caretIndex === $selectedP.html().length && $(container).is('p')) {
            $selectedP.removeClass('is-selected');
            $(container).addClass('is-selected');
            deleteObject(e, $(container).next(), $(container));
            return;
          }
          if (!_.isEmpty($el.find('.is-focused'))) {
            if (!$el.find('.is-focused figcaption').hasClass('is-selected')) {
              return $el.find('.is-focused').detach();
            }
          }
        }
      },
      upDownArrowKeyupBehavior: function(e, $container) {
        var $el, $figcaption;
        if (!$container.hasClass('is-selected')) {
          $el = $.fn.mediumAttachment.insert.$el;
          if (e.keyCode === CONSTANTS.KEYBOARD.UP) {
            _removeClassSelected();
            if (this.$nextContiner.is('figure')) {
              e.preventDefault();
              $figcaption = this.$nextContiner.find('figcaption');
              _setCaretInFigcaption($figcaption);
              $container = this.$nextContiner;
            }
            $container.next().removeClass('is-selected');
            $container.addClass('is-selected');
            _remveFocusClass();
            if ($container.is('figure')) {
              $container.find('figcaption').addClass('is-selected');
              $container.addClass('is-focused');
            }
          }
          if (e.keyCode === CONSTANTS.KEYBOARD.DOWN) {
            _removeClassSelected();
            if (this.$nextContiner.is('figure')) {
              e.preventDefault();
              $figcaption = this.$nextContiner.find('figcaption');
              _setCaretInFigcaption($figcaption);
              $container = this.$nextContiner;
            }
            $container.prev().removeClass('is-selected');
            $container.addClass('is-selected');
            _remveFocusClass();
            if ($container.is('figure')) {
              $container.find('figcaption').addClass('is-selected');
              return $container.addClass('is-focused');
            }
          }
        }
      },
      enterKeyupBehavior: function(e, $container) {
        var $el, $selectedP;
        if (e.which === CONSTANTS.KEYBOARD.ENTER && $container.is('p')) {
          $el = $.fn.mediumAttachment.insert.$el;
          $selectedP = $el.find('.is-selected');
          $selectedP.removeClass('is-selected');
          $container.addClass('is-selected');
          return _remveFocusClass();
        }
      },
      setEvents: function() {
        var $el,
          _this = this;
        $el = $.fn.mediumAttachment.insert.$el;
        $el.on("click", function(e) {
          return _this.hideTooltipAndPop();
        });
        $el.on("click", "p", function(e) {
          _this.hideTooltipAndPop();
          _selectedParagraph($(e.currentTarget));
          return _remveFocusClass();
        });
        $el.on("keyup", function(e) {
          var container;
          _this.hideTooltipAndPop();
          container = getCaretCharacterOffsetWithin($el[0]).slice(-1)[0];
          _this.enterKeyupBehavior(e, $(container));
          return _this.upDownArrowKeyupBehavior(e, $(container));
        });
        $el.on("keypress", function(e) {
          var $figcaption, caretIndex, container, _ref;
          _ref = getCaretCharacterOffsetWithin($el[0]), caretIndex = _ref[0], container = _ref[1];
          _this.selectAllBehavior(e, $el, $(container));
          _this.deleteBehavior(e, $el);
          if ($(container).is($el.parent()) && !_.isEmpty($el.find('.is-focused'))) {
            if (!(e.ctrlKey || e.metaKey || _.contains(_.values(CONSTANTS.KEYBOARD), e.keyCode))) {
              $figcaption = $(container).find('.is-focused figcaption');
              return _setCaretInFigcaption($figcaption);
            }
          }
        });
        $el.on("keydown", function(e) {
          var caretIndex, container, _ref;
          _ref = getCaretCharacterOffsetWithin($el[0]), caretIndex = _ref[0], container = _ref[1];
          _this.selectAllBehavior(e, $el, $(container));
          _this.deleteBehavior(e, $el);
          if (e.keyCode === CONSTANTS.KEYBOARD.UP) {
            _this.$nextContiner = $(container).prev();
          }
          if (e.keyCode === CONSTANTS.KEYBOARD.DOWN) {
            _this.$nextContiner = $(container).next();
          }
          if ($(container).is('figure')) {
            $(container).find('figcaption').addClass('is-selected');
            return $(container).find('figcaption').removeClass('medium-editor-placeholder');
          }
        });
        $el.on("mousemove", "p", function(e) {
          if (!_this.$popoverEl.find('button').hasClass('selected-controller')) {
            _this.$currentHoverP = $(e.currentTarget);
            _this.setToolTipPostion(_this.$currentHoverP);
            return _this.$toolTip.addClass('active');
          }
        });
        this.$tooltipControl.on("click", function(e) {
          var postions;
          e.preventDefault();
          _remveFocusClass();
          _this.$tooltipControl.addClass('tooltip-control-active');
          postions = {
            top: _this.postion.top - _this.$toolTip.outerHeight(),
            left: _this.postion.left + (_this.$toolTip.width() * 2)
          };
          _this.$popoverEl.css(postions);
          return _this.$popoverEl.toggleClass('active');
        });
        this.$popoverEl.on("click", ".extensions-menu-item button", function(e) {
          var $placeholder, extension;
          _remveFocusClass();
          extension = $(e.currentTarget).attr("data-action");
          $placeholder = _this.createObjectPlaceholder($el, _this.$currentHoverP);
          _this.$tooltipControl.removeClass('tooltip-control-active');
          $(e.currentTarget).addClass('selected-controller');
          extensions[extension]['add'](e, $placeholder);
          _this.setPlaceholderEvents();
        });
      },
      setPlaceholderEvents: function() {
        var $el,
          _this = this;
        $el = $.fn.mediumAttachment.insert.$el;
        $el.on('click', 'figure', function(e) {
          return _focusObject($(e.currentTarget));
        });
        return $el.on("mousemove", "figure", function(e) {
          var $currentFigure;
          _this.$toolTip.removeClass('active');
          $currentFigure = $(e.currentTarget);
          return $currentFigure.find('figcaption').css({
            top: $currentFigure.offset().top
          });
        });
      }
    };
  })(jQuery);

}).call(this);
