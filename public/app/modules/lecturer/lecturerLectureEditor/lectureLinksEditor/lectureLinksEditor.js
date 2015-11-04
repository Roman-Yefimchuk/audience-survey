"use strict";

angular.module('lecturer.lectureEditor.lectureLinksEditor', [])

    .directive('lectureLinksEditor', [
        '$q',
        "$sce",
        "$timeout",
        "utilsService",

        function ($q, $sce, $timeout, utilsService) {
            return {
                scope: {
                    links: '=lectureLinksEditor'
                },
                templateUrl: '/public/app/modules/lecturer/lecturerLectureEditor/lectureLinksEditor/lectureLinksEditor.html',
                controller: ['$scope', function ($scope) {
                    var linkPattern = /^\[url=([^\]]+)\]([^\[]+)\[\/url\]$/;

                    function getLink(url) {
                        var link = {
                            title: url,
                            url: url,
                            type: "regular",
                            data: {}
                        };
                        if (linkPattern.test(url)) {
                            url.replace(linkPattern, function (s, url, title) {
                                link.title = title;
                                link.url = url;
                            });
                        }
                        return link;
                    }

                    function addLink() {
                        var newLink = ($scope.newLink).trim();
                        if (newLink.length > 0) {
                            var link = getLink(newLink);
                            var links = $scope.links;
                            var linkPointers = $scope.linkPointers;
                            tryLoadOEmbed(newLink).then(function (data) {
                                if (data.isOEmbed) {
                                    link.type = "oEmbed";
                                    data.data.html = _.escape(data.data.html.trim());
                                    link.data = data.data;
                                }
                                links.push(link);
                                linkPointers.push({
                                    link: link,
                                    editingLink: null
                                });
                                $scope.newLink = '';
                            });

                        }
                    }

                    function tryLoadOEmbed(url, callback) {
                        return $q(function (resolve) {
                            loadOEmbedData(url)
                                .done(function (data) {
                                    $timeout(function () {
                                        resolve(data || {});
                                    });
                                });
                        });
                    }

                    function editLink(linkPointer) {

                        var link = linkPointer.link;

                        if (link.title == link.url) {
                            linkPointer.editingLink = {
                                text: link.title
                            };
                        } else {
                            linkPointer.editingLink = {
                                text: '[url=@{url}]@{title}[/url]'.format(link)
                            };
                        }
                    }

                    function updateLink(linkPointer) {
                        var url = linkPointer.editingLink['text'];
                        if (linkPattern.test(url)) {
                            text.replace(linkPattern, function (s, url, title) {
                                linkPointer.link = {
                                    title: title,
                                    url: url
                                };
                            });
                        } else {
                            linkPointer.link = {
                                title: url,
                                url: url
                            };
                        }
                        tryLoadOEmbed(url).then(function (data) {
                            if (data.isOEmbed) {
                                linkPointer.link.type = "oEmbed";
                                data.data.html = _.escape(data.data.html.trim());
                                linkPointer.link.data = data.data;
                            } else {
                                linkPointer.link.type = "regular";
                                linkPointer.link.data = {};
                            }

                            linkPointer.editingLink = null;
                            var index = _.indexOf($scope.linkPointers, linkPointer);
                            $scope.links[index] = linkPointer.link;
                        });
                    }

                    function restoreLink(linkPointer) {
                        linkPointer.editingLink = null;
                    }

                    function removeLink(linkPointer) {

                        var index = _.indexOf($scope.linkPointers, linkPointer);

                        $scope.linkPointers = _.without($scope.linkPointers, linkPointer);
                        $scope.links = _.without($scope.links, $scope.links[index]);
                    }

                    $scope.newLink = '';
                    $scope.linkPointers = [];

                    $scope.addLink = addLink;
                    $scope.editLink = editLink;
                    $scope.updateLink = updateLink;
                    $scope.restoreLink = restoreLink;
                    $scope.removeLink = removeLink;
                    $scope.getTrustHtmlContent = utilsService.getTrustHtmlContent;

                    _.forEach($scope.links, function (link) {
                        var linkPointers = $scope.linkPointers;
                        linkPointers.push({
                            link: link,
                            editingLink: null
                        });
                    });
                }]
            };
        }
    ]);