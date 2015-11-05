"use strict";

angular.module('lecturer.lectureEditor.lectureLinksEditor', [
    'angular-carousel'
])

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

                    function getLink(url, title, desc) {
                        var link = {
                            title: title || url,
                            url: url,
                            description: desc || "",
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

                        linkPointer.editingLink = _.extend({
                            description: "",
                            disablePreview: true
                        },link);
                    }

                    function updateLink(linkPointer) {
                        var url = linkPointer.editingLink.url;
                        var title = linkPointer.editingLink.title;
                        var description = linkPointer.editingLink.description;
                        linkPointer.link = getLink(url, title, description);
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

                    function onChangeField (linkPointer) {
                        linkPointer.editingLink.disablePreview = isOEmbedLink(linkPointer.editingLink.url);
                    }

                    function updatePreview (linkPointer) {
                        var editModel = linkPointer.editingLink;
                        editModel.disablePreview = true;
                        tryLoadOEmbed(editModel.url).then(function (data) {
                            if (data.isOEmbed) {
                                editModel.type = "oEmbed";
                                data.data.html = _.escape(data.data.html.trim());
                                editModel.data = data.data;
                            } else {
                                editModel.type = "regular";
                                editModel.data = {};
                            }
                        });
                    }

                    $scope.newLink = '';
                    $scope.linkPointers = [];

                    $scope.addLink = addLink;
                    $scope.editLink = editLink;
                    $scope.updateLink = updateLink;
                    $scope.restoreLink = restoreLink;
                    $scope.removeLink = removeLink;
                    $scope.onChangeField = onChangeField;
                    $scope.updatePreview = updatePreview;
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