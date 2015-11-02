NiFi Examples
=================

Apache NiFi example flows.

#### collect-stream-logs

This [flow](./collect-stream-logs/) shows workflow for log collection, aggregation, store and display. 

1. Ingest logs from folders.
2. Listen for syslogs on UDP port.
3. Merge syslogs and drop-in logs and persist merged logs to Solr for historical search. 
4. Dashboard: stream real-time log events to dashboard and enable cross-filter search on historical logs data.


#### iot-activity-tracker

This [flow](./iot-activity-tracker/) shows how to bring IoT data into Enterprise.

1. Ingest IoT data over WebSocket and HTTP
3. Store all data to Hadoop(HDFS) and summary data to NoSQL(MarkLogic) for historical data search. 
4. Route data based on pre-set thresholds (vital signs like `pulse rate` and `blood pressure`) to alert users and physicians. 
5. Inactivity Reporting


#### oltp-to-olap

A low latency *Change Data Capture* [flow](./oltp-cdc-olap/) to continuously replicate data from OLTP(MySQL) to OLAP(NoSQL) systems with no impact to the source. 

1. Multi-tenant: can contain data from many different databases, support multiple consumers. 
2. Flexible CDC: Capture changes from many data sources and types. 
    1. Source consistency preservation. No impact to the source.
    2. Both DML (INSERT/UPDATE/DELETE) and DDL (ALTER/CREATE/DROP) are captured non invasively.
    3. Produce Logical Change Records (LCR) in JSON format. 
    4. Commits at the source are grouped by transaction.
3. Flexible Consumer Dataflows: consumer dataflows can be implemented in Apache NiFi, Flink, Spark or Apex 
    1. Parallel processing data filtering, transformation and loading.
4. Flexible Databus: store LCRs in **Kafka** streams for durability and pub-sub semantics. 
    1. Use *only* Kafka as input for all consumer dataflows.
    1. Feed data to many client types (real-time, slow/catch-up, full bootstrap).
    2. Consumption from an arbitrary time point in the change stream including full bootstrap capability of the entire data.
    3. Guaranteed in-commit-order and at-least-once delivery.
    4. Partitioned consumption (partitioned data to different Kafka topics based on database name, table or any field of LCR)
5. Both batch and near real time delivery.


#### csv-to-json

This [flow](./csv-to-json/) shows how to convert a CSV entry to a JSON document using ExtractText and ReplaceText.

#### decompression

This [flow](./decompression/) demonstrates taking an archive that is created with several levels of compression and then continuously 
decompressing it using a loop until the archived file is extracted out.

#### http-get-route

his [flow](./http-get-route/) pulls from a web service (example is nifi itself), extracts text from a specific section, makes a routing decision 
on that extracted value, prepares to write to disk using PutFile.

#### invoke-http-route

This [flow](./invoke-http-route/) demonstrates how to call an HTTP service based on an incoming FlowFile, and route the original FlowFile 
based on the status code returned from the invocation. In this example, every 30 seconds a FlowFile is produced, 
an attribute is added to the FlowFile that sets q=nifi, the google.com is invoked for that FlowFile, and any response 
with a 200 is routed to a relationship called 200.

#### retry-count-loop

This [process group](./retry/) can be used to maintain a count of how many times a flowfile goes through it. If it reaches some 
configured threshold it will route to a 'Limit Exceeded' relationship otherwise it will route to 'retry'. 
Great for processes which you only want to run X number of times before you give up.

#### split-route

This [flow](./split-route/) demonstrates splitting a file on line boundaries, routing the splits based on a regex in the content, 
merging the less important files together for storage somewhere, and sending the higher priority files down 
another path to take immediate action.

#### twitter-garden-hose

This [flow](./twitter-garden-hose/) pulls from Twitter using the garden hose setting; it pulls out some basic attributes from the Json and 
then routes only those items that are actually tweets.

#### twitter-solr

This [flow](./twitter-solr/) shows how to index tweets with Solr using NiFi. Pre-requisites for this flow are NiFi 0.3.0 or later, 
the creation of a Twitter application, and a running instance of Solr 5.1 or later with a tweets collection:


### Install NiFi
1. Manual: Download [Apache NiFi](https://nifi.apache.org/download.html) binaries and unpack to a folder. 
2. On Mac: `brew install nifi`

### Run NiFi
```bash
cd /Developer/Applications/nifi
./bin/nifi.sh  start
./bin/nifi.sh  stop
```
On Mac 
```bash
# nifi start|stop|run|restart|status|dump|install
nifi start 
nifi status  
nifi stop 
# Working Directory: /usr/local/Cellar/nifi/0.3.0/libexec
```