'use strict';
var Main = function() {
    var $html = $('html'), $win = $(window), wrap = $('.app-aside'), app = $('#app'), MEDIAQUERY = {}, pScroll;

    MEDIAQUERY = {
		desktopXL: 1200,
		desktop: 992,
		tablet: 768,
		mobile: 576,
		phone: 480
	};
    
    var spoller = {
        init: function(){
            $(document).on('click', '.js-drop-handler', function () {
                var parentEl = $(this).closest('.js-drop');
                $(this).toggleClass('is-opened').closest('.js-drop').toggleClass('is-opened').find('.js-drop-content').filter(':first').stop().slideToggle(200, function(){
                });
            });
        }
    };

    var toggleClassOnElement = function() {
		var toggleAttribute = $('*[data-toggle-class]');
		toggleAttribute.each(function() {
			var _this = $(this);
			var toggleClass = _this.attr('data-toggle-class');
			var outsideElement;
			var toggleElement;
			typeof _this.attr('data-toggle-target') !== 'undefined' ? toggleElement = $(_this.attr('data-toggle-target')) : toggleElement = _this;
			_this.on("click", function(e) {
				if(_this.attr('data-toggle-type') !== 'undefined' && _this.attr('data-toggle-type') == "on") {
					toggleElement.addClass(toggleClass);
				} else if(_this.attr('data-toggle-type') !== 'undefined' && _this.attr('data-toggle-type') == "off") {
					toggleElement.removeClass(toggleClass);
				} else {
					toggleElement.toggleClass(toggleClass);
				}
				e.preventDefault();
				if(_this.attr('data-toggle-click-outside')) {

					outsideElement = $(_this.attr('data-toggle-click-outside'));
					$(document).on("mousedown touchstart", toggleOutside);

				};

			});

			var toggleOutside = function(e) {
				if(outsideElement.has(e.target).length === 0//checks if descendants of $box was clicked
				&& !outsideElement.is(e.target)//checks if the $box itself was clicked
				&& !toggleAttribute.is(e.target) && toggleElement.hasClass(toggleClass)) {

					toggleElement.removeClass(toggleClass);
					$(document).off("mousedown touchstart", toggleOutside);
				}
			};

		});
    };
    
    var navbarHandler = function() {
		var navbar = $('.navbar-collapse > .nav');
		var pageHeight = $win.innerHeight() - $('header').outerHeight();
		var collapseButton = $('#menu-toggler');
		if(isSmallDevice()) {
			navbar.css({
				height: pageHeight
			});
		} else {
			navbar.css({
				height: 'auto'
			});
		};
		$(document).on("mousedown touchstart", toggleNavbar);
		function toggleNavbar(e) {
			if(navbar.has(e.target).length === 0//checks if descendants of $box was clicked
			&& !navbar.is(e.target)//checks if the $box itself was clicked
			&& navbar.parent().hasClass("collapse in"))  {
				collapseButton.trigger("click");
				//$(document).off("mousedown touchstart", toggleNavbar);
			}
		};
    };
    
    var resizeHandler = function(func, threshold, execAsap) {
		$(window).resize(function() {
			navbarHandler();
		});
    };
    
    function isSmallDevice() {
		return $win.width() < MEDIAQUERY.desktop;
    }
    
    var goTopHandler = function(e) {
        $('.go-top').on('click', function(e) {
            $("html, body").animate({
                scrollTop: 0
            }, "slow");
            e.preventDefault();
        });
    };
    

    var perfectScrollbarHandler = function() {
       pScroll = $(".perfect-scrollbar");

       if(!isMobile() && pScroll.length) {
           pScroll.perfectScrollbar({
               suppressScrollX: true
           });
           pScroll.on("mousemove", function() {
               $(this).perfectScrollbar('update');
           });
        }
    };

    var modalOpen = function() {
        var idModal;
        
        $(document).on('click', '.js-show-modal', function(e) {
            var $this = $(e.currentTarget);
            var idMap = $this.attr('data-popup');
            var statusCard = $this.attr('data-point');
            var currentCard;

            idModal = $this.attr('data-target');
            $(idModal).modal();
            if(idMap !== '' && window.dataMap != undefined) {
                currentCard = $this.parents('.purchase-list__item');
                window.popupMap.init(idMap, dataMap, currentCard, statusCard);
            }
        });

        $('.modal').on('hidden.bs.modal', function() {
            if ($('.map-wrap').length && window.popupMap.eMap) {
                window.popupMap.destroy(idModal);
            }
        });
    };

    window.popupMap = {
        eData: [],
        eMap: null,
        clusterer: null,
        ePlacemarkArray: [],
        apiScroll: [],
        tpl: '',
        buildAddressList: function(){
            var html = "";
    
            html += '<ul class="map-wrap__nav-list">';
            for (var i = 0; i < window.popupMap.eData.length; i++) {
                var placemark = window.popupMap.eData[i];
    
                html += '<li class="map-wrap__nav-list-item" data-id="'+placemark["id"]+'">'+
                    '<div class="map-wrap__nav-title">'+placemark["address"]+'</div>'+
                    '<div class="map-wrap__nav-text">'+placemark["time"]+'</div>'+
                '</li>';
            }
            html += '</ul>';
    
            var pScroll = $('.map-wrap__nav-scrollbar');
            pScroll.html(html);
            pScroll.perfectScrollbar({
                suppressScrollX: true
            });
            pScroll.on("mousemove", function() {
                $(this).perfectScrollbar('update');
            });
        },

        destroy: function(id) {
            window.popupMap.eMap.destroy();
            window.popupMap.clusterer.removeAll();
            window.popupMap.eData = [];
            window.popupMap.ePlacemarkArray = [];
            $(id).find('.map-wrap__nav-scrollbar').perfectScrollbar('destroy');
            $(id).find('.map-wrap__nav-list').empty().remove();
        },
        
        clickMapList: function(){
            $('.map-wrap__nav-list').on('click', '.map-wrap__nav-list-item', function(){
                var id = $(this).attr('data-id');
                var placemark = window.popupMap.ePlacemarkArray[id-1];
                var list = $(this).parents('.map-wrap__nav-list');
    
                if(!$(this).hasClass('is-active')){
                    list.find('.is-active').removeClass('is-active');
                    $(this).addClass('is-active');
                    window.popupMap.eMap.setZoom(15);
                    window.popupMap.eMap.setCenter(placemark.geometry.getCoordinates());
                    placemark.balloon.open();
                }
            });
        },
        
        map: {
            id: null,
            selector: null,
            status: null,
            openForm: function(){
                var idMap = '#' + window.popupMap.map.id;
                var statusLink = window.popupMap.map.status;
                var tpl = '';
                var id = '';
                var series = '';

                id = $(this).attr('data-id');
                series = window.popupMap.eData[id-1];

                if (statusLink == 'edit') {
                    $('.js-map-title', window.popupMap.map.selector).html(series['title']);
                    $('.js-map-address', window.popupMap.map.selector).html(series['city'] + ', ' + series['address']);
                    $('.js-map-time', window.popupMap.map.selector).html(series['time']);
                }

                if (statusLink == 'add') {
                    if (series['title'] != '') {
                        tpl += '<div class="purchase-item__map-list">'+
                        '<div class="purchase-item__map-list-title js-map-title">"' + series['title'] + '"</div>'+
                        '</div>';
                    }

                    if (series['time'] != '') {
                        tpl += '<div class="purchase-item__map-list">'+
                        '<div class="purchase-item__map-list-label">Время работы:</div>'+
                        '<div class="purchase-item__map-list-text js-map-time">' + series['time'] + '</div>'+
                        '</div>';
                    }

                    if (series['address'] != '') {
                        tpl += '<div class="purchase-item__map-list">'+
                        '<div class="purchase-item__map-list-label">Адрес:</div>'+
                        '<div class="purchase-item__map-list-text js-map-address">' + series['address'] + '</div>'+
                        '</div>';
                    }

                    $(tpl).insertAfter($(window.popupMap.map.selector).find('.js-show-modal').attr('data-point', 'edit').removeClass('is-danger').addClass('is-info').empty().text('Изменить').parent());
                    
                }

                $(idMap).parents('.modal').find('.close').trigger('click');
            },
            addPlacemarks: function(){
                var MyBalloonContentLayoutClass = ymaps.templateLayoutFactory.createClass(
                    '<div class="map-wrap__balloon">'+
                        '<div class="map-wrap__balloon-address">{{ properties.city }}, {{ properties.address }}</div>'+
                        '<div class="map-wrap__balloon-time">{{ properties.time }}</div>'+
                        '<button class="btn btn-success js-add-address" data-id="{{ properties.id }}">Добавить адрес</button>'+
                    '</div>'
                );
    
                var clusterIcons = [
                    {
                        href: "/assets/images/map-cluster.png",
                        size: [38, 39],
                        offset: [-19, -20]
                    }
                ];

                var point;
    
                var MyIconContentLayout = ymaps.templateLayoutFactory.createClass('<div class="map-wrap__cluster">$[properties.geoObjects.length]</div>');
    
                var data = window.popupMap.eData;
    
                if (data) {
                    for (var i = 0; i < data.length; i++) {
                        point = data[i];
                        
                        if (point["coordinates"]) {
                            var placemark = new ymaps.Placemark(point["coordinates"], {
                                id: point["id"],
                                city: point["city"],
                                address: point["address"],
                                coordinates: point["coordinates"],
                                time: point["time"]
                            }, {
                                clusterize: true,
                                balloonContentLayout: MyBalloonContentLayoutClass,
                                balloonMaxWidth: 260,
                                // Своё изображение иконки метки.
                                iconLayout: 'default#image',
                                // Своё изображение иконки метки.
                                iconImageHref: "/assets/images/map-placemark.png",
                                // Размеры метки.
                                iconImageSize: [38, 39],
                                // Смещение левого верхнего угла иконки относительно
                                // её "ножки" (точки привязки).
                                iconImageOffset: [-14, -39] // смещение иконки метки
                            });
                            window.popupMap.ePlacemarkArray.push(placemark);
                        }
                    }
                }
    
                window.popupMap.clusterer = new ymaps.Clusterer({
                    // clusterDisableClickZoom: true,
                    openBalloonOnClick: false,
                    clusterIcons: clusterIcons,
                    clusterIconContentLayout: MyIconContentLayout
                });
                window.popupMap.clusterer.add(window.popupMap.ePlacemarkArray);
                window.popupMap.eMap.geoObjects.add(window.popupMap.clusterer);
            },

            init: function(id){
                window.popupMap.eMap = new ymaps.Map(id, {
                    center: [55.76, 37.64],
                    zoom: 10,
                    controls: [],
                    clusterize: true
                });

                window.popupMap.eMap.controls.add('zoomControl', {
                    position: {
                        top: 75,
                        left: 'auto',
                        right: 15
                    }
                });

                window.popupMap.eMap.behaviors.disable('scrollZoom');
                window.popupMap.map.addPlacemarks();
            }
        },
        changeSalon: function(){
            $('.js-record-offices-change').on('click', function(){
                $('html, body').animate({
                    scrollTop: $('.offices-map').offset().top
                }, 500, 'linear', function(){
                    $('.offices-map-info').slideUp(200);
                    //$('.js-recording-form-opener').removeClass('active').text('Записаться на обслуживание');
                });
                return false;
            });
        },
        
        init: function(id, data, selector, status){
            window.popupMap.eData = data;
            window.popupMap.map.id = id;
            window.popupMap.map.selector = selector;
            window.popupMap.map.status = status;

            ymaps.load(function(){
                window.popupMap.map.init(id);
            });

            window.popupMap.buildAddressList();
            window.popupMap.clickMapList();
            window.popupMap.changeSalon();
            $(document).on('click', '.js-add-address', window.popupMap.map.openForm);
        }
    }
    
    function isMobile() {
        if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return true;
        } else {
            return false;
        };
    }

    return {
        init: function() {
            spoller.init();
            toggleClassOnElement();
            navbarHandler();
            resizeHandler();
            goTopHandler();
            perfectScrollbarHandler();
            modalOpen();
        }
    };
}();

$(function(){
    Main.init();
});