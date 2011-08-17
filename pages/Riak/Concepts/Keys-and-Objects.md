# Keys and Objects

In an RDBMS, data is organized by tables that are individually identifiable
objects. Within those tables, exist rows of a data organized into columns. It is
possible to retrive or update entire tables, individuals rows, or a group of
columns within a set of rows. This is in stark contrast to Riak, for which the
object is both the largest and smallest data element. When performing any
retrieval or update operation in Riak, the entire Riak object must be retrieved
or modified; there are no partial retrievals or updates.

## Keys

Riak keys are simply binary values used to identify Riak objects. To a client
getting and storing objects in Riak, each bucket appears to represent a separate
keyspace. It is important to understand that the storage backends have no
concept of a bucket (see: [[Buckets]]), as backend keys are a combination of
bucket name and key.

## Objects

Riak objects are identified by bucket and key and are composed of the following
parts: a bucket name, key, value, metadata, and vector clock. A single
bucket-key pair may have multiple sibling objects associated with it. These
siblings can occur within both a particular node and across multiple nodes. If
those values can be generationally ordered based on vector clock, the earlier
generations will be removed upon the read repair phase of a get operation. When
sibling values are found that cannot need reconciled generationally, the
requesting client will be returned all sibling values. The client can then
create a single successor object on its next put operation. For more
information, see [[Vector Clocks]].