# radiam-hubzero

Radiam component, module and plugin for HubZero

## Installation

Copy the com_radiam directory to your HubZero installation, in the components folder.  It will be located somewhere like `/var/www/hubname/app/components` so when you're done you have a new directory `/var/www/hubname/app/components/com_radiam`.

Copy the mod_radiam directory to your HubZero installation, in the modules folder.  It will be located somewhere like `/var/www/hubname/app/modules` so when you're done you have a new directory `/var/www/hubname/app/modules/mod_radiam`.

Copy the projects directory to your HubZero installation, in the plugins folder.  It will be located somewhere like `/var/www/hubname/app/plugins` so when you're done you have a new directory `/var/www/hubname/app/plugins/projects`. 

Copy the cron directory to your HubZero installation, in the plugins folder.  It will be located somewhere like `/var/www/hubname/app/plugins` so when you're done you have a new directory `/var/www/hubname/app/plugins/cron`. 

From the command line of your HubZero instance, initialize the Radiam database objects:

```
cd /var/www/hubname

# Dry run, see what will be done:
php muse migration
```

That command should list at least seven database migrations that will be run: two for the component, two for the module, three for the plugin.  If it looks OK, you can proceed:

```
# Full run this time
php muse migration -f
```

## Configuration

### Component Configuration

The component is installed and available to administrators after running the migration above.  

- Log into your HubZero administration section
- Click on the menu for Components and find Radiam in the list and click on it
- Edit the `radiam_host_url` setting to match where your Radiam instance is
- After the regular HubZero user log into the Radiam on HubZero, add new project to associate a Radiam project and a HubZero project

### Module Configuration

The module is installed but not available until you create an instance of it. There is an installed instance of the module. Administrator can publish it to make it available for endusers. 

- Log into your HubZero administration section
- Click on the menu Extensions -> Module Manager
- Select "mod_radiam" for the Type
- Click the check mark to publish the module instance

Administrator is free to edit the default Radiam module instance or delete it and create a new one. 

- Log into your HubZero administration section
- Click on the menu Extensions -> Module Manager
- Click the "+" sign to add a new module instance
- Scroll down to the `mod_radiam` module and click on the module name to bring up the Add Module form:
    - Title = Radiam
    - Show Title = show
    - Position = memberDashboard
    - Status = published
    - Access = public

### Plugin Configuration

There two radiam plugins installed, one for the cron type and one for the projects type. The plugins are installed and available to administrators after running the migration above. The projects/radiam plugin is used to monitor file system events. The cron/radiam plugsin is used to create a cron job to send metadata to the radiam server periodically. 

There is nothing to configure for the radiam plugin of the projects type.

For the radiam plugin of the cron type,

- Log into your HubZero administration section
- Click on the menu for Components and find Cron in the list and click on it
- Edit the `Post data to Radiam API` cron job to meet your needs 
- Publish the `Post data to Radiam API` cron job to start running the Radiam Agent on HubZero

## Viewing

As a regular HubZero user, navigate to your dashboard.  Add the Radiam module in your dashboard.

- Click on the Radiam Login button
- Log into Radiam with Radiam username and password

## Removal

### Component Removal

Remove the database tables and entension entries:

```
cd /var/www/hubname

php muse migration -d=down -e=com_radiam -f
```

Then delete the entire contents of the component:

```
cd /var/www/hubname/app/components

rm -rf com_radiam
```

### Module Removal

Remove the database tables and entension entries:

```
cd /var/www/hubname

php muse migration -d=down -e=mod_radiam -f
```

Then delete the entire contents of the component:

```
cd /var/www/hubname/app/modules

rm -rf mod_radiam
```

### Plugin Removal

Remove the database tables and entension entries:

```
cd /var/www/hubname

php muse migration -d=down -e=plg_cron_radiam -f
php muse migration -d=down -e=plg_projects_radiam -f
```

Then delete the entire contents of the component:

```
cd /var/www/hubname/app/plugins

rm -rf cron
rm -rf projects
```
