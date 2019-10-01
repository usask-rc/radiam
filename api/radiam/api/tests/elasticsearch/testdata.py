TEST_DATA_SINGLE_DOC = [{
                    "name": "maw doghouse node.txt",
                    "description": "bottle folio depute grapevine wind",
                    "path": "file://C:/Users/bob/My Documents/maw doghouse node.txt",
                    "checksum": "9b73bef7e371e44e10c4656ff433a68648cb3986",
                    "checksumFormat": "sha-1",
                    "contentLength": 784565,
                    "contentType": "text/plain",
                    "permissions": "0777",
                    "radiam": {
                        "location": "93836039-d54c-4616-a5d3-068a67a90227",
                        "agent": "d3ee03e1-a551-4495-9946-d5d0cad8cba3"
                    },
                    "last_modified": "2019-01-11T00:00:00",
                    "last_access": "2019-01-11T00:00:00",
                    "indexed_date": "2019-01-11T00:00:00",
                    "indexed_by": "jeffgreff",
                    "keywords": [
                        "resilient",
                        "c",
                        "mesenteric",
                        "cellulose",
                        "bagatelle"
                    ],
                    "owner": {
                        "username": "jeffgreff",
                        "firstname": "Jeff",
                        "lastname": "Greff"
                    },
                    "authors": [
                        {
                            "username": "bobrobb",
                            "firstname": "Bob",
                            "lastname": "Robb"
                        },
                        {
                            "username": "jimscrim",
                            "firstname": "Jim",
                            "lastname": "Scrim"
                        }
                    ],
                    "osgroup": "osgroup",
                    "temporalCoverage": {
                        "start": "2019-01-11T00:00:00",
                        "end": "2019-01-11T00:00:00"
                    },
                    "collectionPeriods": [
                        {
                            "start": "2019-01-11T00:00:00",
                            "end": "2019-01-11T00:00:00"
                        },
                        {
                            "start": "2019-01-11T00:00:00",
                            "end": "2019-01-11T00:00:00"
                        }
                    ],
                    "spatialCoverage": {
                        "geo": {
                            "@type": "GeoShape",
                            "box": "18.0 -65.0 72.0 172.0"
                        }
                    },
                    "extendedAttributes": [
                        {
                            "name": "Exposure Time",
                            "value": "1/659",
                            "units": "s"
                        },
                        {
                            "name": "FNumber",
                            "value": "f/4.0",
                            "units": ""
                        },
                        {
                            "name": "MaxApertureValue",
                            "value": "2.00",
                            "units": ""
                        }
                    ]
                }]

TEST_DATA_SINGLE_DOC_2 = [{"name": "millstone ambitious reign.txt", "description": "Bremen monochromator striptease Alcmena midstream","path": "file://C:/Users/bob/My Documents/millstone ambitious reign.txt","checksum": "4594e4e3610ae6b6f3c7b0da6a86fd75c1d58087", "checksumFormat": "sha-1", "contentLength": 479459,"contentType": "text/plain", "permissions": "0777","radiam": {"location": "60eefc54-f4d2-4815-bb1b-36988ad9af59", "agent": "6e0770d1-60a5-459a-bc91-c8a01ef5a116"},"last_modified": "2019-01-15T00:00:00", "last_access": "2019-01-15T00:00:00", "indexed_date": "2019-01-15T00:00:00","indexed_by": "bobrobb", "keywords": ["scabious", "Battelle", "whittle", "ND", "taxied"],"owner": {"username": "bobrobb", "firstname": "Bob", "lastname": "Robb"},"authors": [{"username": "jeffgreff", "firstname": "Jeff", "lastname": "Greff"},{"username": "bobrobb", "firstname": "Bob", "lastname": "Robb"}], "osgroup": "osgroup","temporalCoverage": {"start": "2019-01-15T00:00:00", "end": "2019-01-15T00:00:00"},"collectionPeriods": [{"start": "2019-01-15T00:00:00", "end": "2019-01-15T00:00:00"},{"start": "2019-01-15T00:00:00", "end": "2019-01-15T00:00:00"}],"spatialCoverage": {"geo": {"@type": "GeoShape", "box": "18.0 -65.0 72.0 172.0"}},"extendedAttributes": [{"name": "Exposure Time", "value": "1/659", "units": "s"},{"name": "FNumber", "value": "f/4.0", "units": ""},{"name": "MaxApertureValue", "value": "2.00", "units": ""}]}]

