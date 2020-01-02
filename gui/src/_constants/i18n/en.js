//en.js
import englishMessages from 'ra-language-english';

export default {
  ...englishMessages,
  en: {
    metadata: {
      configure: "Metadata",
      config: {
        title: "Configure Additional Metadata",
      },
      default: "Default Value",
      edit: {
        title: "Edit Additional Metadata",
      },
      fields: "Choose Metadata Fields",
      loading: "Loading additional metadata.",
      no: "No Additional Metadata",
      off: "Off",
      on: "On",
      order: "Order",
      required: "Required",
      schemas: "Choose Metadata Schemas",
      show: {
        title: "Additional Metadata",
      },
      visible: "Visible",
      datacite: {
        4.2: {
          label: "Datacite 4.2",
          short: "DC 4.2"
        },
        alternateIdentifiers: {
          label: "Alternate Identifiers",
          alternateIdentifier: {
            label: "Alternate Identifier",
            alternateIdentifierType: {
              label: "Alternate Identifier Type",
            },
          },
        },
        contributors: {
          label: "Contributors",
          contributor: {
            label: "Contributor",
            affiliation: {
              label: "Affiliation"
            },
            contributorName: {
              label: "Contributor Name"
            },
            contributorType: {
              label: "Contributor Type"
            },
            familyName: {
              label: "Family Name"
            },
            givenName: {
              label: "Given Name"
            },
            nameIdentifier: {
              label: "Name Identifier",
              nameIdentifierScheme: {
                label: "Name Identifier Scheme"
              },
              schemeURI: {
                label: "Scheme URI"
              },
            },
          }
        },
        creators: {
          label: "Creators",
          creator: {
            label: "Creator",
            creatorName: {
              label: "Creator Name",
              nameType: {
                label: "Name Type",
                organizational: {
                  label: "Organizational",
                },
                personal: {
                  label: "Personal",
                },
              },
            },
            familyName: {
              label: "Family Name"
            },
            givenName: {
              label: "Given Name"
            },
            nameIdentifier: {
              label: "Name Identifier",
              nameIdentifierScheme: {
                label: "Name Identifier Scheme",
              },
              schemeURI: {
                label: "Scheme URI",
              },
            },
          },
        },
        dates: {
          label: "Dates",
          date: {
            label: "Date",
            dateInformation: {
              label: "Date Information",
            },
            dateType: {
              label: "Date Type",
            },
          },
        },
        descriptions: {
          label: "Descriptions",
          description: {
            label: "Description",
            descriptionType: {
              label: "Description Type"
            },
            xmlLang: {
              label: "Description Language"
            },
          },
        },
        formats: {
          label: "Formats",
          format: {
            label: "Format"
          },
        },
        fundingReferences: {
          label: "Funding References",
          fundingReference: {
            label: "Funding Reference",
            awardNumber: {
              label: "Award Number",
            },
            awardTitle: {
              label: "Award Title",
            },
            funderIdentifier: {
              label: "Funder Identifier",
              funderIdentifierType: {
                label: "Funder Identifier Type"
              },
            },
            funderName: {
              label: "Funder Name"
            },
          },
        },
        identifier: {
          label: "Identifier"
        },
        language: {
          label: "Language",
          en: "English",
          fr: "French",
        },
        publisher: {
          label: "Publisher"
        },
        publicationYear: {
          label: "Publication Year"
        },
        resourceType: {
          label: "Resource Type",
          resourceTypeGeneral: {
            label: "Resource Type General"
          },
        },
        relatedIdentifiers: {
          label: "Related Identifiers",
          relatedIdentifier: {
            label: "Related Identifier",
            relatedIdentifierType: {
              label: "Related Identifier Type",
            },
            relatedMetadataScheme: {
              label: "Related Metadata Scheme",
            },
            relationType: {
              label: "Relation Type",
            },
            schemeURI: {
              label: "Scheme URI",
            },
          },
        },
        rightsList: {
          label: "Rights List",
          rights: {
            label: "Rights",
            rightsURI: {
              label: "Rights URI",
            },
            xmlLang: {
              label: "Language",
            },
          },
        },
        sizes: {
          label: "Sizes",
          size: {
            label: "Size",
          },
        },
        subjects: {
          label: "Subjects",
          subject: {
            label: "Subject",
            schemeURI: {
              label: "Scheme URI"
            },
            subjectScheme: {
              label: "Subject Scheme"
            },
            xmlLang: {
              label: "Subject Language",
            },
          }
        },
        titles : {
          label: "Titles",
          title: {
            label: "Title",
            titleType: {
              label: "Title Type",
              AlternativeTitle: "Alternative Title",
              Other: "Other",
              Subtitle: "Subtitle",
              TranslatedTitle: "Translated Title",
            },
            xmlLang: {
              label: "Title Language",
            },
          }
        },
        version: {
          label: "Version",
        },
      }
    },
    search: 'Search',
    language: 'Language',
    loading: 'Loading...',
    loading_error: 'Error loading information:',
    settings: {
      label: 'Settings',
      update_password: 'Update Account Password',
      update_information: 'Update Account Information',
      password_prompt: 'Please enter and confirm a new password:',
    },
    help: {
      label: 'Help',
      title: 'Radiam Help',
      usermanual: {
        title: 'User Manual: ',
      },
      developers: {
        title: 'Developer Resources',
        text: 'Developers can consult the Readme file located in the source repository: '
      },
      email: {
        title: 'Email Support',
        text: 'For assistance using this specific installation of Radiam, please email: ',
      },
      agentinstallation: 'Agent Installation',
      download: {
        text: 'The downloads for the Radiam agent are here: ',
      }
    },
    auth: {
      username: 'Username',
      password: 'Password',
      forgot: 'Reset Password',
      sign_in: 'Sign In',
      email: 'Email',
      send_email: 'Send Confirmation',
      return_to_login: 'Return to Login Page',
      token: 'Token',
      new_password: 'New Password',
      confirm_password: 'Confirm Password',
    },
    theme: {
      name: 'Theme',
      light: 'Light',
      dark: 'Dark',
    },
    sidebar: {
      agents: 'Agents',
      data_collection_method: 'Data Collection Methods',
      data_collection_status: 'Data Collection Statuses',
      datasets: 'Datasets',
      distribution_restriction: 'Data Restriction Levels',
      grants: 'View Grants',
      groupmembers: 'Group Membership',
      groups: 'Groups',
      locations: 'Locations',
      locationtypes: 'Location Types',
      projects: 'Projects',
      projectavatars: 'Project Icons',
      roles: 'User Roles',
      sensitivity_level: 'Data Sensitivity Levels',
      users: 'Users',
    },
    dashboard: {
      agents: 'Agents',
      agent: {
        available_at: 'Download the Radiam agent for ',
        description:
          'Start adding files to Radiam by installing the Radiam Agent anywhere you would like to start tracking files.',
        link_text: 'Windows, Mac or Linux',
        subtitle: 'Install Agent',
      },
      projectCards: {
        statistics: 'View Stats',
        search: 'Search',
        folders: 'Folders',
      },
      fewUsers: {
        content: "",
        subtitle: "Groups With Few Users",
      },
      file_path: 'File Path',
      file_name: 'File Name',
      file_size: 'File Size',
      first_steps: {
        subtitle: 'Getting Started',
        admin: {
          content: 'Welcome!  The first thing you should do to get started is to create a Research Group.  Head over to the Groups tab on the left hand menu to create a new Research Group that will host your Project.',
        },
        user: {
          content: 'It seems that you aren\'t assigned to any Research Groups yet.  Contact your Group Administrator or Group Data Manager to have them add you to the appropriate Research Group.'
        },
      },
      grants: 'View Grants',
      groups: 'Groups',
      groupmembers: 'Group Membership',
      indexed: 'Indexed',
      locationtypes: 'Location Labels',
      location: 'Location',
      locations: 'Locations',
      projects: 'Projects',
      new_users: 'Recent Users',
      new_groups: 'Your Recent Groups',
      new_projects: 'Recently Updated Projects',
      recentfiles: 'Recently Added Files:',
      roles: 'User Roles',
      show_all: 'Show All',
      files: 'Files',
      updated: 'Updated',
      users: 'Users',
      welcome: {
        title: 'Radiam',
        subtitle: 'Welcome',
        content: 'Browse existing project data in the Projects sidebar, or see the most recently updated files below.',
        content2: 'Need Help?  Check out the ',
        usermanual: 'User Manual Here.',
      },
    },
    models: {
      generic: {
        id: 'ID',
        url: 'URL',
        active: 'Active?',
        date_starts: 'Access Starts At',
        date_created: 'Created At',
        date_updated: 'Last Updated',
        date_expires: 'Expires At',
        date_membership_expires: 'Group Membership Expires At',
      },
      agents: {
        user: 'User',
        remote_user: 'Known As',
        location: 'Location',
        remote_api_username: 'Remote API Username',
        remote_api_token: 'Remote API Token',
        crawl_minutes: 'Minutes between crawls',
        version: 'Agent Version',
        projects: 'Associated Project', 
        rootdir: 'Project Root Directory',
        remoteapiusername: 'Remote Username',
        remoteapitoken: 'Remote Token',
        active: 'Active?',
        project_name: 'Name of Project'
      },
      datasets: {
        data_abstract: 'Data Abstract',
        data_collection_method: 'Data Collection Methods',
        data_collection_status: 'Data Collection Status',
        distribution_restriction: 'Distribution Restrictions',
        project: 'Projects',
        sensitivity_level: 'Sensitivity Levels of Data',
        study_site: 'Study Site',
        title: 'Dataset Title',
      },
      data_collection_method: {
        label: 'Data Collection Methods',
      },
      data_collection_status: {
        label: 'Data Collection Status',
      },
      distribution_restriction: {
        label: 'Distribution Restriction',
      },
      filters: {
        search: "Search",
      },
      groups: {
        id: "Id",
        name: 'Group Name',
        active: 'Active',
        description: 'Description',
        parent_group: 'Parent Group',
      },
      groupmembers: {
        group: 'Group',
        role: 'Role',
        user: 'User',
      },
      grants: {
        dataset: 'Dataset',
        group: 'Group',
        project: 'Project',
        fields: 'Fields Granted Access',
      },
      locations: {
        display_name: 'Display Name',
        globus_endpoint: 'Globus Endpoint UUID',
        globus_path: 'Globus Path',
        host_name: 'Host Name',
        name: 'Name',
        notes: 'Notes',
        osf_project: 'OSF Project ID',
        portal_url: 'Portal Url',
        type: 'Location Type',
      },
      locationtypes: {
        label: 'Type of Location',
      },
      projects: {
        avatar: 'Project Icon',
        group: 'Group',
        keywords: 'Keywords',
        name: 'Project Name',
        name_help:
          'Give your project a name that will make it easy for others to find.',
        primary_contact_user: 'Primary Contact User',
        steps: {
          name: 'Project Name',
          researchgroup: 'Project Group',
          map: 'Project Locations',
        },
        title: 'Data Title',
      },
      project_avatars: {
        avatar_image: 'Project Icon',
        drop_image: 'Drop your image file here or click to choose one.',
        height: 'Height',
        width: 'Width',
      },
      roles: {
        label: 'Role Type',
        description: 'Description',
      },
      sensitivity_level: {
        label: 'Sensitivity Levels',
      },
      users: {
        fname: 'First Name',
        lname: 'Last Name',
        email: 'Email',
        username: 'Username',
        user_orcid_id: 'ORCID Identifier',
        notes: 'Notes',
        active: 'Active',
      },
    },

    //NOTE: these values are separate because of the data format that is sent down from the API in certain Label fields.
    menu: {
      logout: 'Logout',
    },

    group: {
      role: {
        admin: {
          label: 'Group Admin',
          description:
            'Group Administrators may Create Users, Groups, Locations, Projects, Datasets, View Grants and Agents, and add users to Group they are a Group Admin of.  They have full CRUD ability on any Project or Dataset that resides in a Group they administrate, and may create Group Grants and User Agents.',
        },
        datamanager: {
          label: 'Data Manager',
          description: 'Data Managers may view projects in all groups.',
        },

        member: {
          label: 'Member',
          description:
            'Regular users may create and view file level metadata in thier own groups.',
        },
      },
    },
    location: {
      type: {
        database: 'Database',
        desktop: 'Desktop',
        instrument: 'Instrument',
        laptop: 'Laptop',
        osf: 'OSF Project',
        portal: 'Portal',
        server: 'Server',
        other: 'Other',
      },
    },
    distribution: {
      restriction: {
        embargo: 'Embargo',
        needpermissionfromgovernment: 'Requires Governmental Permission',
        needpermissionfromindustry: 'Requires Industry Permission',
        needpermissionfromprincipal: 'Requires Principal Permission',
        projectmembersonly: 'For Project Members Only',
        none: 'None',
      },
    },
    sensitivity: {
      level: {
        governmentpartnership: 'Government Partnership',
        harmtopublic: 'Harm to Public',
        humansubjects: 'Human Subjects',
        industrypartnership: 'Industry Partnership',
        intellectualproperty: 'Intellectual Property',
        preexisting: 'Pre-Existing',
        none: 'None',
      },
    },
    datacollection: {
      method: {
        census: 'Census',
        fieldwork: 'Field Work',
        focusgroup: 'Focus Group',
        interview: 'Interview',
        labwork: 'Lab Work',
        modelling: 'Modelling',
        simulation: 'Simulation',
        survey: 'Survey',
        other: 'Other',
      },
      status: {
        complete: 'Complete',
        inprogress: 'In Progress',
        planned: 'Planned',
      },
    },
    validate: {
      datacollectionmethod: {
        label: 'A label is required for this data collection method',
      },
      datacollectionstatus: {
        label: 'A label is required for this data collection status',
      },
      dataset: {
        data_collection_method:
          'At least one data collection method is required for a project.',
        data_collection_status:
          'A data collection status is required for a project.',
        distribution_restriction:
          'The distribution restriction is required for a project.',
        sensitivity_level:
          'At least one sensitivity level is required for a project.',
        title: 'A title is required for this dataset.',
      },
      distributionrestriction: {
        label: 'A label is required for this distribution restriction',
      },
      group: {
        group_name: 'A group name is required to for the group.',
        description: 'A description is required for the group.',
      },
      groupmembers: {
        group: 'A group is required for a group membership.',
        role: 'A role is required for the user in this group.',
        user: 'A user is required to put into this group.',
      },
      locations: {
        globus_endpoint:
          'A Globus Endpoint UUID should look something like c99fd40c-5545-11e7-beb6-22000b9a448b. You can find the Globus Endpoint by going to https://globus.computecanada.ca/endpoints.',
        host_name: 'A host name is required for a location.',
        location_type: 'A type is required for a location',
      },
      locationtypes: {
        label: 'A label is required for this location type',
      },
      project: {
        avatar: 'A project icon is required for a project',
        group: 'A group is required for a project.',
        name: 'A name is required for a project.',
        primary_contact_user: 'A primary contact is required for a project.',
      },
      projectavatar: {
        avatar_image:
          'An image is required for a project icon. Please upload one.',
      },
      role: {
        label: 'A label is required for this role',
      },
      sensitivitylevel: {
        label: 'A label is required for this data sensitivity level',
      },
      user: {
        username: 'A username is required for this user.',
        email: 'A email is required for this user.',
        group: 'A Group is required if selecting a role.',
        role: 'A Role is required if selecting a group.',
      },
      useragents: {
        locations: 'A location is required for this agent.',
        user: 'A user is required for this agent.',
        version: 'Version Number is in format X.X.X ',
      },
    },
    warnings: {}
  },
};
