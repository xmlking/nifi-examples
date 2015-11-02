### Install Kafka (one time)
```bash
brew install kafka
```
#### To Start Zookeeper
```bash
zookeeper-server-start.sh ./kafka/zookeeper.properties
```

#### To Start Kafka
```bash
kafka-server-start.sh ./kafka/server.properties
```

#### Create Kafka Topic and partitioning (one time)
```bash
kafka-topics.sh --zookeeper localhost:2181 --create --topic maxwell --partitions 1 --replication-factor 1
```

#### List Kafka Topics
```bash
kafka-topics.sh --list --zookeeper localhost:2181
```

#### Display messages on a topic
```bash  
kafka-console-consumer.sh --zookeeper localhost:2181 --topic maxwell --from-beginning
```
    
*NOTE: stop Kafka first and then Zookeeper*