TEST_DATA_MULTIPLE_DOCS = [
        {"name": "millstone ambitious reign.txt", "description": "Bremen monochromator striptease Alcmena midstream", "path": "file://C:/Users/bob/My Documents/millstone ambitious reign.txt", "checksum": "4594e4e3610ae6b6f3c7b0da6a86fd75c1d58087", "checksumFormat": "sha-1", "contentLength": 479459, "contentType": "text/plain", "permissions": "0777", "radiam": {"location": "60eefc54-f4d2-4815-bb1b-36988ad9af59", "agent": "6e0770d1-60a5-459a-bc91-c8a01ef5a116"}, "last_modified": "2019-01-15T00:00:00", "last_access": "2019-01-15T00:00:00", "indexed_date": "2019-01-15T00:00:00", "indexed_by": "bobrobb", "keywords": ["scabious", "Battelle", "whittle", "ND", "taxied"], "owner": {"username": "bobrobb", "firstname": "Bob", "lastname": "Robb"}, "authors": [{"username": "jeffgreff", "firstname": "Jeff", "lastname": "Greff"}, {"username": "bobrobb", "firstname": "Bob", "lastname": "Robb"}], "osgroup": "osgroup", "temporalCoverage": {"start": "2019-01-15T00:00:00", "end": "2019-01-15T00:00:00"}, "collectionPeriods": [{"start": "2019-01-15T00:00:00", "end": "2019-01-15T00:00:00"}, {"start": "2019-01-15T00:00:00", "end": "2019-01-15T00:00:00"}], "spatialCoverage": {"geo": {"@type": "GeoShape", "box": "18.0 -65.0 72.0 172.0"}}, "extendedAttributes": [{"name": "Exposure Time", "value": "1/659", "units": "s"}, {"name": "FNumber", "value": "f/4.0", "units": ""}, {"name": "MaxApertureValue", "value": "2.00", "units": ""}]},
        {"name": "calculi nominee osteoporosis.txt", "description": "zoo ineluctable condemn augment toccata", "path": "file://C:/Users/bob/My Documents/calculi nominee osteoporosis.txt", "checksum": "7c9375bd979fec27bceeb2b8f9e2903433bb1769", "checksumFormat": "sha-1", "contentLength": 921918, "contentType": "text/plain", "permissions": "0777", "radiam": {"location": "60eefc54-f4d2-4815-bb1b-36988ad9af59", "agent": "6e0770d1-60a5-459a-bc91-c8a01ef5a116"}, "last_modified": "2019-01-15T00:00:00", "last_access": "2019-01-15T00:00:00", "indexed_date": "2019-01-15T00:00:00", "indexed_by": "jeffgreff", "keywords": ["forsook", "shibboleth", "prose", "morphology", "polarography"], "owner": {"username": "jeffgreff", "firstname": "Jeff", "lastname": "Greff"}, "authors": [{"username": "bobrobb", "firstname": "Bob", "lastname": "Robb"}, {"username": "jimscrim", "firstname": "Jim", "lastname": "Scrim"}], "osgroup": "osgroup", "temporalCoverage": {"start": "2019-01-15T00:00:00", "end": "2019-01-15T00:00:00"}, "collectionPeriods": [{"start": "2019-01-15T00:00:00", "end": "2019-01-15T00:00:00"}, {"start": "2019-01-15T00:00:00", "end": "2019-01-15T00:00:00"}], "spatialCoverage": {"geo": {"@type": "GeoShape", "box": "18.0 -65.0 72.0 172.0"}}, "extendedAttributes": [{"name": "Exposure Time", "value": "1/659", "units": "s"}, {"name": "FNumber", "value": "f/4.0", "units": ""}, {"name": "MaxApertureValue", "value": "2.00", "units": ""}]},
        {"name": "height buccaneer minot.txt", "description": "menace happenstance tessellate afterlife Emile", "path": "file://C:/Users/bob/My Documents/height buccaneer minot.txt", "checksum": "13fb5482f73949a0cc00968a0a75dfb659d3723f", "checksumFormat": "sha-1", "contentLength": 448222, "contentType": "text/plain", "permissions": "0777", "radiam": {"location": "60eefc54-f4d2-4815-bb1b-36988ad9af59", "agent": "6e0770d1-60a5-459a-bc91-c8a01ef5a116"}, "last_modified": "2019-01-15T00:00:00", "last_access": "2019-01-15T00:00:00", "indexed_date": "2019-01-15T00:00:00", "indexed_by": "jeffgreff", "keywords": ["Venice", "lash", "recessive", "barre", "hang"], "owner": {"username": "jeffgreff", "firstname": "Jeff", "lastname": "Greff"}, "authors": [{"username": "bobrobb", "firstname": "Bob", "lastname": "Robb"}, {"username": "jimscrim", "firstname": "Jim", "lastname": "Scrim"}], "osgroup": "osgroup", "temporalCoverage": {"start": "2019-01-15T00:00:00", "end": "2019-01-15T00:00:00"}, "collectionPeriods": [{"start": "2019-01-15T00:00:00", "end": "2019-01-15T00:00:00"}, {"start": "2019-01-15T00:00:00", "end": "2019-01-15T00:00:00"}], "spatialCoverage": {"geo": {"@type": "GeoShape", "box": "18.0 -65.0 72.0 172.0"}}, "extendedAttributes": [{"name": "Exposure Time", "value": "1/659", "units": "s"}, {"name": "FNumber", "value": "f/4.0", "units": ""}, {"name": "MaxApertureValue", "value": "2.00", "units": ""}]},
        {"name": "qualitative prexy societal.txt", "description": "vertebra freeze confrontation Eskimo invulnerable", "path": "file://C:/Users/bob/My Documents/qualitative prexy societal.txt", "checksum": "fe91b62bf804e6904fec5892aaf2e43b3642ee6f", "checksumFormat": "sha-1", "contentLength": 154070, "contentType": "text/plain", "permissions": "0777", "radiam": {"location": "60eefc54-f4d2-4815-bb1b-36988ad9af59", "agent": "6e0770d1-60a5-459a-bc91-c8a01ef5a116"}, "last_modified": "2019-01-15T00:00:00", "last_access": "2019-01-15T00:00:00", "indexed_date": "2019-01-15T00:00:00", "indexed_by": "bobrobb", "keywords": ["Marc", "Garvey", "Ella", "ridden", "Ababa"], "owner": {"username": "bobrobb", "firstname": "Bob", "lastname": "Robb"}, "authors": [{"username": "bobrobb", "firstname": "Bob", "lastname": "Robb"}, {"username": "jimscrim", "firstname": "Jim", "lastname": "Scrim"}], "osgroup": "osgroup", "temporalCoverage": {"start": "2019-01-15T00:00:00", "end": "2019-01-15T00:00:00"}, "collectionPeriods": [{"start": "2019-01-15T00:00:00", "end": "2019-01-15T00:00:00"}, {"start": "2019-01-15T00:00:00", "end": "2019-01-15T00:00:00"}], "spatialCoverage": {"geo": {"@type": "GeoShape", "box": "18.0 -65.0 72.0 172.0"}}, "extendedAttributes": [{"name": "Exposure Time", "value": "1/659", "units": "s"}, {"name": "FNumber", "value": "f/4.0", "units": ""}, {"name": "MaxApertureValue", "value": "2.00", "units": ""}]},
        {"name": "fun aim expansible.txt", "description": "ignoble jockey ERDA stop Hollister", "path": "file://C:/Users/bob/My Documents/fun aim expansible.txt", "checksum": "0a068009ea40fc99fccacc862a7280d8b321f1fd", "checksumFormat": "sha-1", "contentLength": 490626, "contentType": "text/plain", "permissions": "0777", "radiam": {"location": "60eefc54-f4d2-4815-bb1b-36988ad9af59", "agent": "6e0770d1-60a5-459a-bc91-c8a01ef5a116"}, "last_modified": "2019-01-15T00:00:00", "last_access": "2019-01-15T00:00:00", "indexed_date": "2019-01-15T00:00:00", "indexed_by": "jimscrim", "keywords": ["where'd", "loin", "schema", "kindle", "stanchion"], "owner": {"username": "jimscrim", "firstname": "Jim", "lastname": "Scrim"}, "authors": [{"username": "jeffgreff", "firstname": "Jeff", "lastname": "Greff"}, {"username": "bobrobb", "firstname": "Bob", "lastname": "Robb"}], "osgroup": "osgroup", "temporalCoverage": {"start": "2019-01-15T00:00:00", "end": "2019-01-15T00:00:00"}, "collectionPeriods": [{"start": "2019-01-15T00:00:00", "end": "2019-01-15T00:00:00"}, {"start": "2019-01-15T00:00:00", "end": "2019-01-15T00:00:00"}], "spatialCoverage": {"geo": {"@type": "GeoShape", "box": "18.0 -65.0 72.0 172.0"}}, "extendedAttributes": [{"name": "Exposure Time", "value": "1/659", "units": "s"}, {"name": "FNumber", "value": "f/4.0", "units": ""}, {"name": "MaxApertureValue", "value": "2.00", "units": ""}]},
    ]

