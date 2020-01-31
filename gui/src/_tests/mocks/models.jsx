module.exports = Object.freeze({
  user: {
    id: "41c3fc25-2ad5-4b8e-9ec4-be45df40ed55",
    username: "admin",
    first_name: "",
    last_name: "",
    email: "admin@example.com",
    is_active: true,
    is_superuser: true,
    time_zone_id: null,
    user_orcid_id: null,
    date_created: "2019-01-28T19:29:29.238000Z",
    date_updated: "2019-01-28T19:29:29.238000Z",
    notes: null
  },
  dummyPoint :{feature: {
    geometry: {
        type: "Point",
        coordinates: [1, 0]
    }
  }},
  dummyLineString: {feature: {
    geometry: {
        type: "LineString",
        coordinates: [[2, 3],[0, 0],[1, 1]]
    }
  }},
  dummyPolygon: {feature: {
    geometry: {
        type: "Polygon",
        coordinates: [[[2, 3], [2, 2], [1, 1], [0, 0]]]
    }
  }},
  dummyMultiPoint: {feature: {
    geometry: {
        type: "MultiPoint",
        coordinates: [[1,10], [2,2]]
    }
  }},
  dummyMultiLineString: {feature: {
    geometry: {
        type: "MultiLineString",
        coordinates: [[[3, 5], [2, 2], [1, 1], [0, 0]]]
    }
  }},

  dummyMultiPolygon: {feature: {
    geometry: {
        type: "MultiPolygon",
        coordinates: [[[[4, 8], [2, 2], [1, 1], [0, 0]]]]
    }
  }},

  userAgent: {
    id: "12785dfb-1791-4771-953e-09febcb8b103",
    user:
      "41c3fc25-2ad5-4b8e-9ec4-be45df40ed55",
    location:
      "9fc371a8-6eba-41d2-a0b0-a9782cf61166"
  },

  project: {
    id: "100235d2-c388-4abe-9c6d-73f528f38144",
    name: "Derp Futures Research",
    group:
      "4182bcdb-98ae-40be-bcff-00584558d46f",
    data_title: "Research Is Fun",
    data_abstract: "A bunch of people will be doing things. And stuff.",
    study_site: "Saskatoon, SK",
    keywords: "big, data, research, derp",
    distribution_restriction:
      "8e9e49ff-a307-4373-98fc-d8fac1c22859",
    data_collection_method: [
      {
        id: "a99a3a24-da63-4e46-94e9-c1e3a8c46fee",
        label: "datacollection.method.census"
      },
      {
        id: "b5917e5d-919a-4f92-9d0f-3defdff85dc4",
        label: "datacollection.method.fieldwork"
      }
    ],
    data_collection_status:
      "144a7ee6-3b14-46e1-adbb-5f1034b31fd1",
    primary_contact_user:
      "41c3fc25-2ad5-4b8e-9ec4-be45df40ed55",
    sensitivity_level: [
      {
        id: "52723147-3796-428f-899e-2865ab676a0f",
        label: "sensitivity.level.none"
      }
    ],
    date_created: "2019-01-28T19:36:53.448000Z",
    date_updated: "2019-01-28T19:36:53.448000Z"
  },

  researchGroup: {
    id: "cb03b55d-873f-4a0e-8208-07f960fa5032",
    description: "All users in this Radiam instance",
    name: "All Users",
    parent_group: null,
    date_created: "2019-04-23T16:29:33.515345Z",
    date_updated: "2019-04-23T16:29:33.515345Z",
    is_active: true
  },

  locationType: {
    id: "dc010206-085d-4f9a-8c04-631a23325bce",
    label: "Type1"
  },

  location: {
    id: "9fc371a8-6eba-41d2-a0b0-a9782cf61166",
    display_name: "Location 1",
    host_name: "localhost",
    location_type:
      "dc010206-085d-4f9a-8c04-631a23325bce",
    is_active: true,
    date_created: "2019-01-28T19:35:10.738000Z",
    date_updated: "2019-03-13T17:56:10.902000Z"
  },

  groupViewGrant: {
    id: "95942d52-1949-46a0-bafc-e57913b61a36",
    group:
      "cb03b55d-873f-4a0e-8208-07f960fa5032",
    project:
      "094ee941-3c2b-4e73-953b-85cf1585dab5",
    fields: "filename",
    date_created: "2019-04-23T17:10:41.953966Z",
    date_updated: "2019-04-23T21:19:30.926808Z",
    date_starts: "2019-04-23T17:10:41.953966Z",
    date_expires: null
  },

  groupRole: {
    id: "a59be619-fd9b-462b-8643-486e68f38613",
    label: "group.role.admin.label",
    description: "group.role.admin.description"
  },

  groupMember: {
    id: "c0f59353-2edb-4b9c-bee8-62a998472bff",
    group:
      "16e10068-f802-494b-b15d-19f90085a70b",
    group_role:
      "d9ba1fc5-606f-4f16-81b1-8816095e5041",
    user:
      "b9d7096b-c1df-4a94-bab8-fc2489b86710",
    is_active: true,
    date_created: "2019-03-13T19:18:55.910000Z",
    date_updated: "2019-03-13T21:47:31.054000Z",
    date_expires: "2019-03-13T21:47:09.577000Z"
  },

  dataCollectionMethod: {
    id: "a99a3a24-da63-4e46-94e9-c1e3a8c46fee",
    label: "datacollection.method.census"
  },

  projectDataCollectionMethod: {
    "id": "e853a7ff-9bb9-4890-8139-a8e536fc8b7d",
    "project": "100235d2-c388-4abe-9c6d-73f528f38144",
    "data_collection_method": "f653a6ea-1262-4e0b-9524-1d5a822efee0"
  },

  projectSensitivity: {
    "id": "5ec2aeef-7af8-4cdb-a1f9-f3f926d32194",
    "project": "094ee941-3c2b-4e73-953b-85cf1585dab5",
    "sensitivity": "ad724976-f8c9-4cda-9e04-72773071f2d4"
  },
  projectSensitivity_noURL: {
    "id": "5ec2aeef-7af8-4cdb-a1f9-f3f926d32194",
    "project": "094ee941-3c2b-4e73-953b-85cf1585dab5",
    "sensitivity": "ad724976-f8c9-4cda-9e04-72773071f2d4"
  },

  projectDataCollectionMethod_noURL: {
    "id": "e853a7ff-9bb9-4890-8139-a8e536fc8b7d",
    "project": "100235d2-c388-4abe-9c6d-73f528f38144",
    "data_collection_method": "f653a6ea-1262-4e0b-9524-1d5a822efee0"
  },

  dataCollectionStatus: {
    id: "ad06a00e-21d9-4e65-8453-61f35befd9bb",
    label: "datacollection.status.complete"
  },

  distributionRestriction: {
    id: "365f998e-d525-4505-8728-90fb5c99d598",
    label: "distribution.restriction.embargo"
  },

  sensitivityLevel: {
    id: "72d5242a-75b4-461f-9c19-ce84495a4ca7",
    label: "sensitivity.level.governmentpartnership"
  },

  userAgent_noURL: {
    id: "12785dfb-1791-4771-953e-09febcb8b103",
    user:
      "41c3fc25-2ad5-4b8e-9ec4-be45df40ed55",
    location:
      "9fc371a8-6eba-41d2-a0b0-a9782cf61166"
  },

  location_noURL: {
    id: "9fc371a8-6eba-41d2-a0b0-a9782cf61166",
    display_name: "Location 1",
    host_name: "localhost",
    location_type: "dc010206-085d-4f9a-8c04-631a23325bce",
    is_active: true,
    date_created: "2019-01-28T19:35:10.738000Z",
    date_updated: "2019-03-13T17:56:10.902000Z"
  },
  project_noURL: {
    id: "100235d2-c388-4abe-9c6d-73f528f38144",
    name: "Derp Futures Research",
    group:
      "4182bcdb-98ae-40be-bcff-00584558d46f",
    data_title: "Research Is Fun",
    data_abstract: "A bunch of people will be doing things. And stuff.",
    study_site: "Saskatoon, SK",
    keywords: "big, data, research, derp",
    distribution_restriction:
      "8e9e49ff-a307-4373-98fc-d8fac1c22859",
    data_collection_method: [
      "a99a3a24-da63-4e46-94e9-c1e3a8c46fee",
      "b5917e5d-919a-4f92-9d0f-3defdff85dc4",
    ],
    data_collection_status:
      "144a7ee6-3b14-46e1-adbb-5f1034b31fd1",
    primary_contact_user:
      "41c3fc25-2ad5-4b8e-9ec4-be45df40ed55",
    sensitivity_level: [
      "52723147-3796-428f-899e-2865ab676a0f",
    ],
    date_created: "2019-01-28T19:36:53.448000Z",
    date_updated: "2019-01-28T19:36:53.448000Z"
  },

  groupViewGrant_noURL: {
    id: "95942d52-1949-46a0-bafc-e57913b61a36",
    group: "cb03b55d-873f-4a0e-8208-07f960fa5032",
    project: "094ee941-3c2b-4e73-953b-85cf1585dab5",
    fields: "filename",
    date_created: "2019-04-23T17:10:41.953966Z",
    date_updated: "2019-04-23T21:19:30.926808Z",
    date_starts: "2019-04-23T17:10:41.953966Z",
    date_expires: null
  },

  researchGroup_withParent: {
    id: "4182bcdb-98ae-40be-bcff-00584558d46f",
    description: "Derp Research Collective",
    name: "drc",
    parent_group:
      "23e69896-c60a-4e6c-a444-ba906ada91fb",
    date_created: "2019-01-28T19:33:13.903000Z",
    date_updated: "2019-01-28T19:33:13.903000Z",
    is_active: true
  },

  researchGroup_withParent_noURL: {
    id: "4182bcdb-98ae-40be-bcff-00584558d46f",
    description: "Derp Research Collective",
    name: "drc",
    parent_group: "23e69896-c60a-4e6c-a444-ba906ada91fb",
    date_created: "2019-01-28T19:33:13.903000Z",
    date_updated: "2019-01-28T19:33:13.903000Z",
    is_active: true
  },

  groupMember_noURL: {
    id: "c0f59353-2edb-4b9c-bee8-62a998472bff",
    group: "16e10068-f802-494b-b15d-19f90085a70b",
    group_role: "bb7792ee-c7f6-4815-ae24-506fc00d3169",
    user: "b9d7096b-c1df-4a94-bab8-fc2489b86710",
    is_active: "true",
    date_created: "2019-03-13T19:18:55.910000Z",
    date_updated: "2019-04-12T23:19:37.971175Z",
    date_expires: "2019-03-13T21:47:09.577000Z"
  },
  groupMemberWithURLs: {
    id: "c0f59353-2edb-4b9c-bee8-62a998472bff",
    group:
      "16e10068-f802-494b-b15d-19f90085a70b",
    group_role:
      "bb7792ee-c7f6-4815-ae24-506fc00d3169",
    user:
      "b9d7096b-c1df-4a94-bab8-fc2489b86710",
    is_active: "true",
    date_created: "2019-03-13T19:18:55.910000Z",
    date_updated: "2019-04-12T23:19:37.971175Z",
    date_expires: "2019-03-13T21:47:09.577000Z"
  },
  groupViewGrant_noDates: {
    id: "95942d52-1949-46a0-bafc-e57913b61a36",
    group:
      "cb03b55d-873f-4a0e-8208-07f960fa5032",
    project:
      "094ee941-3c2b-4e73-953b-85cf1585dab5",
    fields: "filename",
    date_created: "2019-04-23T17:10:41.953966Z",
    date_updated: "2019-04-23T21:19:30.926808Z",
    date_starts: null,
    date_expires: null
  },
  groupViewGrant_noDates_noURL: {
    id: "95942d52-1949-46a0-bafc-e57913b61a36",
    group: "cb03b55d-873f-4a0e-8208-07f960fa5032",
    project: "094ee941-3c2b-4e73-953b-85cf1585dab5",
    fields: "filename",
    date_created: "2019-04-23T17:10:41.953966Z",
    date_updated: "2019-04-23T21:19:30.926808Z",
    date_starts: null,
    date_expires: null
  },
  groupViewGrant_withDates: {
    id: "95942d52-1949-46a0-bafc-e57913b61a36",
    group:
      "cb03b55d-873f-4a0e-8208-07f960fa5032",
    project:
      "094ee941-3c2b-4e73-953b-85cf1585dab5",
    fields: "filename",
    date_created: "2019-04-23T17:10:41.953966Z",
    date_updated: "2019-04-23T21:19:30.926808Z",
    date_starts: "2019-04-23",
    date_expires: "2019-04-23"
  },
  groupViewGrant_withDates_noURL: {
    id: "95942d52-1949-46a0-bafc-e57913b61a36",
    group: "cb03b55d-873f-4a0e-8208-07f960fa5032",
    project: "094ee941-3c2b-4e73-953b-85cf1585dab5",
    fields: "filename",
    date_created: "2019-04-23T17:10:41.953966Z",
    date_updated: "2019-04-23T21:19:30.926808Z",
    date_starts: "2019-04-23T07:00:00.000000Z",
    date_expires: "2019-04-23T23:59:59.999999Z"
  }
});
