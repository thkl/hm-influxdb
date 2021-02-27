## hm-influxdb
is an addon for your ccu3 or rasberrymatic to automatic log datapoints into an influx database

### Installation
Download the addon and install it via system preferences on to your ccu

### Configuration

Open the settings page via plugin settings or http://ccuip:9501/ (please make sure the firewall at your ccu will not block this port)

First setup the influx db database:
* enter the host or ip of your database
* enter the database name (if the db not exists it will be created)
* enter username or password for your database server
* press the test button to check your connection
* if the addon is able to talk to our influx server you can save the connection data

Setup what to log:
* click on the ccu menu item
Here you have two options to select which data the addon is logging:

#### 1. Whitelist
With whitelist settings you are able to log all datapoints of one type. As an example: You want to log all temperatures so add an entry with .ACTUAL_TEMPERATURE.
In this case, every message form your devices which contains the datapoint with .ACTUAL_TEMPERATURE will be logged.

#### 2. Device specific
You can select specific datapoints from your devices. Please use the tree view to choose which datapoints you want to log

Please note: If an datapoint will be logged thru a whitelist entry u can't dissable the logging by the device view for this entry.

Please do not forget to save your settings.


### Internals

The addon will build a queue of 50 entries before it will save all these entries to the database. This is to prevent your network and influx server from frequent querys.
Due to this queue your logging entries may be delayed a little bit, but dont worrie the timestamp is correct.

The addon will also add device or channel names into a entry so you are able to identify your time series by the device name.

The current retention time for a database created by the addon are 30 days. This is a subject to change by a later version.