# TEST_DATA_AGENT_SHAPE_SINGLE_DOC = [
#     {
#         "path": "file://C:/Users/bob/My Documents/straight Kaplan Bateman.txt",
#         "location": "fbf6e514-877f-4d29-8627-f27fc00c81f3",
#         "agent": "6f56c1df-00b5-461e-a560-93f7b2046d18",
#         "name": "straight Kaplan Bateman.txt",
#         "indexing_date": "2019-03-05T00:00:00",
#         "extension": "png",
#         "last_access": "2019-03-05T00:00:00",
#         "filesize": 367683,
#         "last_modified": "2019-03-05T00:00:00",
#         "last_change": "2019-03-05T00:00:00",
#         "path_parent": "file://C:/Users/bob/My Documents/",
#         "indexed_date": "2019-03-05T00:00:00"
#     },
# ]


# TEST_DATA_AGENT_SHAPE_DOCS = [
#     {"path": "file://C:/Users/bob/My Documents/straight Kaplan Bateman.txt", "location": "fbf6e514-877f-4d29-8627-f27fc00c81f3", "agent": "6f56c1df-00b5-461e-a560-93f7b2046d18", "name": "straight Kaplan Bateman.txt", "indexing_date": "2019-03-05T00:00:00", "extension": "png", "last_access": "2019-03-05T00:00:00", "filesize": 367683, "last_modified": "2019-03-05T00:00:00", "last_change": "2019-03-05T00:00:00", "path_parent": "file://C:/Users/bob/My Documents/", "indexed_date": "2019-03-05T00:00:00"},
#     {"path": "file://C:/Users/bob/My Documents/Syracuse libel pandemic.txt", "location": "fbf6e514-877f-4d29-8627-f27fc00c81f3", "agent": "6f56c1df-00b5-461e-a560-93f7b2046d18", "name": "Syracuse libel pandemic.txt", "indexing_date": "2019-03-05T00:00:00", "extension": "png", "last_access": "2019-03-05T00:00:00", "filesize": 582711, "last_modified": "2019-03-05T00:00:00", "last_change": "2019-03-05T00:00:00", "path_parent": "file://C:/Users/bob/My Documents/", "indexed_date": "2019-03-05T00:00:00"},
#     {"path": "file://C:/Users/bob/My Documents/whistleable priori toccata.txt", "location": "fbf6e514-877f-4d29-8627-f27fc00c81f3", "agent": "6f56c1df-00b5-461e-a560-93f7b2046d18", "name": "whistleable priori toccata.txt", "indexing_date": "2019-03-05T00:00:00", "extension": "bmp", "last_access": "2019-03-05T00:00:00", "filesize": 271836, "last_modified": "2019-03-05T00:00:00", "last_change": "2019-03-05T00:00:00", "path_parent": "file://C:/Users/bob/My Documents/", "indexed_date": "2019-03-05T00:00:00"},
#     {"path": "file://C:/Users/bob/My Documents/pestilent torr module.txt", "location": "fbf6e514-877f-4d29-8627-f27fc00c81f3", "agent": "6f56c1df-00b5-461e-a560-93f7b2046d18", "name": "pestilent torr module.txt", "indexing_date": "2019-03-05T00:00:00", "extension": "bmp", "last_access": "2019-03-05T00:00:00", "filesize": 370198, "last_modified": "2019-03-05T00:00:00", "last_change": "2019-03-05T00:00:00", "path_parent": "file://C:/Users/bob/My Documents/", "indexed_date": "2019-03-05T00:00:00"},
#     {"path": "file://C:/Users/bob/My Documents/Clearwater putrefaction matrimonial.txt", "location": "fbf6e514-877f-4d29-8627-f27fc00c81f3", "agent": "6f56c1df-00b5-461e-a560-93f7b2046d18", "name": "Clearwater putrefaction matrimonial.txt", "indexing_date": "2019-03-05T00:00:00", "extension": "csv", "last_access": "2019-03-05T00:00:00", "filesize": 396088, "last_modified": "2019-03-05T00:00:00", "last_change": "2019-03-05T00:00:00", "path_parent": "file://C:/Users/bob/My Documents/", "indexed_date": "2019-03-05T00:00:00"},
#     {"path": "file://C:/Users/bob/My Documents/quickstep expel Bhutan.txt", "location": "fbf6e514-877f-4d29-8627-f27fc00c81f3", "agent": "6f56c1df-00b5-461e-a560-93f7b2046d18", "name": "quickstep expel Bhutan.txt", "indexing_date": "2019-03-05T00:00:00", "extension": "json", "last_access": "2019-03-05T00:00:00", "filesize": 32088, "last_modified": "2019-03-05T00:00:00", "last_change": "2019-03-05T00:00:00", "path_parent": "file://C:/Users/bob/My Documents/", "indexed_date": "2019-03-05T00:00:00"},
#     {"path": "file://C:/Users/bob/My Documents/perspicacious British versa.txt", "location": "fbf6e514-877f-4d29-8627-f27fc00c81f3", "agent": "6f56c1df-00b5-461e-a560-93f7b2046d18", "name": "perspicacious British versa.txt", "indexing_date": "2019-03-05T00:00:00", "extension": "png", "last_access": "2019-03-05T00:00:00", "filesize": 157560, "last_modified": "2019-03-05T00:00:00", "last_change": "2019-03-05T00:00:00", "path_parent": "file://C:/Users/bob/My Documents/", "indexed_date": "2019-03-05T00:00:00"},
#     {"path": "file://C:/Users/bob/My Documents/guillemot would wildfire.txt", "location": "fbf6e514-877f-4d29-8627-f27fc00c81f3", "agent": "6f56c1df-00b5-461e-a560-93f7b2046d18", "name": "guillemot would wildfire.txt", "indexing_date": "2019-03-05T00:00:00", "extension": "bmp", "last_access": "2019-03-05T00:00:00", "filesize": 142462, "last_modified": "2019-03-05T00:00:00", "last_change": "2019-03-05T00:00:00", "path_parent": "file://C:/Users/bob/My Documents/", "indexed_date": "2019-03-05T00:00:00"},
#     {"path": "file://C:/Users/bob/My Documents/heavenward busload got.txt", "location": "fbf6e514-877f-4d29-8627-f27fc00c81f3", "agent": "6f56c1df-00b5-461e-a560-93f7b2046d18", "name": "heavenward busload got.txt", "indexing_date": "2019-03-05T00:00:00", "extension": "json", "last_access": "2019-03-05T00:00:00", "filesize": 755796, "last_modified": "2019-03-05T00:00:00", "last_change": "2019-03-05T00:00:00", "path_parent": "file://C:/Users/bob/My Documents/", "indexed_date": "2019-03-05T00:00:00"},
#     {"path": "file://C:/Users/bob/My Documents/tooth transfinite judo.txt", "location": "fbf6e514-877f-4d29-8627-f27fc00c81f3", "agent": "6f56c1df-00b5-461e-a560-93f7b2046d18", "name": "tooth transfinite judo.txt", "indexing_date": "2019-03-05T00:00:00", "extension": "json", "last_access": "2019-03-05T00:00:00", "filesize": 929653, "last_modified": "2019-03-05T00:00:00", "last_change": "2019-03-05T00:00:00", "path_parent": "file://C:/Users/bob/My Documents/", "indexed_date": "2019-03-05T00:00:00"},
#     {"path": "file://C:/Users/bob/My Documents/viburnum opposite acorn.txt", "location": "fbf6e514-877f-4d29-8627-f27fc00c81f3", "agent": "6f56c1df-00b5-461e-a560-93f7b2046d18", "name": "viburnum opposite acorn.txt", "indexing_date": "2019-03-05T00:00:00", "extension": "json", "last_access": "2019-03-05T00:00:00", "filesize": 517995, "last_modified": "2019-03-05T00:00:00", "last_change": "2019-03-05T00:00:00", "path_parent": "file://C:/Users/bob/My Documents/", "indexed_date": "2019-03-05T00:00:00"},
# ]