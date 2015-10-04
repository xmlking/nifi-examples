twitter-solr
============

This flow shows how to index tweets with Solr using NiFi. Pre-requisites for this flow are NiFi 0.3.0 or later, 
the creation of a Twitter application, and a running instance of Solr 5.1 or later with a tweets collection:


```bash
./bin/solr start -c
./bin/solr create_collection -c tweets -d data_driven_schema_configs -shards 1 -replicationFactor 1
```