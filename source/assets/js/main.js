'use strict';
var Main = function() {
    var pScroll;
    
    var spoller = {
        init: function(){
            $(document).on('click', '.js-drop-handler', function () {
                var parentEl = $(this).closest('.js-drop');
                $(this).toggleClass('is-opened').closest('.js-drop').toggleClass('is-opened').find('.js-drop-content').filter(':first').stop().slideToggle(200, function(){
                });
            });
        }
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
            var idMap = $this.data('popup');
            var statusCard = $this.data('point');
            var currentCard;

            idModal = $this.data('target');
            $(idModal).modal();
            if(idMap !== '' && window.dataMap != undefined) {
                currentCard = $this.parents('.purchase-list__item');
                window.popupMap.init(idMap, dataMap, currentCard, statusCard);
            }
        });

        $('.modal').on('hidden.bs.modal', function() {
            if ($('.map-wrap').length && window.popupMap.eMap) {
                window.popupMap.eMap.destroy();
                window.popupMap.eData = [];
                window.popupMap.ePlacemarkArray = [];
                $(idModal).find('.map-wrap__nav-scrollbar').perfectScrollbar('destroy');
                $(idModal).find('.map-wrap__nav-list').empty().remove();
            }
        });
    };

    window.popupMap = {
        eData: [],
        eMap: null,
        ePlacemarkArray: [],
        apiScroll: [],
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
            openForm: function(map, selector, status){
                var idMap = '#' + map;
                var statusLink = status;
                var tpl = '';
                var id = '';
                var series = '';
                var parentEl;

                $(document).on('click', '.js-add-address', function() {
                    id = $(this).attr('data-id');
                    series = window.popupMap.eData[id-1];

                    if (statusLink == 'edit') {
                        $('.js-map-title', selector).html(series['title']);
                        $('.js-map-address', selector).html(series['city'] + ', ' + series['address']);
                        $('.js-map-time', selector).html(series['time']);
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

                        $(tpl).insertAfter($(selector).find('.js-show-modal').attr('data-point', 'edit').removeClass('is-danger').addClass('is-info').empty().text('Изменить').parent());
                    }

                    $(idMap).parents('.modal').find('.close').trigger('click');
                });
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
    
                var clusterer = new ymaps.Clusterer({
                    // clusterDisableClickZoom: true,
                    openBalloonOnClick: false,
                    clusterIcons: clusterIcons,
                    clusterIconContentLayout: MyIconContentLayout
                });
                clusterer.add(window.popupMap.ePlacemarkArray);
                window.popupMap.eMap.geoObjects.add(clusterer);
            },

            init: function(id, selector, status){
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
                window.popupMap.map.openForm(id, selector, status);
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
            ymaps.load(function(){
                window.popupMap.map.init(id, selector, status);
            });

            window.popupMap.buildAddressList();
            window.popupMap.clickMapList();
            window.popupMap.changeSalon();
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
            perfectScrollbarHandler();
            modalOpen();
        }
    };
}();

$(function(){
    Main.init();
});