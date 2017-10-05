;(function($) {
    var defaults = {
        touchEnabled: true,
        swipeThreshold: 50,
        oneToOneTouch: true,
        preventDefaultSwipeX: true,
        visibleSlidePosition: 0,
        autoPlayDelay: 8000,
        autoPlayId: null
    };
    
    $.fn.cdSlider = function(options){
        var slider = {};
        var el = this;
        var slidesWrapper = $(el).children('.hero-slider__wrap'),
            sliderNav = $(el).children('.hero-slider__nav'),
            navigationMarker = $(el).find('.hero-slider__marker'),
            slidesNumber = slidesWrapper.children('li').length;

        var init = function(){
            slider.working = false;
            slider.settings = $.extend({}, defaults, options);
            setup();
        }

        var setup = function(){
            slider.viewport = el;
            if (slider.settings.touchEnabled) initTouch();

            //upload videos (if not on mobile devices)
            uploadVideo(slidesWrapper);

            //autoplay slider
            setAutoplay(slidesWrapper, slidesNumber, slider.settings.autoPlayDelay);

            //change visible slide
            sliderNav.on('click touchend', 'li', function (event) {
                var selectedItem = $(this);
                event.preventDefault();
                if (!selectedItem.hasClass('selected')) {
                    // if it's not already selected
                    var selectedPosition = selectedItem.index(),
                        activePosition = slidesWrapper.find('li.selected').index();

                    if (activePosition < selectedPosition) {
                        nextSlide(slidesWrapper.find('.selected'), slidesWrapper, sliderNav, selectedPosition);
                    } else {
                        prevSlide(slidesWrapper.find('.selected'), slidesWrapper, sliderNav, selectedPosition);
                    }

                    //this is used for the autoplay
                    slider.settings.visibleSlidePosition = selectedPosition;

                    updateSliderNavigation(sliderNav, selectedPosition);
                    updateNavigationMarker(navigationMarker, selectedPosition + 1);
                    //reset autoplay
                    setAutoplay(slidesWrapper, slidesNumber, slider.settings.autoPlayDelay);
                }
            });
        }

        var nextSlide = function(visibleSlide, container, pagination, n) {
            visibleSlide.removeClass('selected from-left from-right').addClass('is-moving').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () {
                visibleSlide.removeClass('is-moving');
            });

            container.children('li').eq(n).addClass('selected from-right').prevAll().addClass('move-left');
            checkVideo(visibleSlide, container, n);
        }

        var prevSlide = function(visibleSlide, container, pagination, n) {
            visibleSlide.removeClass('selected from-left from-right').addClass('is-moving').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () {
                visibleSlide.removeClass('is-moving');
            });

            container.children('li').eq(n).addClass('selected from-left').removeClass('move-left').nextAll().removeClass('move-left');
            checkVideo(visibleSlide, container, n);
        }

        var updateSliderNavigation = function(pagination, n) {
            var navigationDot = pagination.find('.selected');
            navigationDot.removeClass('selected');
            pagination.find('li').eq(n).addClass('selected');
        }

        var setAutoplay = function(wrapper, length, delay) {
            if (wrapper.hasClass('autoplay')) {
                clearInterval(slider.settings.autoPlayId);
                slider.settings.autoPlayId = window.setInterval(function () {
                    autoplaySlider(length)
                }, delay);
            }
        }

        var autoplaySlider = function(length) {
            if (slider.settings.visibleSlidePosition < length - 1) {
                nextSlide(slidesWrapper.find('.selected'), slidesWrapper, sliderNav, slider.settings.visibleSlidePosition + 1);
                slider.settings.visibleSlidePosition += 1;
            } else {
                prevSlide(slidesWrapper.find('.selected'), slidesWrapper, sliderNav, 0);
                slider.settings.visibleSlidePosition = 0;
            }
            updateNavigationMarker(navigationMarker, slider.settings.visibleSlidePosition + 1);
            updateSliderNavigation(sliderNav, slider.settings.visibleSlidePosition);
        }

        var uploadVideo = function(container) {
            container.find('.hero-slider__video-wrapper').each(function () {
                var videoWrapper = $(this);
                if (videoWrapper.is(':visible')) {
                    // if visible - we are not on a mobile device 
                    var videoUrl = videoWrapper.data('video'),
                        video = $('<video loop><source src="' + videoUrl + '.mp4" type="video/mp4" /><source src="' + videoUrl + '.webm" type="video/webm" /></video>');
                    video.appendTo(videoWrapper);
                    // play video if first slide
                    if (videoWrapper.parent('.hero-slider__video.selected').length > 0) video.get(0).play();
                }
            });
        }

        var checkVideo = function(hiddenSlide, container, n) {
            //check if a video outside the viewport is playing - if yes, pause it
            var hiddenVideo = hiddenSlide.find('video');
            if (hiddenVideo.length > 0) hiddenVideo.get(0).pause();

            //check if the select slide contains a video element - if yes, play the video
            var visibleVideo = container.children('li').eq(n).find('video');
            if (visibleVideo.length > 0) visibleVideo.get(0).play();
        }

        var updateNavigationMarker = function(marker, n) {
            marker.removeClassPrefix('item').addClass('item-' + n);
        }

        var initTouch = function(){
            slider.touch = {
                start: {x: 0, y: 0},
                end: {x: 0, y: 0}
            }
            slider.viewport.bind('touchstart', onTouchStart);
        }
        var onTouchStart = function(e){
            if(slider.working){
                e.preventDefault();
            } else {
            slider.touch.originalPos = el.position();
            var orig = e.originalEvent;
            slider.touch.start.x = orig.changedTouches[0].pageX;
            slider.touch.start.y = orig.changedTouches[0].pageY;
            slider.viewport.bind('touchmove', onTouchMove);
            slider.viewport.bind('touchend', onTouchEnd);
            }
        }
        var onTouchMove = function(e){
            var orig = e.originalEvent;
            var xMovement = Math.abs(orig.changedTouches[0].pageX - slider.touch.start.x);
            var yMovement = Math.abs(orig.changedTouches[0].pageY - slider.touch.start.y);
            if((xMovement * 3) > yMovement && slider.settings.preventDefaultSwipeX){
                e.preventDefault();
            }
            if(slider.settings.oneToOneTouch){
                var value = 0;
                var change = orig.changedTouches[0].pageX - slider.touch.start.x;
                value = slider.touch.originalPos.left + change;
            }
        }
    
        var onTouchEnd = function(e){
            slider.viewport.unbind('touchmove', onTouchMove);
            var orig = e.originalEvent;
            var value = 0;
            slider.touch.end.x = orig.changedTouches[0].pageX;
            slider.touch.end.y = orig.changedTouches[0].pageY;
            var distance = 0;
            distance = slider.touch.end.x - slider.touch.start.x;
            value = slider.touch.originalPos.left;
        
            if(Math.abs(distance) >= slider.settings.swipeThreshold){
                distance < 0 ? sliderNav.find('li.selected').next().trigger('click') : sliderNav.find('li.selected').prev().trigger('click');
            }
            slider.viewport.unbind('touchend', onTouchEnd);
        }

        $(el).data('cdSlider', this);

        init();
        return this;
    }

    $.fn.removeClassPrefix = function (prefix) {
        //remove all classes starting with 'prefix'
        this.each(function (i, el) {
            var classes = el.className.split(" ").filter(function (c) {
                return c.lastIndexOf(prefix, 0) !== 0;
            });
            el.className = $.trim(classes.join(" "));
        });
        return this;
    };
})(jQuery);