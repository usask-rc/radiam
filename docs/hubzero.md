# Radiam Hubzero plugin

Radiam component and module for HubZero

## Installation

Copy the com_radiam directory to your HubZero installation, in the components folder.  It will be located somewhere like `/var/www/hubname/app/components` so when you're done you have a new directory `/var/www/hubname/app/components/com_radiam`.

Copy the mod_radiam directory to your HubZero installation, in the modules folder.  It will be located somewhere like `/var/www/hubname/app/modules` so when you're done you have a new directory `/var/www/hubname/app/modules/mod_radiam`.

Copy the projects directory to your HubZero installation, in the plugins folder.  It will be located somewhere like `/var/www/hubname/app/plugins` so when you're done you have a new directory `/var/www/hubname/app/plugins/projects`.

From the command line of your HubZero instance, initialize the Radiam database objects:

```
cd /var/www/hubname

# Dry run, see what will be done:
php muse migration
```

That command should list at least four database migrations that will be run: two for the component, one for the module, one for the plugin.  If it looks OK, you can proceed:

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

### Module Configuration

The module is installed but not available until you create an instance of it.

- Log into your HubZero administration section
- Click on the menu Extensions -> Module Manager
- Click the "+" sign to add a new module instance
- Scroll down to the `mod_radiam` module and click on the module name to bring up the Add Module form:
    - Title = Radiam
    - Show Title = show
    - Position = memberDashboard
    - Status = published
    - Access = public

## Viewing

As a regular HubZero user, navigate to your dashboard.  Add the Radiam module in your dashboard.


## Removal

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