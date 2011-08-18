# Keys and Objects

In an RDBMS, data is organized by tables that are individually identifiable
objects. Within those tables, exist rows of a data organized into columns. It is
possible to retrive or update entire tables, individuals rows, or a group of
columns within a set of rows. In contrast, Riak has a simpler data model in
which the object is both the largest and smallest data element. When performing
any fetch or update operation in Riak, the entire Riak object must be retrieved
or modified; there are no partial fetches or updates.

## Keys

Riak keys are simply binary values used to identify Riak objects. From the
perspective of a client interacting with Riak, each bucket appears to represent
a separate keyspace. It is important to understand that Riak treats the
bucket-key pair as a single entity when performing fetch and store operations
(see: [[Buckets]]).

## Objects

Objects are the only unit of data storage in Riak. Riak objects are essentially
structs identified by bucket and key and composed of the following parts: a
bucket name, key, value, metadata, and vector clock. A single bucket-key pair
may have multiple sibling objects associated with it. These siblings can occur
within both a particular node and across multiple nodes, occurring when either
more than one actor updates an object, a network partition occurs, or a stale
vector clock is submitted when updating an object (see: [[Vector Clocks]]).