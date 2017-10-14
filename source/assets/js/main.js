'use strict';
var Main = function () {
    var $html = $('html'),
        $win = $(window),
        wrap = $('.app-aside'),
        app = $('#app'),
        MEDIAQUERY = {},
        pScroll;

    MEDIAQUERY = {
        desktopXL: 1200,
        desktop: 992,
        tablet: 768,
        mobile: 576,
        phone: 480
    };

    var spoller = {
        init: function () {
            $(document).on('click', '.js-drop-handler', function () {
                var parentEl = $(this).closest('.js-drop');
                $(this).toggleClass('is-opened').closest('.js-drop').toggleClass('is-opened').find('.js-drop-content').filter(':first').stop().slideToggle(200, function () {});
            });
        }
    };

    var toggleClassOnElement = function () {
        var toggleAttribute = $('*[data-toggle-class]');
        toggleAttribute.each(function () {
            var $this = $(this);
            var toggleClass = $this.attr('data-toggle-class');
            var outsideElement;
            var toggleElement;
            typeof $this.attr('data-toggle-target') !== 'undefined' ? toggleElement = $($this.attr('data-toggle-target')) : toggleElement = $this;
            $this.on('click', function (e) {
                if ($this.attr('data-toggle-type') !== 'undefined' && $this.attr('data-toggle-type') == 'on') {
                    toggleElement.addClass(toggleClass);
                } else if ($this.attr('data-toggle-type') !== 'undefined' && $this.attr('data-toggle-type') == 'off') {
                    toggleElement.removeClass(toggleClass);
                } else {
                    toggleElement.toggleClass(toggleClass);
                }
                e.preventDefault();
                if ($this.attr('data-toggle-click-outside')) {

                    outsideElement = $($this.attr('data-toggle-click-outside'));
                    $(document).on('mousedown touchstart', toggleOutside);

                };

            });

            var toggleOutside = function (e) {
                if (outsideElement.has(e.target).length === 0 //checks if descendants of $box was clicked
                    &&
                    !outsideElement.is(e.target) //checks if the $box itself was clicked
                    &&
                    !toggleAttribute.is(e.target) && toggleElement.hasClass(toggleClass)) {

                    toggleElement.removeClass(toggleClass);
                    $(document).off('mousedown touchstart', toggleOutside);
                }
            };

        });
    };

    var navbarHandler = function () {
        var navbar = $('.navbar-collapse > .nav');
        var pageHeight = $win.innerHeight() - $('header').outerHeight();
        var collapseButton = $('#menu-toggler');
        if (isSmallDevice()) {
            navbar.css({
                height: pageHeight
            });
        } else {
            navbar.css({
                height: 'auto'
            });
        };
        $(document).on('mousedown touchstart', toggleNavbar);

        function toggleNavbar(e) {
            if (navbar.has(e.target).length === 0 //checks if descendants of $box was clicked
                &&
                !navbar.is(e.target) //checks if the $box itself was clicked
                &&
                navbar.parent().hasClass('collapse in')) {
                collapseButton.trigger('click');
                //$(document).off("mousedown touchstart", toggleNavbar);
            }
        };
    };

    var resizeHandler = function (func, threshold, execAsap) {
        $(window).on('resize', function () {
            navbarHandler();
        });
    };

    function isSmallDevice () {
        return $win.width() < MEDIAQUERY.desktop;
    }

    var goTopHandler = function (e) {
        $('.go-top').on('click', function (e) {
            $('html, body').animate({
                scrollTop: 0
            }, 'slow');
            e.preventDefault();
        });
    };


    var perfectScrollbarHandler = function () {
        pScroll = $('.perfect-scrollbar');

        if (!isMobile() && pScroll.length) {
            pScroll.perfectScrollbar({
                suppressScrollX: true
            });
            pScroll.on('mousemove', function () {
                $(this).perfectScrollbar('update');
            });
        }
    };

    var modalOpen = function () {
        var idModal;
        var idPoint;

        $(document).on('click', '.js-show-modal', function (e) {
            var $this = $(e.currentTarget);
            var idMap = $this.attr('data-popup');
            var statusCard = $this.attr('data-point');
            var currentId = $this.attr('data-id');
            var currentCard;

            idModal = $this.attr('data-target');
            $(idModal).modal();

            if (idMap !== '' && window.dataMap != undefined) {
                currentCard = $this.parents('.purchase-item');
                if (window.popupMap.eMap !== null) {
                    window.popupMap.map.init(idMap, window.dataMap, currentCard, statusCard, currentId);
                } else {
                    window.popupMap.init(idMap, window.dataMap, currentCard, statusCard, currentId);
                }
            }
        });

        $('.modal').on('hidden.bs.modal', function () {
            if ($('.map-wrap').length && window.popupMap.eMap) {
                window.popupMap.destroy(idModal);
            }
        });

        $(document).on('click', '.js-show-modal-single', function (e) {
            var $this = $(e.currentTarget);
            if ($this.attr("href")) e.preventDefault();
            var idMap = $this.attr('data-popup');

            idModal = $this.attr('data-target');
            idPoint = $this.attr('data-id');
            $(idModal).modal();

            if (idMap !== '' && window.dataMap != undefined && idPoint !== '') {
                window.popupMapSingle.init(idMap, window.dataMap, idPoint);
            }

        });

        $('.modal').on('hidden.bs.modal', function () {
            if ($('.map-wrap').length && window.popupMapSingle.popupMap) {
                window.popupMapSingle.destroy(idModal);
            }
        });

        $(window).on('resize', function () {
            if ($('.map-wrap__content').is(':visible')) {
                $(idModal).find('.close').trigger('click');
                $(idModal).find('.map-wrap__nav').removeClass('is-open');
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
        pScroll: null,
        curid: null,
        buildAddressList: function () {
            var html = "";
            var listItem;

            html += '<ul class="map-wrap__nav-list">';
            for (var i = 0; i < window.popupMap.eData.length; i++) {
                var placemark = window.popupMap.eData[i];

                html += '<li class="map-wrap__nav-list-item" data-id="' + placemark["id"] + '">' +
                    '<div class="map-wrap__nav-title">' + placemark["address"] + '</div>' +
                    '<div class="map-wrap__nav-text">' + placemark["time"] + '</div>' +
                    '</li>';
            }
            html += '</ul>';

            window.popupMap.pScroll = $('.map-wrap__nav-scrollbar');
            window.popupMap.pScroll.html(html);
            window.popupMap.pScroll.perfectScrollbar({
                suppressScrollX: true,
                minScrollbarLength: 20
            });

            window.popupMap.pScroll.on("mousemove", function () {
                $(this).perfectScrollbar('update');
            });

            if (window.popupMap.map.status == 'edit') {
                listItem = $('#' + window.popupMap.map.id).parents('.modal').find('.map-wrap__nav-list-item[data-id="' + window.popupMap.curid + '"]');
                listItem.addClass('is-active');
                $('#' + window.popupMap.map.id).parents('.modal').find('.js-map-cover').text(listItem.find('.map-wrap__nav-title').text());
            }

            if (window.popupMap.map.status == 'add') {
                $('#' + window.popupMap.map.id).parents('.modal').find('.js-map-cover').text('Выберите адрес');
            }

        },

        destroy: function (id) {
            window.popupMap.eMap.destroy();
            window.popupMap.clusterer.removeAll();
            window.popupMap.eData = [];
            window.popupMap.ePlacemarkArray = [];
            $(id).find('.map-wrap__nav-scrollbar').perfectScrollbar('destroy');
            $(id).find('.map-wrap__nav-list').empty().remove();
        },

        clickMapList: function () {
            $(document).on('click', '.map-wrap__nav-list .map-wrap__nav-list-item', function () {
                var id = $(this).attr('data-id');
                var placemark = window.popupMap.ePlacemarkArray[id - 1];
                var parentEl = $(this).parents('.map-wrap__nav');
                var list = $(this).parents('.map-wrap__nav-list');

                if (!$(this).hasClass('is-active')) {
                    list.find('.is-active').removeClass('is-active');
                    $(this).addClass('is-active');
                    parentEl.removeClass('is-open');
                    parentEl.find('.js-map-cover').empty().text($(this).find('.map-wrap__nav-title').text());
                    window.popupMap.eMap.setZoom(15);
                    window.popupMap.eMap.setCenter(placemark.geometry.getCoordinates());
                    placemark.balloon.open();
                }
            });

            $(document).on('click', '.js-map-cover', function (e) {
                var $this, parentEl;
                
                $this = $(e.currentTarget);
                parentEl = $this.parents('.map-wrap__nav');
                
                if (parentEl.hasClass('is-open')) {
                    parentEl.removeClass('is-open');
                } else {
                    parentEl.addClass('is-open');
                    window.popupMap.pScroll.perfectScrollbar('update');
                }
            });
        },

        map: {
            id: null,
            selector: null,
            status: null,
            openForm: function () {
                var idMap = '#' + window.popupMap.map.id;
                var statusLink = window.popupMap.map.status;
                var tpl = '';
                var id = '';
                var series = '';

                id = $(this).attr('data-id');
                series = window.popupMap.eData[id - 1];

                if (statusLink == 'edit') {
                    $('.js-map-title', window.popupMap.map.selector).html(series['title']);
                    $('.js-map-address', window.popupMap.map.selector).html(series['city'] + ', ' + series['address']);
                    $('.js-map-time', window.popupMap.map.selector).html(series['time']);
                    $('.js-show-modal-single', window.popupMap.map.selector).attr('data-id', id);
                }

                if (statusLink == 'add') {
                    if (series['title'] != '') {
                        tpl += '<div class="purchase-item__map-list">' +
                            '<div class="purchase-item__map-list-title js-map-title">"' + series['title'] + '"</div>' +
                            '</div>';
                    }

                    if (series['time'] != '') {
                        tpl += '<div class="purchase-item__map-list">' +
                            '<div class="purchase-item__map-list-label">Время работы:</div>' +
                            '<div class="purchase-item__map-list-text js-map-time">' + series['time'] + '</div>' +
                            '</div>';
                    }

                    if (series['address'] != '') {
                        tpl += '<div class="purchase-item__map-list">' +
                            '<div class="purchase-item__map-list-label">Адрес:</div>' +
                            '<div class="purchase-item__map-list-text js-map-address">' + series['address'] + '</div>' +
                            '</div>';
                    }
                    
                    $(window.popupMap.map.selector).find('.js-show-modal-single').show();
                    $(tpl).insertAfter($(window.popupMap.map.selector).find('.js-show-modal').attr('data-point', 'edit').attr('data-id', id).removeClass('is-danger').addClass('is-info').empty().text('Изменить').parent());

                    // TODO: ajax request save selected ID

                }

                $(idMap).parents('.modal').find('.close').trigger('click');
            },
            addPlacemarks: function () {
                var MyBalloonContentLayoutClass = ymaps.templateLayoutFactory.createClass(
                    '<div class="map-wrap__balloon">' +
                    '<div class="map-wrap__balloon-address">{{ properties.city }}, {{ properties.address }}</div>' +
                    '<div class="map-wrap__balloon-time">{{ properties.time }}</div>' +
                    '<button class="btn btn-success js-add-address" data-id="{{ properties.id }}">Добавить адрес</button>' +
                    '</div>'
                );

                var clusterIcons = [{
                    href: "/assets/images/map-cluster.png",
                    size: [38, 39],
                    offset: [-19, -20]
                }];

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
                                iconLayout: 'default#image',
                                iconImageHref: "/assets/images/map-placemark.png",
                                iconImageSize: [38, 39],
                                iconImageOffset: [-14, -39]
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

            init: function (id, data, selector, status, curid) {
                window.popupMap.eData = data;
                window.popupMap.map.id = id;
                window.popupMap.map.selector = selector;
                window.popupMap.map.status = status;
                window.popupMap.curid = curid;

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
                window.popupMap.buildAddressList();
            }
        },

        init: function (id, data, selector, status, curid) {
            ymaps.load(function () {
                window.popupMap.map.init(id, data, selector, status);
            });

            window.popupMap.clickMapList();
            $(document).on('click', '.js-add-address', window.popupMap.map.openForm);
        }
    }

    window.popupMapSingle = {
        eData: null,
        popupMap: null,
        id: null,
        clusterer: null,
        ePlacemarkArray: [],
        addPlacemarks: function () {
            var MyBalloonContentLayoutClass = ymaps.templateLayoutFactory.createClass(
                '<div class="map-wrap__balloon">' +
                '<div class="map-wrap__balloon-address">{{ properties.city }}, {{ properties.address }}</div>' +
                '<div class="map-wrap__balloon-time">{{ properties.time }}</div>' +
                '</div>'
            );

            var clusterIcons = [{
                href: "/assets/images/map-cluster.png",
                size: [38, 39],
                offset: [-19, -20]
            }];

            var point;

            var MyIconContentLayout = ymaps.templateLayoutFactory.createClass('<div class="map-wrap__cluster">$[properties.geoObjects.length]</div>');

            var data = window.popupMapSingle.eData;

            if (data) {
                for (var i = 0; i < data.length; i++) {
                    point = data[i];

                    if (window.popupMapSingle.id ==point["id"] && point["coordinates"]) {
                        window.popupMapSingle.popupMap.setCenter(point["coordinates"]);
                        window.popupMapSingle.ePlacemarkArray = new ymaps.Placemark(point["coordinates"], {
                            id: point["id"],
                            city: point["city"],
                            address: point["address"],
                            coordinates: point["coordinates"],
                            time: point["time"]
                        }, {
                            clusterize: true,
                            balloonContentLayout: MyBalloonContentLayoutClass,
                            balloonMaxWidth: 260,
                            iconLayout: 'default#image',
                            iconImageHref: "/assets/images/map-placemark.png",
                            iconImageSize: [38, 39],
                            iconImageOffset: [-14, -39]
                        });
                    }
                }
            }

            window.popupMapSingle.clusterer = new ymaps.Clusterer({
                openBalloonOnClick: false,
                clusterIcons: clusterIcons,
                clusterIconContentLayout: MyIconContentLayout
            });

            window.popupMapSingle.clusterer.add(window.popupMapSingle.ePlacemarkArray);
            window.popupMapSingle.popupMap.geoObjects.add(window.popupMapSingle.clusterer);

            var objectState = window.popupMapSingle.clusterer.getObjectState(window.popupMapSingle.ePlacemarkArray);

            if (objectState.isClustered) {
                objectState.cluster.state.set('activeObject', window.popupMapSingle.ePlacemarkArray);
                window.popupMapSingle.clusterer.balloon.open(objectState.cluster);
            } else if (objectState.isShown) {
                window.popupMapSingle.ePlacemarkArray.balloon.open();
            }
        },

        destroy: function (id) {
            window.popupMapSingle.popupMap.destroy();
            window.popupMapSingle.clusterer.removeAll();
            window.popupMapSingle.eData = [];
            window.popupMapSingle.ePlacemarkArray = [];
        },
        
        init: function(selector, data, id) {
            window.popupMapSingle.eData = data;
            window.popupMapSingle.id = id;
            ymaps.load(function() {
                window.popupMapSingle.popupMap = new ymaps.Map(selector, {
                    center: [55.76, 37.64],
                    zoom: 12,
                    controls: [],
                    ignoreResize: false
                });

                window.popupMapSingle.popupMap.controls.add('zoomControl', {
                    position: {
                        top: 75,
                        left: 'auto',
                        right: 15
                    }
                });

                window.popupMapSingle.popupMap.behaviors.disable('scrollZoom');
                window.popupMapSingle.addPlacemarks();
            });
        }
    }

    function isMobile() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return true;
        } else {
            return false;
        };
    }

    return {
        init: function () {
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

$(function () {
    Main.init();
});