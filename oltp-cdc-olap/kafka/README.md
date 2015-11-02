### Install Kafka
```bash
brew install kafka
```
#### To Start Zookeeper
    > zookeeper-server-start.sh ./kafka/zookeeper.properties
 
#### To Start Kafka
    > kafka-server-start.sh ./kafka/server.properties

#### Create Kafka Topic and partitioning (one time)
    > kafka-topics.sh --zookeeper localhost:2181 --create --topic maxwell --partitions 1 --replication-factor 1


#### List Kafka Topics
    > kafka-topics.sh --list --zookeeper localhost:2181

#### display messages on a topic
    
    > kafka-console-consumer.sh --zookeeper localhost:2181 --topic maxwell --from-beginning
    
    
NOTE: stop Kafka first and then Zookeeper